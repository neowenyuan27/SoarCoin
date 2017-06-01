module.exports = function (callback) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
    let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");

    let token = undefined;
    let tokenImpl = undefined;
    let prevImpl = undefined;

    let accounts = web3.eth.accounts;
    let events = [];

    let ownerBalance = null;
    let totalSupply = null;

    SoarCoin.deployed().then(function (soarCoin) {
        console.log("accounts", accounts);
        console.log("SoarCoin", soarCoin.address);
        token = soarCoin;
        return SoarCoinImplementationV01.deployed()
    })
        .then(function (_sci01) {
            console.log("SoarCoinImplementationV01", _sci01.address);
            prevImpl = _sci01;
            return SoarCoinImplementationV02.deployed();
        })
        .then(function (_sci02) {
            console.log("SoarCoinImplementationV02", _sci02.address);
            tokenImpl = _sci02;

            events.push(tokenImpl.Transfer((error, transfer) => {
                console.log(error, transfer);
            }));
            events.push(tokenImpl.Migration((error, migration) => {
                console.log(error, migration);
            }));

            return token.setImplementation(tokenImpl.address);
        })
        .then(function () {
            return prevImpl.setTrustedContract(tokenImpl.address);
        })
        .then(function () {
            return tokenImpl.setTrustedContract(token.address);
        })
        .then(function () {
            return tokenImpl.setOracle("0xf42756721dda2c66ef4ff38c93c87002b6fde88f");
        })
        .then(function () {
            return web3.eth.sendTransaction({
                from: accounts[0],
                to: "0xf42756721dda2c66ef4ff38c93c87002b6fde88f",
                value: 5000000000000000000
            });
        })
        .then(function () {
            return token.transfer("0xa5fe10c21cd67a17239ead82bb2ecbf05f52b0f5", 5000000000);
        })
        .then(function (tx) {
            prevImpl.totalSupply().then((ts) => console.log("total supply v01", ts.toString(10)));
            tokenImpl.totalSupply().then((ts) => console.log("total supply v02", ts.toString(10)));
            token.totalSupply().then((ts) => console.log("total supply coin", ts.toString(10)));

            return token.transfer("0x4ba1bcd7ddfbb8257a6a6168eb393e700bbc1e58", 500000000000);
        })
        .then((tx) => {
            console.log(tx);
            return Promise.all([
                token.balanceOf(accounts[0]),
                token.balanceOf("0xa5fe10c21cd67a17239ead82bb2ecbf05f52b0f5"),
                token.balanceOf("0x4ba1bcd7ddfbb8257a6a6168eb393e700bbc1e58"),
            ])
        })
        .then((res) => {
            console.log("owner", res[0].toString(10), "recipient", res[1].toString(10));
            setTimeout(() => events.forEach((event) => event.stopWatching()), 2000);
            callback();
        })
}