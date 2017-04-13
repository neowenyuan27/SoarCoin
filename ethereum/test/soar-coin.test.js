contract("SoarCoin", function (accounts) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinImplementation = artifacts.require("./SoarCoinImplementationV10.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
    let token = undefined;
    let tokenImpl = undefined;
    let prevTokenImpl = undefined;
    // let accounts = web3.eth.accounts;

    /**
     * set the contract instances
     */
    before(function () {
        return SoarCoin.deployed().then(function (soarCoin) {
            console.log("accounts", accounts);
            token = soarCoin;
            console.log("SoarCoin.deployed");
            return SoarCoinImplementationV01.new(500000000000000)
        }).then(function (_sci01) {
            prevTokenImpl = _sci01;
            console.log("before SoarCoinImplementation.new");
            return SoarCoinImplementation.new(_sci01.address, accounts[0], accounts[1], accounts[9], 1000);
        }).then(function (soarCoinImpl) {
            tokenImpl = soarCoinImpl;
            return prevTokenImpl.setTrustedContract(tokenImpl.address);
        }).then(function (tx) {
            console.log("before setImplementation");
            token.setImplementation(tokenImpl.address);
            console.log("before setTrustedContract");
            tokenImpl.setTrustedContract(token.address);
        });
    });

    it("the token is the trusted contract in the implementation", function(){
        return tokenImpl.trustedContract()
            .then((trustedContract) => {
                assert.equal(trustedContract, token.address, "the trustedContract address must be the token's");
            })
    });

    it("the token implementation is the trusted contract in the previous implementation", function(){
        return prevTokenImpl.trustedContract()
            .then((trustedContract) => {
                assert.equal(trustedContract, tokenImpl.address, "the trustedContract address must be the token's");
            })
    });

    it("the implementation is registered with the token", function(){
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

    it("has the totalSupply as the balance ofthe owner", function () {
        return Promise.all([token.totalSupply(), token.balanceOf(accounts[0])])
            .then((values) => {
                assert.equal(values[0].toNumber(), values[1].toNumber(),
                    "the balance of the owner is not equal to the toal supply ");
            })
    });

    it("has the trusted contract address as the token contract", function () {
        return tokenImpl.trustedContract()
            .then((trustedContract) => assert.equal(token.address, trustedContract,
                "the trusted contract must be the token address"));
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

        return token.balanceOf(sender).then((balamce) => {
            transfered = balamce.dividedBy(2).toString();
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

    it("does not change the owner when called from an incorrect address", function (done) {
        let watcher = tokenImpl.Transfer();
        let unauthorized = token.NotOwner();
        return token.owner((owner) => {
            assert.equal(owner.toString(), accounts[1], "initially the owner is " + accounts[0]);
            return token.transferOwnership(accounts[3], {
                from: accounts[1]
            })
        })
            .then((tx) => Promise.all([
                watcher.get(),
                token.balanceOf(accounts[0]),
                token.balanceOf(accounts[3]),
                token.owner(),
                unauthorized.get(),
            ]))
            .then((res) => {
                let event = res[0][0];
                let ownerBalance = res[1];
                let recipientBalance = res[2];
                let owner = res[3];
                let unauthorizedEvent = res[4][0];
                console.log("event", event);
                console.log("event", unauthorizedEvent);
                assert.equal(owner.toString(), accounts[0]);
                assert.equal(ownerBalance.comparedTo(0), 1, "nothing has been transfered");
                assert.equal(recipientBalance.comparedTo(0), 0, "nothing has been transfered");
                assert.isNull(event, "the event name must be Null as nothing happened");
                done();
            });
        ;
    });

    it("does change the owner when called from the correct address", function (done) {
        let watcher = tokenImpl.Transfer();
        return token.owner((owner) => {
            assert.equal(owner.toString(), accounts[0], "initially the owner is " + accounts[0]);
            return token.transferOwnership(accounts[3], {
                from: accounts[0]
            })
        })
            .then((tx) => watcher.get())
            .then((event) => {
                // console.log("event", event);
                assert.equal(event[0].event, "Transfer", "the event name must be Transfer");
                return token.owner()
            })
            .then((owner) => {
                assert.equal(owner.toString(), accounts[3]);
                return token.balanceOf(accounts[0]);
            })
            .then((balance) => {
                console.log("balance of", accounts[0], balance.toFormat(0));
                assert.equal(balance.comparedTo(0), 0, "the balance must be 0");
                done();
            });
    });

    xit("does mint new tokens when called from the correct address", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[2];

        token.mint(500000000000000000000, {
            from: sender
        }, function (err, res) {
            if (!err) {
                console.log("mint", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.totalSupply().toNumber(), totalSupply + 500000000000000000000);
                assert.equal(token.balanceOf(accounts[2]).toNumber(), ownerBalance + 500000000000000000000);
                done();
            } else if (err) {
                console.log(err);
                assert.fail("error in transferOwnership " + err.message);
                done();
            }
        });
    });

    xit("does not mint new tokens when called from the wrong address", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[1];

        token.mint(500000000000000000000, {
            from: sender
        }, function (err, res) {
            if (!err) {
                console.log("mint", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.totalSupply().toNumber(), totalSupply);
                assert.equal(token.balanceOf(accounts[2]).toNumber(), ownerBalance);
                done();
            } else if (err) {
                console.log(err);
                assert.fail("error in transferOwnership " + err.message);
                done();
            }
        });
    });

    xit("does not mint new tokens when called from the correct address on the implementation directly", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[2];

        tokenImpl.mint(sender, 500000000000000000000, {
            from: sender
        }, function (err, res) {
            if (!err) {
                console.log("mint", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.totalSupply().toNumber(), totalSupply);
                assert.equal(token.balanceOf(accounts[2]).toNumber(), ownerBalance);
                done();
            } else if (err) {
                console.log(err);
                assert.fail("error in transferOwnership " + err.message);
                done();
            }
        });
    });
});