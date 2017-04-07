let SoarCoin = artifacts.require("./SoarCoin.sol");
let SoarCoinImplementation = artifacts.require("./SoarCoinImplementation.sol");

module.exports = function (deployer) {
    deployer.deploy(SoarCoinImplementation);

    deployer.then(function () {
        SoarCoin.new()

    })
};
