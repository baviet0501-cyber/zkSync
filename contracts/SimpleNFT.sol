// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SimpleNFT
 * @author zkSync dApp
 * @notice An ERC-721 NFT contract deployed on zkSync Era demonstrating:
 *         - Low-cost NFT minting (80-90% cheaper than L1)
 *         - Full ERC-721 metadata standard
 *         - Public minting with supply cap
 *
 * @dev Demonstrates how NFTs work on zkSync Era L2 with minimal gas fees.
 *      Users can mint NFTs for a fraction of the cost on Ethereum L1.
 */
contract SimpleNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    /// @notice Maximum supply cap
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice Current token ID counter
    uint256 private _nextTokenId;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Timestamp of contract deployment
    uint256 public deploymentTime;

    /// @notice Timestamp of the most recent NFT mint
    uint256 public lastMintedAt;

    /// @notice Total tokens minted (not just current supply, including burned)
    uint256 public totalMinted;

    /// @notice Mapping from token ID to creator address
    mapping(uint256 => address) public creators;

    /// @notice Explicit token metadata URI saved at mint time
    mapping(uint256 => string) private _explicitTokenURIs;

    /// @notice Event emitted when an NFT is minted
    event NFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        string tokenURI,
        uint256 timestamp
    );

    /**
     * @notice Constructor initializes the NFT collection
     * @param _name Collection name
     * @param _symbol Collection symbol
     * @param _baseURI Base URI for token metadata (can be empty)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        _baseTokenURI = _baseURI;
        deploymentTime = block.timestamp;
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a new NFT
     * @param to Recipient address
     * @param uri Token URI for metadata
     * @return tokenId The minted token ID
     */
    function mintNFT(address to, string memory uri) public returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(uri).length > 0, "URI cannot be empty");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        totalMinted++;
        lastMintedAt = block.timestamp;

        _safeMint(to, tokenId);
        _explicitTokenURIs[tokenId] = uri;
        creators[tokenId] = msg.sender;

        emit NFTCreated(tokenId, msg.sender, to, uri, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Mint an NFT with a predefined token URI based on token ID
     * @param to Recipient address
     * @return tokenId The minted token ID
     */
    function mintDefaultNFT(address to) public returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        totalMinted++;
        lastMintedAt = block.timestamp;

        string memory uri = string(
            abi.encodePacked(
                _baseTokenURI,
                Strings.toString(tokenId),
                ".json"
            )
        );

        _safeMint(to, tokenId);
        _explicitTokenURIs[tokenId] = uri;
        creators[tokenId] = msg.sender;

        emit NFTCreated(tokenId, msg.sender, to, uri, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    /**
     * @notice Get the creator of a token
     * @param tokenId Token ID to query
     * @return Creator address
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return creators[tokenId];
    }

    /**
     * @notice Get collection info
     * @return collectionName Collection name
     * @return collectionSymbol Collection symbol
     * @return maxSupply Maximum supply
     * @return currentSupply Current total supply
     * @return mintedCount Total minted so far
     * @return deployTime Deployment timestamp
     * @return lastMintTime Timestamp of the most recent mint
     */
    function getCollectionInfo()
        public
        view
        returns (
            string memory collectionName,
            string memory collectionSymbol,
            uint256 maxSupply,
            uint256 currentSupply,
            uint256 mintedCount,
            uint256 deployTime,
            uint256 lastMintTime
        )
    {
        return (
            this.name(),
            this.symbol(),
            MAX_SUPPLY,
            this.totalSupply(),
            totalMinted,
            deploymentTime,
            lastMintedAt
        );
    }

    /**
     * @notice Check if a token exists
     * @param tokenId Token ID to check
     * @return True if the token exists
     */
    function tokenExists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ==========================================================================
    // Overrides required by Solidity
    // ==========================================================================

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address previousOwner = super._update(to, tokenId, auth);
        if (to == address(0)) {
            delete _explicitTokenURIs[tokenId];
        }
        return previousOwner;
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _explicitTokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Set a new base URI (owner only)
     * @param _uri New base URI
     */
    function setBaseURI(string memory _uri) public onlyOwner {
        _baseTokenURI = _uri;
    }

    /**
     * @notice Get the base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
