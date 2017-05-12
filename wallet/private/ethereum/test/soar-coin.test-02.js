contract("SoarCoin", function (accounts) {
    let SoarCoin = artifacts.require("./SoarCoin.sol");
    let SoarCoinV2 = artifacts.require("./SoarCoinV2.sol");
    let SoarCoinImplementationV01 = artifacts.require("./SoarCoinImplementationV01.sol");
    let SoarCoinImplementationV02 = artifacts.require("./SoarCoinImplementationV02.sol");
    let SoarCoinImplementationV03 = artifacts.require("./SoarCoinImplementationV03.sol");
    let token = undefined;
    let tokenV2 = undefined;
    let imp1 = undefined;
    let imp2 = undefined;
    let imp3 = undefined;
    // let accounts = web3.eth.accounts;

    /**
     * set the contract instances
     */
    before(function (done) {
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

                return token.setImplementation(imp2.address);
            })
            .then(function () {
                return imp1.setTrustedContract(imp2.address);
            })
            .then(function () {
                return imp2.setTrustedContract(token.address);
            })
            .then(function (tx) {
                return token.transfer(accounts[4], 5e9);
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
                return imp1.owner()
            })
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
                return imp2.owner()
            })
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
                return imp3.owner()
            })
            .then((owner) => {
                assert.equal(accounts[0], owner, accounts[0] + " is the owner");
            })
    });

    it("the token is the trusted contract in the implementation", function () {
        return imp3.trustedCallers(token.address)
            .then((trusted) => {
                assert.equal(trusted, true, "the trustedContract address must be the token's");
            })
    });

    it("the token implementation is the trusted contract in the previous implementation", function () {
        return imp2.trustedContract()
            .then((trustedContract) => {
                assert.equal(trustedContract, imp3.address, "the trustedContract address must be the token's");
            })
    });

    it("the implementation is registered with the token", function () {
        return token.getImplementation()
            .then((implementationAddress) => {
                assert.equal(implementationAddress, imp3.address, "the implementation address must be the new implementation");
            })
    });

    it("gets the totalSupply from the token and tokenImplementation", function () {
        return Promise.all([imp3.totalSupply(), token.totalSupply()])
            .then((totalSupply) => {
                assert.equal(totalSupply[0].comparedTo(totalSupply[1]), 0, "the total supply must be identical");
                assert.notEqual(totalSupply[0].toNumber(), 0, "total supply must be non zero");
            })
            .catch((err) => {
                assert.fail(err);
            })
    });

    it("has the TokenImplementationV01 contract address as the previous token implementation", function () {
        return imp3.previousImplementation()
            .then((implementation) => assert.equal(imp2.address, implementation,
                "the implementation contract must be the v02 implementation"));
    });

    it("has the tokenImplementation contract address as the token contract", function () {
        return token.getImplementation()
            .then((implementation) => assert.equal(imp3.address, implementation,
                "the implementation contract must be the v03 implementation"));
    });

    it("has the totalSupply as the balance ofthe owner", function () {
        return Promise.all([token.totalSupply(), token.balanceOf(accounts[0])])
            .then((values) => {
                assert.equal(values[0].toNumber(), values[1].add(5e9).toNumber(),
                    "the balance of the owner is not equal to the toal supply ");
            })
    });

    it("does not change the balance when a transfer is made on the tokenImplementation", function () {
        let sender = accounts[0];
        let watcher = imp3.UnauthorizedCall();
        let transfered;

        return token.balanceOf(sender).then((balamce) => {
            transfered = balamce.dividedBy(2).toString(10);
            return imp3.transfer(accounts[0], accounts[1], transfered, {
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
                assert.equal(tokenSupply.toNumber(), ownerBalance.add(5e9).toNumber());
                assert.equal(recipientBalance.toNumber(), 0);
            })
    });

    it("considers unknown accounts as not migrated", function () {
        return imp3.migrated(accounts[2])
            .then(mig => assert.equal(mig, false, "the account is not migrated yet"));
    });

    it("considers old accounts as not migrated", function () {
        return imp3.migrated(accounts[0])
            .then(mig => assert.equal(mig, false, "the account is not migrated yet"));
    });

    it("changes the balance when a transfer is made on the token", function () {
        let transfered;
        let sender = accounts[0];
        let recipient = accounts[2];
        let watcher = imp3.Transfer();

        return token.balanceOf(sender).then((balance) => {
            transfered = 5e9;
            return token.transfer(recipient, transfered, {
                from: sender,
                gas: 1e6
            })
        })
            .then((tx) => {
                return Promise.all([
                    watcher.get(),
                    token.totalSupply(),
                    token.balanceOf(sender),
                    token.balanceOf(recipient)]
                )
            })
            .then(function (res) {
                let event = res[0][0];

                let tokenSupply = res[1];
                let ownerBalance = res[2];
                let recipientBalance = res[3];
                assert.equal(recipientBalance.toString(10), transfered.toString(10), recipient + " must have received the transfered amount");
                assert.equal(tokenSupply.toNumber(), ownerBalance.plus(transfered).plus(5e9).toNumber(), "totalSupply must be the owner balance + transfered amount");
                assert.isDefined(event, "an event is expected");
                assert.equal(event.event, "Transfer", "the event name must be Transfer");
            })
    });

    it("considers known accounts as migrated", function () {
        return imp3.migrated(accounts[2])
            .then(mig => assert.equal(mig, true, "the account is not migrated yet"));
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
                return imp3.mint(500000000000000, {
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
                return imp3.mint(500000000000000, {
                    from: accounts[1]
                });
            })
            .then(() => assert.fail("an error should be thrown"))
            .catch((error) => assert.isOk(error, "there should be an error"))
    });

    it("sends tokens for ether to oracle from accounts[2]", function () {
        let oracleEthBalance = web3.eth.getBalance(accounts[1]);
        let usereEthBalance = web3.eth.getBalance(accounts[2]);
        let oracleTokenBalance = null;
        let userTokenBalance = null;
        return token.balanceOf(accounts[2])
            .then((balance) => userTokenBalance = balance)
            .then(() => imp3.oracle())
            .then((oracle) => assert.equal(oracle, accounts[1], "the oracle is accounts[1"))
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => {
                assert.equal(userTokenBalance.comparedTo(5e9), 0, "the user has 5e9 tokens " + userTokenBalance.toString(10));
                assert.equal(oracleTokenBalance.comparedTo(0), 0, "the oracle has 0 tokens");
            })
            .then(() => imp3.ethForToken(accounts[2], 5e8, {value: "1e15", from: accounts[1]}))
            .then(() => token.balanceOf(accounts[2]))
            .then((balance) => userTokenBalance = balance)
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => {
                assert.equal(userTokenBalance.add(5e8).comparedTo(5e9), 0, "the user has 5e9 - 5e8 tokens " + userTokenBalance.toFormat(0));
                assert.equal(oracleTokenBalance.minus(5e8).comparedTo(0), 0, "the oracle has 5e8 tokens " + oracleTokenBalance.toFormat(0));
            })
    });

    it("sends tokens for ether to oracle from accounts[0]", function () {
        let oracleEthBalance = web3.eth.getBalance(accounts[1]);
        let usereEthBalance = web3.eth.getBalance(accounts[0]);
        let oracleTokenBalance = null;
        let userTokenBalance = null;
        return token.balanceOf(accounts[0])
            .then((balance) => userTokenBalance = balance)
            .then(() => imp3.oracle())
            .then((oracle) => assert.equal(oracle, accounts[1], "the oracle is accounts[1"))
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => {
                assert.equal(userTokenBalance.comparedTo("999990000000000"), 0, "the user has 5e9 tokens " + userTokenBalance.toString(10));
                assert.equal(oracleTokenBalance.comparedTo(5e8), 0, "the oracle has 5e8 tokens");
            })
            .then(() => imp3.ethForToken(accounts[0], 5e8, {value: "1e15", from: accounts[1]}))
            .then(() => token.balanceOf(accounts[0]))
            .then((balance) => userTokenBalance = balance)
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => {
                assert.equal(userTokenBalance.add(5e8).comparedTo("999990000000000"), 0, "the user has 5e9 - 5e8 tokens " + userTokenBalance.toFormat(0));
                assert.equal(oracleTokenBalance.minus(5e8).comparedTo(5e8), 0, "the oracle has 5e8 tokens " + oracleTokenBalance.toFormat(0));
            })
    });

    it("has the same total supply and balance on token and tokenV2", function () {
        return Promise.all([
            token.totalSupply(),
            tokenV2.totalSupply(),
            token.balanceOf(accounts[0]),
            tokenV2.balanceOf(accounts[0]),
            token.balanceOf(accounts[1]),
            tokenV2.balanceOf(accounts[1]),
        ]).then(function (res) {
            assert.equal(res[0].toString(10), res[1].toString(10), "total supply is the same");
            assert.equal(res[2].toString(10), res[3].toString(10), "balance of accounts[0] is the same");
            assert.equal(res[4].toString(10), res[5].toString(10), "balance of accounts[1] is the same");
        })
    })

    it("transfers tokens from V2", function () {
        let watcher = tokenV2.Transfer();
        let b0 = 0;
        let b3 = 0;

        return Promise.all([
            token.balanceOf(accounts[0]),
            token.balanceOf(accounts[3])]
        )
            .then(function (res) {
                b0 = res[0];
                b3 = res[1];
                return tokenV2.transfer(accounts[3], 5e3);
            })
            .then(function () {
                return Promise.all([
                    watcher.get(),
                    token.balanceOf(accounts[0]),
                    token.balanceOf(accounts[3])]
                )
            })
            .then(function (res) {
                assert.isDefined(res[0][0], "an event is expected");
                assert.equal(res[0][0].event, "Transfer", "the event name must be Transfer");
                assert.equal(b0.minus(res[1]).toFormat(0), "5,000", 0, "5e3 were transfered ");
                assert.equal(res[2].minus(b3).toFormat(0), "5,000", 0, "5e3 were transfered ");
            })
    });

    it("sends tokens for ether to oracle", function () {
        let watcher = imp3.Transfer();
        let oracleEthBalance = web3.eth.getBalance(accounts[1]);
        let usereEthBalance = web3.eth.getBalance(accounts[3]);
        let oracleTokenBalance = null;
        let userTokenBalance = null;
        return token.balanceOf(accounts[3])
            .then((balance) => userTokenBalance = balance)
            .then(() => imp3.oracle())
            .then((oracle) => assert.equal(oracle, accounts[1], "the oracle is accounts[1"))
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => {
                assert.equal(userTokenBalance.comparedTo(5e3), 0, "the user has 5e9 tokens " + userTokenBalance.toString(10));
                assert.equal(oracleTokenBalance.comparedTo(1e9), 0, "the oracle has a lot of tokens " + oracleTokenBalance.toFormat(0));
            })
            .then(() => imp3.ethForToken(accounts[3], 5e3, {value: "1e15", from: accounts[1]}))
            .then(() => token.balanceOf(accounts[3]))
            .then((balance) => userTokenBalance = balance)
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => oracleTokenBalance = balance)
            .then(() => watcher.get())
            .then(event => {
                assert.isDefined(event[0], "an event is expected");
                assert.equal(event[0].event, "Transfer", "the event name must be Transfer");

                assert.equal(userTokenBalance.comparedTo(0), 0, "the user has 0 tokens " + userTokenBalance.toFormat(0));
                assert.equal(oracleTokenBalance.minus(5e3).comparedTo(1e9), 0, "the oracle has 5e8 tokens more");
            })
    })

    xit("does not change the owner when called from an incorrect address", function () {
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

    xit("does change the owner when called from the correct address", function () {
        return token.owner()
            .then((owner) => {
                assert.equal(owner.toString(), accounts[0], "initially the owner is " + accounts[0]);
                return token.transferOwnership(accounts[3], {
                    from: accounts[0]
                })
            })
            .then((tx) => {
                return Promise.all([
                    imp3.balanceOf(accounts[0]),
                    imp3.balanceOf(accounts[3]),
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

    xit("does change ownership of implementation", function () {
        return imp3.transferOwnership(accounts[3], {
            from: accounts[0]
        })
            .then((tx) => imp3.owner())
            .then((owner) => assert.equal(owner, accounts[3], "the new owner is " + accounts[3]));
    })

    xit("does change ownership of implementation back", function () {
        return imp3.transferOwnership(accounts[0], {
            from: accounts[3]
        })
            .then((tx) => imp2.owner())
            .then((owner) => assert.equal(owner, accounts[0], "the new owner is accounts[0]"));
    })


});