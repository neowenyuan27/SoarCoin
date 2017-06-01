module.exports = function (callback) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let accounts = web3.eth.accounts;
    let token = null;

    SoarCoin.deployed().then(function (soarCoin) {
        token = soarCoin;
    })
        .then(() => token.transfer("0xf42756721dda2c66ef4ff38c93c87002b6fde88f", 5000000000))
        .then(() => token.transfer("0x906b1a95de096675a8866d5ab06f433764ace1dc", 5000000000))
        .catch((error) => console.log(error))
}