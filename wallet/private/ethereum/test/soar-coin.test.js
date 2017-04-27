contract("SoarCoin", function (accounts) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
    let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");
    let token = undefined;
    let tokenImpl = undefined;
    let prevTokenImpl = undefined;
    // let accounts = web3.eth.accounts;

    /**
     * set the contract instances
     */
    before(function (done) {
        SoarCoin.deployed().then(function (soarCoin) {
            console.log("SoarCoin", soarCoin.address);
            token = soarCoin;
            return SoarCoinImplementationV01.deployed()
        })
            .then(function (_sci01) {
                console.log("SoarCoinImplementationV01", _sci01.address);
                prevTokenImpl = _sci01;
                return SoarCoinImplementationV02.deployed();
            })
            .then(function (_sci02) {
                console.log("SoarCoinImplementationV02", _sci02.address);
                tokenImpl = _sci02;

                return token.setImplementation(tokenImpl.address);
            })
            .then(function () {
                return prevTokenImpl.setTrustedContract(tokenImpl.address);
            })
            .then(function () {
                return tokenImpl.setTrustedContract(token.address);
            })
            .then(function (tx) {
                prevTokenImpl.totalSupply().then((ts) => console.log("total supply v01", ts.toString(10)));
                tokenImpl.totalSupply().then((ts) => console.log("total supply v02", ts.toString(10)));
                token.totalSupply().then((ts) => console.log("total supply coin", ts.toString(10)));
                done();
            })
            .catch(function (error) {
                console.log(error);
                done();
            });
    });

    it(accounts[0] + " is the owner of the token contract", function () {
        return token.owner()
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
                return tokenImpl.owner()
            })
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
                return prevTokenImpl.owner()
            })
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
            })
    });

    it("the token is the trusted contract in the implementation", function () {
        return tokenImpl.trustedContract()
            .then((trustedContract) => {
                assert.equal(trustedContract, token.address, "the trustedContract address must be the token's");
            })
    });

    it("the token implementation is the trusted contract in the previous implementation", function () {
        return prevTokenImpl.trustedContract()
            .then((trustedContract) => {
                assert.equal(trustedContract, tokenImpl.address, "the trustedContract address must be the token's");
            })
    });

    it("the implementation is registered with the token", function () {
        return token.getImplementation()
            .then((implementationAddress) => {
                assert.equal(implementationAddress, tokenImpl.address, "the implementation address must be the new implementation");
            })
    });

    it("gets the totalSupply from the token and tokenImplementation", function () {
        return Promise.all([tokenImpl.totalSupply(), token.totalSupply()])
            .then((totalSupply) => {
                assert.equal(totalSupply[0].comparedTo(totalSupply[1]), 0, "the total supply must be identical");
                assert.notEqual(totalSupply[0].toNumber(), 0, "total supply must be non zero");
            })
            .catch((err) => {
                assert.fail(err);
            })
    });

    it("has the TokenImplementationV01 contract address as the previous token implementation", function () {
        return tokenImpl.previousImplementation()
            .then((implementation) => assert.equal(prevTokenImpl.address, implementation,
                "the implementation contract must be the v01 implementation"));
    });

    it("has the tokenImplementation contract address as the token contract", function () {
        return token.getImplementation()
            .then((implementation) => assert.equal(tokenImpl.address, implementation,
                "the implementation contract must be the v02 implementation"));
    });

    it("has the trusted contract address as the token contract", function () {
        return tokenImpl.trustedContract()
            .then((trustedContract) => assert.equal(token.address, trustedContract,
                "the trusted contract must be the token address"));
    });

    it("has the totalSupply as the balance ofthe owner", function () {
        return Promise.all([token.totalSupply(), token.balanceOf(accounts[0])])
            .then((values) => {
                assert.equal(values[0].toNumber(), values[1].toNumber(),
                    "the balance of the owner is not equal to the toal supply ");
            })
    });

    it("does not change the balance when a transfer is made on the tokenImplementation", function () {
        let sender = accounts[0];
        let watcher = tokenImpl.UnauthorizedCall();
        let transfered;

        return token.balanceOf(sender).then((balamce) => {
            transfered = balamce.dividedBy(2).toString();
            return tokenImpl.transfer(accounts[0], accounts[1], transfered, {
                from: sender,
                gas: 100000
            })
        })
            .then((tx) => Promise.all([
                watcher.get(),
                token.totalSupply(),
                token.balanceOf(accounts[0]),
                token.balanceOf(accounts[1])]
            ))
            .then(function (res) {
                let event = res[0][0];
                let tokenSupply = res[1];
                let ownerBalance = res[2];
                let recipientBalance = res[3];
                assert.equal(event.event, "UnauthorizedCall", "the event name must be UnauthorizedCall");
                assert.equal(tokenSupply.toNumber(), ownerBalance.toNumber());
                assert.equal(recipientBalance.toNumber(), 0);
            })
    });

    it("changes the balance when a transfer is made on the token", function () {
        let transfered;
        let sender = accounts[0];
        let recipient = accounts[2];
        let watcher = tokenImpl.Transfer();

        return token.balanceOf(sender).then((balance) => {
            transfered = balance.dividedBy(2).toString();
            return token.transfer(recipient, transfered, {
                from: sender
            })
        })
            .then((tx) => Promise.all([
                watcher.get(),
                token.totalSupply(),
                token.balanceOf(sender),
                token.balanceOf(recipient)]
            ))
            .then(function (res) {
                let event = res[0][0];

                let tokenSupply = res[1];
                let ownerBalance = res[2];
                let recipientBalance = res[3];
                assert.isDefined(event, "an event is expected");
                assert.equal(event.event, "Transfer", "the event name must be Transfer");
                assert.equal(tokenSupply.toNumber(), ownerBalance.plus(transfered).toNumber(), "totalSupply must be the owner balance + transfered amount");
                assert.equal(recipientBalance.comparedTo(transfered), 0, recipient + " must have received the transfered amount");
            })

    });

    it("does mint new tokens when called from the correct address", function () {
        let ownerBalance = null;
        let totalSupply = null;
        let sender = accounts[0];

        return token.balanceOf(accounts[0])
            .then((balance) => {
                ownerBalance = balance;
                return token.totalSupply();
            })
            .then((supply) => {
                totalSupply = supply;
                return tokenImpl.mint(500000000000000, {
                    from: sender
                });
            })
            .then(() => token.balanceOf(accounts[0]))
            .then((newBalance) => {
                assert.equal(ownerBalance.add("500000000000000").toString(10), newBalance.toString(10));
            })

    });

    it("does not mint new tokens when called from the wrong address", function () {
        let ownerBalance = null;
        let totalSupply = null;

        return token.balanceOf(accounts[0])
            .then((balance) => {
                ownerBalance = balance;
                return token.totalSupply();
            })
            .then((supply) => {
                totalSupply = supply;
                return tokenImpl.mint(500000000000000, {
                    from: accounts[1]
                });
            })
            .then(() => assert.fail("an error should be thrown"))
            .catch((error) => assert.isOk(error, "there should be an error"))
    });

    it("does not change the owner when called from an incorrect address", function () {
        return token.owner()
            .then((owner) => {
                assert.equal(owner.toString(), accounts[0], "initially the owner is " + accounts[0]);
                return token.transferOwnership(accounts[3], {
                    from: accounts[1]
                })
            })
            .then((tx) => assert.fail("there must be an exception"))
            .catch((error) => {
                return Promise.all([
                    token.balanceOf(accounts[0]),
                    token.balanceOf(accounts[3]),
                    token.owner(),
                ])
                .then((res) => {
                    let ownerBalance = res[0];
                    let recipientBalance = res[1];
                    let owner = res[2];

                    assert.equal(owner.toString(), accounts[0]);
                    assert.equal(ownerBalance.comparedTo(0), 1, "nothing has been transfered");
                    assert.equal(recipientBalance.comparedTo(0), 0, "nothing has been transfered");
                });
            })
    });

    it("does change the owner when called from the correct address", function () {
        return token.owner()
            .then((owner) => {
                assert.equal(owner.toString(), accounts[0], "initially the owner is " + accounts[0]);
                return token.transferOwnership(accounts[3], {
                    from: accounts[0]
                })
            })
            .then((tx) => {
                return Promise.all([
                    tokenImpl.balanceOf(accounts[0]),
                    tokenImpl.balanceOf(accounts[3]),
                    token.owner(),
                ]);
            })
            .then((res) => {
                let ownerBalance = res[0];
                let recipientBalance = res[1];
                let owner = res[2];

                assert.equal(ownerBalance.comparedTo(0), 0, "everything has been transfered " + ownerBalance.toString(10));
                assert.equal(recipientBalance.comparedTo(0), 1, "everything has been transfered");
                assert.equal(owner.toString(), accounts[3], "new owner is " + accounts[3]);
            })
            .catch((error) => {
                console.log(error);
                assert.fail("there should be no error");
            })
    });

    it("does change ownership of implementation", function () {
        return tokenImpl.transferOwnership(accounts[3], {
            from: accounts[0]
        })
            .then((tx) => tokenImpl.owner())
            .then((owner) => assert.equal(owner, accounts[3], "the new owner is " + accounts[3]));
    })

});