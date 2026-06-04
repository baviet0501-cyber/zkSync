// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Greeter
 * @author zkSync dApp
 * @notice A simple contract demonstrating zkSync Era EVM compatibility.
 *         This contract stores and retrieves a greeting message on-chain.
 *         On zkSync Era, this contract benefits from:
 *         - Lower gas fees (transaction compression)
 *         - Fast finality (~1 second)
 *         - Ethereum-level security via ZK-rollup validity proofs
 * 
 * @dev This contract works identically on Ethereum L1 and zkSync Era L2.
 *      No modifications needed for zkSync compatibility.
 */
contract Greeter {
    /// @notice The stored greeting message
    string private greeting;

    /// @notice Deployer of the contract
    address public owner;

    /// @notice Timestamp of the last greeting update
    uint256 public lastUpdated;

    /// @notice Address that last updated the greeting
    address public lastUpdater;

    /// @notice Emitted when the greeting is updated
    event GreetingChanged(
        address indexed changer,
        string newGreeting,
        uint256 timestamp
    );

    /// @notice Emitted when the contract is deployed
    event ContractDeployed(
        address indexed deployer,
        string initialGreeting,
        uint256 timestamp
    );

    /**
     * @notice Contract constructor
     * @param _greeting The initial greeting message
     */
    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender;
        lastUpdater = msg.sender;
        lastUpdated = block.timestamp;

        emit ContractDeployed(msg.sender, _greeting, block.timestamp);
        emit GreetingChanged(msg.sender, _greeting, block.timestamp);
    }

    /**
     * @notice Returns the current greeting
     * @return The stored greeting string
     */
    function greet() public view returns (string memory) {
        return greeting;
    }

    /**
     * @notice Updates the greeting message
     * @param _greeting The new greeting message
     */
    function setGreeting(string memory _greeting) public {
        require(bytes(_greeting).length > 0, "Greeting cannot be empty");
        require(
            bytes(_greeting).length <= 256,
            "Greeting too long (max 256 chars)"
        );

        greeting = _greeting;
        lastUpdater = msg.sender;
        lastUpdated = block.timestamp;

        emit GreetingChanged(msg.sender, _greeting, block.timestamp);
    }

    /**
     * @notice Check if the caller is the owner
     * @param _address Address to check
     * @return True if the address is the owner
     */
    function isOwner(address _address) public view returns (bool) {
        return _address == owner;
    }

    /**
     * @notice Get contract info
     * @return ownerAddress Deployer of the contract
     * @return updaterAddress Address that last updated the greeting
     * @return currentGreeting Current greeting message
     * @return updatedAt Last update timestamp
     * @return chainId Block chain ID (on zkSync Era, this will return the L2 chain ID)
     */
    function getInfo()
        public
        view
        returns (
            address ownerAddress,
            address updaterAddress,
            string memory currentGreeting,
            uint256 updatedAt,
            uint256 chainId
        )
    {
        return (owner, lastUpdater, greeting, lastUpdated, block.chainid);
    }
}
