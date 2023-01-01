// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./NFTCollection.sol";

contract TheCoin is ERC20, Ownable {
    uint256 public unitsOneEthCanBuy  = 100;
    uint256 public coinsToBuyOneEgg = 5;
    uint256 public coinSupply  = 100000;
    address public tokenOwner;         // the owner of the token
    mapping(address => uint256) private _balances;

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

    function buyEgg() public onlyOwner returns (uint) {
        require(balanceOf(msg.sender) >= coinsToBuyOneEgg, "Not enough coins");

        _balances[msg.sender] = balanceOf(msg.sender) - coinsToBuyOneEgg;
        coinSupply = coinSupply - coinsToBuyOneEgg;
        return NFTCollection(tokenOwner).buyEgg();
    }
}