
module.exports = function(callback) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinImplementation = artifacts.require("./SoarCoinImplementationV10.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");

    let token = undefined;
    let tokenImpl = undefined;
    let prevImpl = undefined;

    let accounts = web3.eth.accounts;
    let events;


    SoarCoin.deployed().then(function (soarCoin) {
        console.log("accounts", accounts);
        token = soarCoin;
        return SoarCoinImplementationV01.new(500000000000000)
    }).then(function (_sci01) {
        prevImpl = _sci01;
        console.log("old SoarCoinImplementation", _sci01.address);
        return SoarCoinImplementation.new(_sci01.address, accounts[0], accounts[1], accounts[2], 1000);
    }).then(function (soarCoinImpl) {
        console.log("new SoarCoinImplementation", soarCoinImpl.address);
        tokenImpl = soarCoinImpl;

        events = tokenImpl.allEvents();
// watch for changes
        events.watch(function(error, event){
            if (!error)
                console.log(event);
        });

        token.setImplementation(tokenImpl.address);
        tokenImpl.setTrustedContract(token.address);
        return prevImpl.setTrustedContract(tokenImpl.address);
    }).then(function (tx) {
        return Promise.all([
            token.getImplementation(),
            tokenImpl.trustedContract(),
            prevImpl.trustedContract(),
            token.balanceOf(accounts[0]),
            tokenImpl.balanceOf(accounts[0]),
            prevImpl.balanceOf(accounts[0]),
        ]);
    }).then(function (res) {
        console.log("************************************************************")
        console.log("implementation", res[0], tokenImpl.address);
        console.log("trusted contract", res[1], token.address);
        console.log("previous trusted contract", res[2], tokenImpl.address);

        console.log("owner balance token", res[3].toFormat(2));
        console.log("owner balance impl token", res[4].toFormat(2));
        console.log("owner balance prev impl token", res[5].toFormat(2));

        return Promise.all([
            token.transfer(accounts[5], res[3].dividedBy(2).toString(), {from: accounts[0]}),
            token.balanceOf(accounts[0]),
            prevImpl.balanceOf(accounts[0]),
            token.balanceOf(accounts[5])
        ])
    }).then(function (res) {
        console.log("************************************************************")
        console.log("owner balance token", res[1].toFormat(2));
        console.log("owner balance prev token", res[2].toFormat(2));
        console.log("recipient balance token", res[3].toFormat(2));

        setTimeout(()=>events.stopWatching(), 1000);

        callback();
    });
}