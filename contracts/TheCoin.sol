// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./NFTCollection.sol";

contract TheCoin is ERC20, Ownable {
    uint256 public unitsOneEthCanBuy  = 100;
    uint256 public coinsToBuyOneEgg = 5;
    uint256 public coinSupply  = 100000;
    address public tokenOwner;         // the owner of the token
    address public nftAddress;
    mapping(address => uint) public lastUpdateTime;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        tokenOwner = msg.sender;       // address of the token owner
        // Mint 100000 tokens to msg.sender
        // Similar to how
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        _mint(msg.sender, coinSupply * 10 ** uint(decimals()));
    }

    // this function is called when someone sends ether to the 
    // token contract
    receive() external payable {        
        // msg.value (in Wei) is the ether sent to the 
        // token contract
        // msg.sender is the account that sends the ether to the 
        // token contract
        // amount is the token bought by the sender
        uint256 amount = msg.value * unitsOneEthCanBuy;
        // ensure you have enough tokens to sell
        require(balanceOf(tokenOwner) >= amount, 
            "Not enough tokens");
        // transfer the token to the buyer
        _transfer(tokenOwner, msg.sender, amount);
        // emit an event to inform of the transfer        
        emit Transfer(tokenOwner, msg.sender, amount);
        
        // send the ether earned to the token owner
        payable(tokenOwner).transfer(msg.value);
    }

    function setNFTAddress(address _nftAddress) public {
        require(msg.sender == tokenOwner);
        nftAddress = _nftAddress;
    }

    function buyEgg() public returns (uint) {
        require(balanceOf(msg.sender) >= coinsToBuyOneEgg, "Not enough coins");

        _transfer(msg.sender, tokenOwner, coinsToBuyOneEgg);
        return NFTCollection(nftAddress).buyOneEgg(msg.sender);
    }

    function getPassiveIncome() public {
        uint curTime = block.timestamp;
        uint lastTime = lastUpdateTime[msg.sender];
        require(curTime - lastTime > 10, "Too soon to get passive income again!");

        uint[] memory tokens = NFTCollection(nftAddress).tokensOfOwner(msg.sender);
        uint tokenSize = tokens.length;
        _transfer(tokenOwner, msg.sender, tokenSize);
        lastUpdateTime[msg.sender] = curTime;
    }
}