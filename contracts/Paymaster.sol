// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @dev zkSync bootloader formal address on L2.
address payable constant BOOTLOADER_FORMAL_ADDRESS = payable(
    address(0x0000000000000000000000000000000000008001)
);

/// @dev zkSync EIP-712 transaction type used by Account Abstraction.
uint256 constant EIP_712_TX_TYPE = 0x71;

enum ExecutionResult {
    Revert,
    Success
}

/// @notice Structure used by zkSync Era bootloader when calling paymasters.
struct Transaction {
    uint256 txType;
    uint256 from;
    uint256 to;
    uint256 gasLimit;
    uint256 gasPerPubdataByteLimit;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    uint256 paymaster;
    uint256 nonce;
    uint256 value;
    uint256[4] reserved;
    bytes data;
    bytes signature;
    bytes32[] factoryDeps;
    bytes paymasterInput;
    bytes reservedDynamic;
}

interface IPaymaster {
    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable returns (bytes4 magic, bytes memory context);

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable;
}

interface IPaymasterFlow {
    function approvalBased(
        address _token,
        uint256 _minAllowance,
        bytes calldata _innerInput
    ) external;

    function general(bytes calldata _input) external;
}

bytes4 constant PAYMASTER_VALIDATION_SUCCESS_MAGIC =
    IPaymaster.validateAndPayForPaymasterTransaction.selector;

/**
 * @title Paymaster
 * @author zkSync dApp
 * @notice zkSync Era approval-based Paymaster that lets users pay transaction gas
 *         with the deployed SimpleToken instead of holding ETH in their wallet.
 * @dev The contract must be funded with ETH so it can pay the bootloader. The
 *      bootloader grants this paymaster ERC20 allowance through the
 *      approvalBased paymaster flow, then this contract collects the token fee.
 */
contract Paymaster is IPaymaster {
    using SafeERC20 for IERC20;

    /// @notice The ERC20 token accepted as gas payment.
    address public acceptedToken;

    /// @notice Owner of the paymaster.
    address public owner;

    /// @notice Token charge multiplier, scaled by 1 ether. 1 ether means 1:1.
    uint256 public gasPriceMultiplier;

    /// @notice Total ETH forwarded to the bootloader for sponsored gas.
    uint256 public totalGasSponsored;

    /// @notice Total ERC20 tokens collected as gas payment.
    uint256 public totalTokensCollected;

    event GasPaidInTokens(
        address indexed user,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 timestamp
    );

    event PaymasterFunded(address indexed sender, uint256 amount);
    event GasPriceMultiplierUpdated(uint256 multiplier);
    event TokensWithdrawn(address indexed to, uint256 amount);
    event EthWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyBootloader() {
        require(msg.sender == BOOTLOADER_FORMAL_ADDRESS, "Only bootloader");
        _;
    }

    constructor(address _acceptedToken) {
        require(_acceptedToken != address(0), "Token is zero address");
        acceptedToken = _acceptedToken;
        owner = msg.sender;
        gasPriceMultiplier = 1 ether;
    }

    receive() external payable {
        emit PaymasterFunded(msg.sender, msg.value);
    }

    /**
     * @notice Set token/ETH gas fee multiplier. 1 ether means 1 token unit per
     *         1 wei of max gas cost for an 18-decimal ERC20.
     */
    function setGasPriceMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier > 0, "Multiplier is zero");
        gasPriceMultiplier = _multiplier;
        emit GasPriceMultiplierUpdated(_multiplier);
    }

    /**
     * @notice Called by zkSync bootloader before executing a paymaster tx.
     */
    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable override onlyBootloader returns (bytes4 magic, bytes memory context) {
        require(_transaction.txType == EIP_712_TX_TYPE, "Unsupported tx type");
        require(_transaction.paymasterInput.length >= 4, "Invalid paymaster input");

        bytes4 selector = bytes4(_transaction.paymasterInput[0:4]);
        require(selector == IPaymasterFlow.approvalBased.selector, "Use approvalBased flow");

        (address token, , ) = abi.decode(
            _transaction.paymasterInput[4:],
            (address, uint256, bytes)
        );
        require(token == acceptedToken, "Unsupported token");

        address user = address(uint160(_transaction.from));
        uint256 ethFee = _transaction.maxFeePerGas * _transaction.gasLimit;
        uint256 tokenFee = quoteTokenFee(ethFee);
        uint256 collectedTokenFee = 0;

        require(address(this).balance >= ethFee, "Paymaster has no ETH");

        IERC20 tokenContract = IERC20(acceptedToken);
        if (
            tokenContract.balanceOf(user) >= tokenFee &&
            tokenContract.allowance(user, address(this)) >= tokenFee
        ) {
            tokenContract.safeTransferFrom(user, address(this), tokenFee);
            collectedTokenFee = tokenFee;
        }

        (bool success, ) = BOOTLOADER_FORMAL_ADDRESS.call{value: ethFee}("");
        require(success, "Bootloader payment failed");

        totalGasSponsored += ethFee;
        totalTokensCollected += collectedTokenFee;

        emit GasPaidInTokens(user, collectedTokenFee, ethFee, block.timestamp);

        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        context = abi.encode(user, collectedTokenFee, ethFee);
    }

    /**
     * @notice zkSync bootloader callback after execution. Refund handling is
     *         intentionally kept as a no-op for this demo paymaster.
     */
    function postTransaction(
        bytes calldata,
        Transaction calldata,
        bytes32,
        bytes32,
        ExecutionResult,
        uint256
    ) external payable override onlyBootloader {}

    /**
     * @notice Convert an ETH-denominated max fee into accepted-token units.
     */
    function quoteTokenFee(uint256 ethFee) public view returns (uint256) {
        return (ethFee * gasPriceMultiplier) / 1 ether;
    }

    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        IERC20(acceptedToken).safeTransfer(to, amount);
        emit TokensWithdrawn(to, amount);
    }

    function withdrawETH(address payable to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH withdrawal failed");
        emit EthWithdrawn(to, amount);
    }

    /**
     * @notice Get paymaster info used by the frontend and report demo.
     */
    function getPaymasterInfo()
        external
        view
        returns (address token, address paymasterOwner, uint256 multiplier)
    {
        return (acceptedToken, owner, gasPriceMultiplier);
    }

    function getPaymasterStats()
        external
        view
        returns (uint256 ethBalance, uint256 sponsored, uint256 collected)
    {
        return (address(this).balance, totalGasSponsored, totalTokensCollected);
    }
}
