let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");

let exec = require("truffle-require");

module.exports = function (deployer, network) {
    let sci01 = undefined;
    let sci02 = undefined;
    let sc = undefined;

    web3.personal.unlockAccount(web3.eth.accounts[0], "ppp", 3600);

    deployer.deploy(SoarCoin);
    deployer.deploy(SoarCoinImplementationV01, 500000000000000);

    deployer.then(function () {
        return SoarCoin.deployed();
    }).then((_sc) => {
        sc = _sc;
        return SoarCoinImplementationV01.deployed();
    }).then((_sci01) => {
        sci01 = _sci01;
        return deployer.deploy(SoarCoinImplementationV02, sc.address, sci01.address,
            "0xf42756721dda2c66ef4ff38c93c87002b6fde88f");
    }).catch(function (error) {
        console.log(error);
    })
};
