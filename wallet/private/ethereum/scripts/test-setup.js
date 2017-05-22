module.exports = function (callback) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinV2 = artifacts.require("./SoarCoinV2.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
    let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");
    let SoarCoinImplementationV03 = artifacts.require("./SoarCoinImplementationV03.sol");

    let imp1 = undefined;
    let imp2 = undefined;
    let imp3 = undefined;

    let accounts = web3.eth.accounts;
    let events = [];

    SoarCoin.deployed().then(function (soarCoin) {
        console.log("accounts", accounts);
        console.log("SoarCoin", soarCoin.address);
        token = soarCoin;
        return SoarCoinImplementationV01.deployed()
    })
        .then(function (_sci01) {
            console.log("SoarCoinImplementationV01", _sci01.address);
            imp1 = _sci01;
            return SoarCoinImplementationV02.new(token.address, imp1.address, accounts[1]);
        })
        .then(function (_sci02) {
            console.log("SoarCoinImplementationV02", _sci02.address);
            imp2 = _sci02;

            return token.setImplementation(imp1.address);
        })
        .then(function () {
            return imp1.setTrustedContract(token.address);
        })
        .then(function () {
            web3.eth.sendTransaction({
                to: "0xa5fe10c21cd67a17239ead82bb2ecbf05f52b0f5",
                value: web3.toWei(10, "ether")
            });
            return token.transfer("0xa5fe10c21cd67a17239ead82bb2ecbf05f52b0f5", 4.5e9);
        })
        .then(function () {
            return token.setImplementation(imp2.address);
        })
        .then(function () {
            return imp1.setTrustedContract(imp2.address);
        })
        .then(function () {
            return imp2.setTrustedContract(token.address);
        })
        .then(function (tx) {
            return token.transfer(accounts[4], 5e8);
        })
        .then(function (tx) {
            return SoarCoinImplementationV03.new(token.address, imp2.address, accounts[1]);
        })
        .then(function (_sci03) {
            console.log("SoarCoinImplementationV03", _sci03.address);
            imp3 = _sci03;

            return token.setImplementation(imp3.address);
        })
        .then(function () {
            return SoarCoinV2.new(imp3.address);
        })
        .then(function (_t2) {
            tokenV2 = _t2;
            return imp3.addTrustedCaller(tokenV2.address);
        })
        .then(function (tx) {
            return imp2.setTrustedContract(imp3.address);
        })
        .then(function (tx) {
            imp1.totalSupply().then((ts) => console.log("total supply v01", ts.toString(10)));
            imp2.totalSupply().then((ts) => console.log("total supply v02", ts.toString(10)));
            imp3.totalSupply().then((ts) => console.log("total supply v03", ts.toString(10)));
            token.totalSupply().then((ts) => console.log("total supply coin", ts.toString(10)));
            tokenV2.totalSupply().then((ts) => console.log("total supply coin V2", ts.toString(10)));
            token.balanceOf(accounts[0]).then((b) => console.log("balance of owner", b.toFormat(0)));
            token.balanceOf(accounts[4]).then((b) => console.log("balance of acc 4", b.toFormat(0)));
            token.balanceOf(accounts[5]).then((b) => console.log("balance of acc 5", b.toFormat(0)));
            console.log("token", token.address);
            console.log("token2", tokenV2.address);
            console.log("imp1", imp1.address);
            console.log("imp2", imp2.address);
            console.log("imp3", imp3.address);
        })
        .catch(function (error) {
            console.log(error);
        });
}