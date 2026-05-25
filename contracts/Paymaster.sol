// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Paymaster
 * @author zkSync dApp
 * @notice Demonstrates zkSync's native Account Abstraction feature.
 *         A Paymaster allows users to pay transaction gas fees in ERC20 tokens
 *         instead of ETH. This is one of the key advantages of zkSync Era.
 * 
 * @dev This is a simplified Paymaster contract for educational purposes.
 *      In production, use zkSync's IPaymaster interface properly.
 * 
 * HOW IT WORKS:
 * 1. User creates a transaction with a paymaster input
 * 2. zkSync protocol calls the Paymaster's validateAndPayForPaymasterTransaction
 * 3. Paymaster deducts gas fee in its own token (or sponsors the tx)
 * 4. Protocol executes the transaction
 * 5. Benefits: Users don't need ETH for gas, dApps can sponsor user transactions
 */
contract Paymaster {
    /// @notice The token this paymaster accepts for gas payments
    address public acceptedToken;

    /// @notice Owner of the paymaster
    address public owner;

    /// @notice Price per gas in the accepted token (relative to ETH)
    uint256 public gasPriceMultiplier;

    /// @notice Event emitted when gas is paid in tokens
    event GasPaidInTokens(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _acceptedToken) {
        acceptedToken = _acceptedToken;
        owner = msg.sender;
        gasPriceMultiplier = 1 ether; // 1:1 ratio with ETH
    }

    /**
     * @notice Set the gas price multiplier
     * @param _multiplier New multiplier value
     */
    function setGasPriceMultiplier(uint256 _multiplier) external onlyOwner {
        gasPriceMultiplier = _multiplier;
    }

    /**
     * @notice Get paymaster info
     */
    function getPaymasterInfo()
        external
        view
        returns (address token, address paymasterOwner, uint256 multiplier)
    {
        return (acceptedToken, owner, gasPriceMultiplier);
    }
}
