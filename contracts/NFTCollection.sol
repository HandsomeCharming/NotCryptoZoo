//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract NFTCollection is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    // The max number of NFTs in the collection
    uint public constant MAX_SUPPLY = 10000;
    // The mint price for the collection
    uint public constant PRICE = 0.00001 ether;
    // The max number of mints per wallet
    uint public constant MAX_PER_MINT = 5;
    
    address public tokenOwner;         // the owner of the initial tokens
    address public coinAddress;

    uint nonce = 0;

    string public baseTokenURI;

    constructor(string memory baseURI, string memory name, string memory symbol) ERC721(name, symbol) {
        setBaseURI(baseURI);
        tokenOwner = msg.sender;       // address of the token owner
    }

    function setCoinAddress(address _coinAddress) public {
        require(msg.sender == tokenOwner, "Owner only");
        coinAddress = _coinAddress;
    }

    function getOwnerAddress() public view returns (address) {
        return tokenOwner;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function random() public returns(uint) {
        nonce += 1;
        return uint(keccak256(abi.encodePacked(nonce)));
    }

    function getNewTokenId(uint tokenNum) internal returns (uint) {
        uint newTokenID = _tokenIds.current();
        newTokenID <<= 16;
        newTokenID += tokenNum;
        return newTokenID;
    }

    function buyOneEgg(address buyer) external returns (uint) {
        require(msg.sender == coinAddress, "Sender is not coin contract address");
        uint tokenCounts = _tokenIds.current();
        require(tokenCounts <= MAX_SUPPLY - 1, "This collection is sold out!");

        uint newTokenID = getNewTokenId(0);

        _safeMint(buyer, newTokenID);
        _tokenIds.increment();
        return newTokenID;
    }

    // return new token id
    function hatchEgg(uint tokenId) public returns (uint) {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "Is not owner");

        uint tokenNum = tokenId & 0xf;
        require(tokenNum == 0, "Is not egg");
        uint newTokenNum = random() % 3 + 1;
        uint newTokenId = getNewTokenId(newTokenNum);

        _safeMint(msg.sender, newTokenId);
        transferFrom(msg.sender, tokenOwner, tokenId);
        _tokenIds.increment();
        return newTokenId;
    }

    function yeetAnimal(uint tokenId) public {
        transferFrom(msg.sender, tokenOwner, tokenId);
    }

    function getBreededTokenNum(uint tokenNum1, uint tokenNum2) internal returns (uint) {
        if (tokenNum1 + tokenNum2 <= 3) {
            return 4;
        }
        if (tokenNum1 + tokenNum2 == 5) {
            return 6;
        }
        return 5;
    }

    function breed(uint tokenId1, uint tokenId2) public returns (uint) {
        address owner1 = ownerOf(tokenId1);
        address owner2 = ownerOf(tokenId2);
        require(msg.sender == owner1, "Is not owner");
        require(owner1 == owner2, "You don't own both animals");

        uint tokenNum1 = tokenId1 & 0xf;
        uint tokenNum2 = tokenId2 & 0xf;
        require(tokenNum1 != 0 && tokenNum2 != 0, "Can't breed egg!");
        require(tokenNum1 != tokenNum2, "Can't breed same animal!");
        uint newTokenNum = getBreededTokenNum(tokenNum1, tokenNum2);
        uint newTokenId = getNewTokenId(newTokenNum);

        _safeMint(msg.sender, newTokenId);
        _tokenIds.increment();
        return newTokenId;
    }

    function mintNFTs(uint _count) public payable {
        uint totalMinted = _tokenIds.current();

        require(totalMinted.add(_count) <= MAX_SUPPLY, "This collection is sold out!");
        require(_count >0 && _count <= MAX_PER_MINT, "You have received the maximum amount of NFTs allowed.");
        require(msg.value >= PRICE.mul(_count), "Not enough ether to purchase NFTs.");

        for (uint i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
    }

    function _mintSingleNFT() private {
        uint newTokenID = _tokenIds.current();
        newTokenID <<= 16;
        uint randomId = random();
        newTokenID += randomId % 3;
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint tokenNum = tokenId & 0xf;
        require(tokenNum >= 0 && tokenNum < 7, "Token invalid!");
        if (tokenNum == 0) return "https://drive.google.com/uc?id=1Z7qoht6P2jMedlCsfZB9zCFj80l2bnbr";
        if (tokenNum == 1) return "https://drive.google.com/uc?id=1VELnxUlBJWaiBOnfz1HAGqBJfF8pG6j2";
        if (tokenNum == 2) return "https://drive.google.com/uc?id=1BIfI2hx2vjgpjCwSN3NK96IVpd6lXAY8";
        if (tokenNum == 3) return "https://drive.google.com/uc?id=1dLG8JxIx3_SqNek9IRTslD_JZdn1apcZ";
        if (tokenNum == 4) return "https://drive.google.com/uc?id=1Mt6cUjPpRnaQyG2A-UfrGTOTjgJXkqVL";
        if (tokenNum == 5) return "https://drive.google.com/uc?id=1ktvo8jKmT4DMaE6oiJ4QS7easxAtw5RV";
        if (tokenNum == 6) return "https://drive.google.com/uc?id=1dhmQFirSmMO4aIWMRbBLBoey_bxoVZhL";
        return "notEgg";
    }
    
    // Returns the ids of the NFTs owned by the wallet address
    function tokensOfOwner(address _owner) external view returns (uint[] memory) {
        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }
    
    // Withdraw the ether in the contract
    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }

    // Reserve NFTs only for owner to mint for free
    function reserveNFTs(uint _count) public onlyOwner {
        uint totalMinted = _tokenIds.current();

        require(totalMinted.add(_count) < MAX_SUPPLY, "Not enough NFTs left to reserve");

        for (uint i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
    }
}

