let BigNumber  = require("bignumber.js");

module.exports = function(callback) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinImplementation = artifacts.require("./SoarCoinImplementationV10.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");

    let accounts = web3.eth.accounts;
    let token = null;

    SoarCoin.deployed().then(function (soarCoin) {
        token = soarCoin;
        return soarCoin.balanceOf(accounts[0]);
    }).then(function (result) {
        console.log(result.toFormat(0));
        return token.getImplementation();
    }).then(function (result) {
        console.log(result.toString());
        let amount = new BigNumber("100000000000000000000000000");
        console.log(amount.toFormat(0))
        return token.transfer("0x906b1a95de096675a8866d5ab06f433764ace1dc", amount.toString()
            , {from: accounts[0]});
    }).then(function (result) {
        console.log(result);
    }).catch(function (error) {
        console.log(error);
    });
}