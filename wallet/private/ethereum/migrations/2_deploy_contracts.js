let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinImplementationV10 = artifacts.require("./SoarCoinImplementationV10.sol");
let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");

module.exports = function (deployer, network) {
    let sci01 = undefined;
    let sci10 = undefined;
    let sc = undefined;

    deployer.deploy(SoarCoin);
    deployer.deploy(SoarCoinImplementationV01, 500000000000000);

    deployer.then(function () {
        return SoarCoinImplementationV01.deployed();
    }).then((_sci01) => {
        sci01 = _sci01;
        return SoarCoinImplementationV10.new(_sci01.address, web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[9], 750);
    }).then((_sci10) => {
        sci10 = _sci10;
        return SoarCoin.deployed();
    }).then((_sc) => {
        sc = _sc;
        return Promise.all([
            sc.setImplementation(sci10.address),
            sci10.setTrustedContract(sc.address),
            sci01.setTrustedContract(sci10.address)
        ]);
    }).then((res) => {
        sci01.totalSupply().then((ts) => console.log("total supply v01", ts.toString()));
        // sci10.totalSupply().then((ts) => console.log("total supply v10", ts.toString()));
        sc.totalSupply().then((ts) => console.log("total supply coin", ts.toString()));
        web3.eth.sendTransaction({
            from: web3.eth.accounts[2],
            to: "0xf42756721dda2c66ef4ff38c93c87002b6fde88f",
            value: "1000000000000000000"
        })
        return sc.transfer("0x906b1a95de096675a8866d5ab06f433764ace1dc", "50000000");
    }).then(() => {
        sc.balanceOf(web3.eth.accounts[0]).then(balance => console.log("owner balance", balance.toString(10)))
        sc.balanceOf("0x906b1a95de096675a8866d5ab06f433764ace1dc").then(balance => console.log("wallet balance", balance.toString(10)))
        console.log("eth balance", web3.eth.getBalance("0x906b1a95de096675a8866d5ab06f433764ace1dc").toString(10));
    })
};
