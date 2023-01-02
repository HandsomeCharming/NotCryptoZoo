var NFTCollection = artifacts.require("./NFTCollection.sol");
var TheCoin = artifacts.require("./TheCoin.sol");

module.exports = async (deployer) => {
  await deployer.deploy(NFTCollection,"URI HERE", "Animals", "ANI");
  await deployer.deploy(TheCoin, "The Coin", "COI");
  nftInstance = await NFTCollection.deployed();
  coinInstance = await TheCoin.deployed();
  await coinInstance.setNFTAddress(nftInstance.address)
  await nftInstance.setCoinAddress(coinInstance.address)
};
