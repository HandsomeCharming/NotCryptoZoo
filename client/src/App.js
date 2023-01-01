import React, { Component } from "react";
import Web3 from 'web3';
import "./App.css";
import { useEffect, useState } from 'react';
import './App.css';
import contract from './contracts/NFTCollection.json';

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
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
    } else {
      console.log("No authorized account found");
    }
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

  const listNFTHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Get network provider and web3 instance.
        const web3 = await new Web3('http://localhost:7545');

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        console.log("Network: ", await web3.eth.net.getId());
        console.log("Yeet:", contract.networks[await web3.eth.net.getId()]);
        const contractAddress = contract.networks[await web3.eth.net.getId()].address;
        const abi = contract.abi;

        // Create a contract instance
        const nftContract = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContract);
        console.log("Showing nfts ");
        console.log("Account 0 ", accounts[0]);

        let nftTxn = await nftContract.methods.tokensOfOwner(accounts[0]).call({ from: accounts[0], gas: 120000 })

        console.log("Showing...please wait");
        console.log("Result: ", nftTxn);

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

        console.log("Network: ", await web3.eth.net.getId());
        console.log("Yeet:", contract.networks[await web3.eth.net.getId()]);
        const contractAddress = contract.networks[await web3.eth.net.getId()].address;
        const abi = contract.abi;

        // Create a contract instance
        const nftContract = new web3.eth.Contract(abi, contractAddress);
        console.log(nftContract);
        console.log("Initialize payment");
        console.log("Account 0 ", accounts[0]);


        let gas = await nftContract.methods.mintNFTs(1).estimateGas({from: accounts[0], value: web3.utils.toWei("0.0001", "ether")});
        console.log("GAS: ", gas);

        let nftTxn = await nftContract.methods.mintNFTs(1).send({ from: accounts[0], value: web3.utils.toWei("0.0001", "ether"), gas: 500000 }).on('receipt', function () {
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

  const buttons = () => {
    return (
      <div className='main-app-buttons'>
        {mintNftButton()}
        {showNftsButton()}
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