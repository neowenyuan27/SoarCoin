let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");

let exec = require("truffle-require");

module.exports = function (deployer, network) {
    let sci01 = undefined;
    let sci02 = undefined;
    let sc = undefined;

    deployer.deploy(SoarCoin);
    deployer.deploy(SoarCoinImplementationV01, 500000000000000);

    deployer.then(function () {
        return SoarCoin.deployed();
    }).then((_sc) => {
        sc = _sc;
        return SoarCoinImplementationV01.deployed();
    }).then((_sci01) => {
        sci01 = _sci01;
        return deployer.deploy(SoarCoinImplementationV02, _sci01.address, web3.eth.accounts[1]);
    }).catch(function (error) {
        console.log(error);
    })
};
