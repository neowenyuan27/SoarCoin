let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinImplementationV10 = artifacts.require("./SoarCoinImplementationV10.sol");
let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");

module.exports = function (deployer) {
    let sci01 = undefined;
    let sci10 = undefined;
    let sc = undefined;

    deployer.deploy(SoarCoin);

    deployer.then(function () {
        return SoarCoinImplementationV01.new(500000000000000);
    }).then((_sci01) => {
        sci01 = _sci01;
        return SoarCoinImplementationV10.new(_sci01.address, web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[9], 750);
    }).then((_sci10) => {
        sci10 = _sci10;
        return SoarCoin.deployed();
    }).then((_sc) => {
        sc = _sc;
        sc.setImplementation(sci10.address);
        sci10.setTrustedContract(sc.address);
        sci01.totalSupply().then((ts) => console.log("total supply v01", ts.toString()));
        sci10.totalSupply().then((ts) => console.log("total supply v10", ts.toString()));
        sc.totalSupply().then((ts) => console.log("total supply coin", ts.toString()));
    })
};
