// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @author zkSync dApp
 * @notice An ERC20 token deployed on zkSync Era demonstrating:
 *         - Lower transaction fees (80-90% cheaper than L1)
 *         - Native account abstraction (users can pay gas in this token via Paymaster)
 *         - Fast confirmations (~1 second block time on zkSync Era)
 * 
 * @dev Demonstrates how standard ERC20 tokens work on zkSync Era L2.
 *      Tokens can be bridged between L1 Ethereum and L2 zkSync via the zkSync bridge.
 */
contract SimpleToken is ERC20, ERC20Burnable, Ownable {
    /// @notice Maximum supply cap (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    /// @notice Timestamp of contract deployment
    uint256 public deploymentTime;

    /// @notice Total tokens burned
    uint256 public totalBurned;

    /// @notice Event emitted when tokens are minted
    event TokensMinted(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Event emitted when tokens are transferred to L1 via bridge
    event BridgedToL1(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Constructor initializes the token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply to mint to deployer
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(
            _initialSupply <= MAX_SUPPLY,
            "Initial supply exceeds max supply"
        );

        deploymentTime = block.timestamp;
        _mint(msg.sender, _initialSupply);

        emit TokensMinted(msg.sender, _initialSupply, block.timestamp);
    }

    /**
     * @notice Mint new tokens (owner only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mintTokens(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount, block.timestamp);
    }

    /**
     * @notice Override burn to track total burned
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
    }

    /**
     * @notice Override burnFrom to track total burned
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        totalBurned += amount;
    }

    /**
     * @notice Get token info
     * @return tokenName Token name
     * @return tokenSymbol Token symbol
     * @return totalTokenSupply Total supply
     * @return maxSupply Maximum supply cap
     * @return deployTime Deployment timestamp
     * @return burned Total burned so far
     */
    function getTokenInfo()
        public
        view
        returns (
            string memory tokenName,
            string memory tokenSymbol,
            uint256 totalTokenSupply,
            uint256 maxSupply,
            uint256 deployTime,
            uint256 burned
        )
    {
        return (
            this.name(),
            this.symbol(),
            this.totalSupply(),
            MAX_SUPPLY,
            deploymentTime,
            totalBurned
        );
    }
}
