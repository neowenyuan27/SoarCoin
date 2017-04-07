contract("SoarCoin", function (accounts) {
    let token = undefined;
    let tokenImpl = undefined;

    /**
     * set the contract instances
     */
    before(function (done) {
        SoarCoin.deployed().then(function (soarCoin) {
            token = soarCoin;
            SoarCoinImplementation.deployed().then(function (soarCoinImpl) {
                tokenImpl = soarCoinImpl;
                done();
            })
        })
    });

    it("gets the totalSupply from the token and tokenImplementation", function () {
        assert.equal(token.totalSupply().toNumber(), tokenImpl.totalSupply().toNumber(), "the total supply must be identical");
        assert.notEqual(token.totalSupply(), 0, "total supply must be non zero")
    });

    it("shows the totalSupply as the balance ofthe owner", function () {
        assert.equal(token.totalSupply().toNumber(), token.balanceOf(accounts[0]).toNumber())
    });

    it("has the trusted contract address as the token contract", function () {
        assert.equal(contractDefs.token.address, tokenImpl.trustedContract());
    });

    it("does not change the balance when a transfer is made on the tokenImplementation", function (done) {
        let sender = accounts[0];

        token.transfer(accounts[0], accounts[1], 500000000, {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
        }, function (err, res) {
            if (!err) {
                console.log("transfer", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.totalSupply().toNumber(), token.balanceOf(accounts[0]).toNumber());
                assert.equal(token.balanceOf(accounts[1]).toNumber(), 0);
                done();
            } else if (err) {
                assert.fail("error in transfer " + err.message);
                done();
            }
        })
    });

    it("changes the balance when a transfer is made on the token", function (done) {
        transfered += 500000000;
        let sender = accounts[0];

        token.transfer(accounts[2], 500000000, {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
        }, function (err, res) {
            if (!err) {
                console.log("transfer", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.balanceOf(accounts[2]).toNumber(), 500000000);
                assert.equal(token.totalSupply().toNumber(), token.balanceOf(accounts[0]).toNumber() + transfered);
                done();
            } else if (err) {
                assert.fail("error in transfer " + err.message);
                done();
            }
        })
    });

    it("does not change the owner when called from an incorrect address", function (done) {
        let sender = accounts[1];

        token.transferOwnership(accounts[2], {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
        }, function (err, res) {
            if (!err) {
                console.log("transferOwnership", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.owner().toString(), accounts[0]);
                assert.equal(token.balanceOf(accounts[2]).toNumber(), 500000000);
                done();
            } else if (err) {
                console.log(err);
                assert.fail("error in transferOwnership " + err.message);
                done();
            }
        });
    });

    it("does  change the owner when called from the correct address", function (done) {
        let ownerBalance = token.balanceOf(accounts[0]).toNumber();
        let sender = accounts[0];

        token.transferOwnership(accounts[2], {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
        }, function (err, res) {
            if (!err) {
                console.log("transferOwnership", err, res);
                // assert.equal(res, true, "the return value from transfer must be true");
                assert.equal(token.owner().toString(), accounts[2]);
                assert.equal(token.balanceOf(accounts[0]).toNumber(), 0);
                assert.equal(token.balanceOf(accounts[2]).toNumber(), ownerBalance + 500000000);
                done();
            } else if (err) {
                console.log(err);
                assert.fail("error in transferOwnership " + err.message);
                done();
            }
        });
    });

    it("does mint new tokens when called from the correct address", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[2];

        token.mint(500000000000000000000, {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
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

    it("does not mint new tokens when called from the wrong address", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[1];

        token.mint(500000000000000000000, {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
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

    it("does not mint new tokens when called from the correct address on the implementation directly", function (done) {
        let ownerBalance = token.balanceOf(accounts[2]).toNumber();
        let totalSupply = token.totalSupply().toNumber();
        let sender = accounts[2];

        tokenImpl.mint(sender, 500000000000000000000, {
            from: sender,
            data: undefined,
            value: web3.toHex(0),
            nonce: web3.eth.getTransactionCount(sender, "pending"),
            gas: 100000
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