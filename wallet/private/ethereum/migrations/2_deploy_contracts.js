let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinV2 = artifacts.require("./SoarCoinV2.sol");
let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");
let SoarCoinImplementationV03 = artifacts.require("./SoarCoinImplementationV03.sol");

let exec = require("truffle-require");

module.exports = function (deployer, network, accounts) {
    let sci01 = undefined;
    let sci02 = undefined;
    let sc = undefined;

    deployer.deploy(SoarCoin);
    deployer.deploy(SoarCoinImplementationV01, 500000000000000);

    // deployer.exec("../scripts/set-links.js");

    /*deployer.then(function () {
        return SoarCoin.deployed();
    }).then((_sc) => {
        sc = _sc;
        return SoarCoinImplementationV01.deployed();
    }).then((_sci01) => {
        sci01 = _sci01;
     return sci01.totalSupply();
     }).then(totalSupply => {
     deployer.deploy(SoarCoinImplementationV02, sc.address, sci01.address, accounts[4]);
     return SoarCoinImplementationV02.deployed();
     }).then(_sci02 => {
     sci02 = _sci02;
     return sci02.totalSupply();
     }).then(totalSupply => {
     return deployer.deploy(SoarCoinImplementationV03, sc.address, _sci02.address, accounts[4]);
    }).catch(function (error) {
        console.log(error);
     })*/
};
