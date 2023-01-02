import React, { Component } from "react";
import Web3 from 'web3';
import "./App.css";
import { useEffect, useState } from 'react';
import './App.css';
import nftContract from './contracts/NFTCollection.json';
import coinContract from './contracts/TheCoin.json';

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  var nftTokens = null;
  var selectedTokenIndexes = new Set();
  const selectedClass = "selected";
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      let balance = await getBalanceForPlayer();
      updateCoinBalance(balance);
    } else {
      console.log("No authorized account found");
    }
  }

  function getTokenOwnerAccount(accounts) {
    return accounts[0]
  }

  function getPlayerAccount(accounts) {
    return accounts[1]
  }

  function updateCoinBalance(balance) {
    console.log(balance)
    document.getElementById("balanceHeader").innerHTML = "The coin balance: " + balance;
  }

  async function getBalanceForPlayer() {
        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = coinContract.networks[await web3.eth.net.getId()].address;
        const abi = coinContract.abi;

        // Create a contract instance
        const coinContractInstance = new web3.eth.Contract(abi, contractAddress);

        var balance = await coinContractInstance.methods.balanceOf(account).call({ from: account, gas: 120000 })
        console.log("Balance: ", balance);

        updateCoinBalance(balance);
        return balance;
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  function selectNFTHandler() {
    let index = parseInt(this.id.slice(3));
    console.log("YEET" + index);
    let isSelected = (this.className === "");
    if (isSelected) {
      this.className = selectedClass;
      selectedTokenIndexes.add(index);
    } else {
      this.className = "";
      selectedTokenIndexes.delete(index);
    }
  }

  const listNFTHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = nftContract.networks[await web3.eth.net.getId()].address;
        const abi = nftContract.abi;

        // Create a nftContract instance
        const nftContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContractInstance);
        console.log("Showing nfts ");
        console.log("Account ", account);

        selectedTokenIndexes.clear();

        let tokens = await nftContractInstance.methods.tokensOfOwner(account).call({ from: account, gas: 120000 });

        console.log("Showing...please wait");
        console.log("Result: ", tokens);

        let imageContents = document.getElementById('imageContents');
        imageContents.innerHTML = '';
        nftTokens = tokens;

        var i = 0;
        for (const tokenId of nftTokens) {
          //console.log(tokenId);
          let tokenUri = await (nftContractInstance.methods.tokenURI(tokenId).call({ from: account, gas: 120000 }));
          //console.log(tokenUri);
          var img = document.createElement('input');
          img.src = tokenUri; //"https://static01.nyt.com/images/2019/02/05/world/05egg/15xp-egg-promo-superJumbo-v2.jpg";
          img.type = "image";
          img.width = 250;
          img.height = 250;
          img.id = "img" + i;
          img.addEventListener('click', selectNFTHandler);

          imageContents.appendChild(img);
          i = i + 1;
        }

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = nftContract.networks[await web3.eth.net.getId()].address;
        const abi = nftContract.abi;

        // Create a nftContract instance
        const nftContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContractInstance);
        console.log("Initialize payment");
        console.log("Account 0 ", account);

        let nftTxn = await nftContractInstance.methods.mintNFTs(1).send({ from: account, value: web3.utils.toWei("0.0001", "ether"), gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Mining...please wait");
        console.log("Mined: ", nftTxn.transactionHash);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const buyCoinHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)
        console.log(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = coinContract.networks[await web3.eth.net.getId()].address;
        const abi = coinContract.abi;

        // Create a contract instance
        const coinContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(coinContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let send = await web3.eth.sendTransaction({from:account, to:contractAddress, value:web3.utils.toWei("1", "ether")});

        let balance = await getBalanceForPlayer();
        updateCoinBalance(balance);

        console.log("Buying...please wait");
        console.log("Mined: ", send);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const buyEggHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = coinContract.networks[await web3.eth.net.getId()].address;
        const abi = coinContract.abi;

        // Create a contract instance
        const coinContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(coinContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let txn = await coinContractInstance.methods.buyEgg().send({ from: account, gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Buying...please wait");
        console.log("Mined: ", txn);

        listNFTHandler()
        let balance = await getBalanceForPlayer();
        updateCoinBalance(balance);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const hatchEggHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        if (selectedTokenIndexes.size != 1) {
          console.log("Need to only select 1 egg");
          return;
        }
        let selectedTokenIndex = selectedTokenIndexes.values().next().value;
        let selectedToken = nftTokens[selectedTokenIndex]
        console.log("Hatching " + selectedToken)
        if (selectedToken & 0xf != 0) {
          console.log("It's not egg");
          return;
        }

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = nftContract.networks[await web3.eth.net.getId()].address;
        const abi = nftContract.abi;

        // Create a contract instance
        const nftContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let newTokenId = await nftContractInstance.methods.hatchEgg(selectedToken).send({ from: account, gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Hatching...please wait");
        console.log("Mined: ", newTokenId);

        listNFTHandler()
        let balance = getBalanceForPlayer()
        updateCoinBalance(balance)
      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const breedHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        if (selectedTokenIndexes.size != 2) {
          console.log("Need to only select 2 animals");
          return;
        }
        let selectedIterator = selectedTokenIndexes.values();
        let selectedTokenIndex1 = selectedIterator.next().value;
        let selectedTokenIndex2 = selectedIterator.next().value;
        let selectedToken1 = nftTokens[selectedTokenIndex1]
        let selectedToken2 = nftTokens[selectedTokenIndex2]
        console.log("Breeding " + selectedToken1 + " and " + selectedToken2)
        if (selectedToken1 & 0xf == 0 || selectedToken2 & 0xf == 0) {
          console.log("Cannot breed egg");
          return;
        }
        console.log("Token num 1 " + (selectedToken1 & 0xf))
        console.log("Token num 2 " + (selectedToken2 & 0xf))

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = nftContract.networks[await web3.eth.net.getId()].address;
        const abi = nftContract.abi;

        // Create a contract instance
        const nftContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let newTokenId = await nftContractInstance.methods.breed(selectedToken1, selectedToken2).send({ from: account, gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Breeding...please wait");
        console.log("Mined: ", newTokenId);

        listNFTHandler()
        let balance = getBalanceForPlayer()
        updateCoinBalance(balance)
      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const getPassiveIncomeHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = coinContract.networks[await web3.eth.net.getId()].address;
        const abi = coinContract.abi;

        // Create a contract instance
        const coinContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(coinContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let txn = await coinContractInstance.methods.getPassiveIncome().send({ from: account, gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Mined: ", txn);

        let balance = await getBalanceForPlayer();
        updateCoinBalance(balance);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const yeetAnimalHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        if (selectedTokenIndexes.size != 1) {
          console.log("Need to only select 1 egg");
          return;
        }
        let selectedTokenIndex = selectedTokenIndexes.values().next().value;
        let selectedToken = nftTokens[selectedTokenIndex]
        console.log("Yeeting " + selectedToken)
        if (selectedToken & 0xf == 0) {
          console.log("It's not animal");
          return;
        }

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const account = getPlayerAccount(accounts)

        console.log("Network: ", await web3.eth.net.getId());
        const contractAddress = nftContract.networks[await web3.eth.net.getId()].address;
        const abi = nftContract.abi;

        // Create a contract instance
        const nftContractInstance = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContractInstance);
        console.log("Initialize payment");
        console.log("Account ", account);

        let newTokenId = await nftContractInstance.methods.yeetAnimal(selectedToken).send({ from: account, gas: 500000 }).on('receipt', function () {
          console.log('receipt')
        });

        console.log("Yeeting...please wait");
        console.log("Mined: ", newTokenId);

        listNFTHandler()
        let balance = getBalanceForPlayer()
        updateCoinBalance(balance)
      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }

  const showNftsButton = () => {
    return (
      <button onClick={listNFTHandler} className='cta-button show-nfts-button'>
        Show NFTs
      </button>
    )
  }

  const showBuyCoinsButton = () => {
    return (
      <button onClick={buyCoinHandler} className='cta-button buy-coins-button'>
        Buy Coins
      </button>
    )
  }

  const showBuyEggButton = () => {
    return (
      <button onClick={buyEggHandler} className='cta-button buy-egg-button'>
        Buy Egg
      </button>
    )
  }

  const showHatchEggButton = () => {
    return (
      <button onClick={hatchEggHandler} className='cta-button hatch-egg-button'>
        Hatch Egg
      </button>
    )
  }

  const showBreedEggButton = () => {
    return (
      <button onClick={breedHandler} className='cta-button breed-button'>
        Breed
      </button>
    )
  }

  const showPassiveIncomeButton = () => {
    return (
      <button onClick={getPassiveIncomeHandler} className='cta-button passive-income-button'>
        Get Passive Income LMAO
      </button>
    )
  }

  const yeetAnimalButton = () => {
    return (
      <button onClick={yeetAnimalHandler} className='cta-button yeet-Animal-button'>
        Yeet Animal
      </button>
    )
  }

  const buttons = () => {
    return (
      <div className='main-app-buttons'>
        <h1 id="balanceHeader">The coin balance: 0</h1>
        {mintNftButton()}
        {showNftsButton()}
        {showBuyCoinsButton()}
        {showBuyEggButton()}
        {showHatchEggButton()}
        {showBreedEggButton()}
        {showPassiveIncomeButton()}
        {yeetAnimalButton()}
        <div id="imageContents"></div>
      </div>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='App'>
      <div className='main-app'>
          {currentAccount ? buttons() : connectWalletButton()}
        </div>
      </div>
  )
}

export default App;