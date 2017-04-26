import {Meteor} from "meteor/meteor";
import {EJSON} from "meteor/ejson";
import CryptoJS from "crypto-js";
import {add0x, getWeb3, createKeystore} from "../imports/ethereum/ethereum-services";
import {eventListener, getContract} from "../imports/ethereum/ethereum-contracts";
import {Globals} from "../imports/model/globals";
import {Transactions} from "../imports/model/transactions";

let keystore = null;
logger = null;

Meteor.startup(() => {

    logger = require('winston');
    let logglyBulk = require('winston-loggly-bulk');

    logger.add(logger.transports.Loggly, {
        token: "c0042787-5f03-4a49-a6f7-a6ee1523447b",
        subdomain: "managination",
        tags: ["soarcoin-server"],
        json: true
    });

    let chain = Meteor.settings.chain;
    let contracts = {name: "contracts"};
    /**update the contract references*/
    new Promise(function (resolve, reject) {
        Assets.getText("ethereum/build/contracts/SoarCoin.json", function (err, json) {
            if (err) {
                reject(err);
            } else {
                resolve(EJSON.parse(json));
            }
        });
    }).then(function (json) {
        contracts.SoarCoin = {
            abi: json.abi,
            address: Meteor.settings.SoarCoinAddress || json.networks[chain].address
        }

        return new Promise(function (resolve, reject) {
            Assets.getText("ethereum/build/contracts/SoarCoinImplementationV01.json", function (err, json) {
                if (err) {
                    reject(err);
                } else {
                    resolve(EJSON.parse(json));
                }
            });
        });
    }).then(function (json) {
        let soarContract = getWeb3().eth.contract(contracts.SoarCoin.abi).at(contracts.SoarCoin.address);

        contracts.SoarCoinImplementation = {
            abi: json.abi,
            address: soarContract.getImplementation()
        }
        return null;
    }).then(function () {
        Globals.upsert({name: "contracts"}, contracts);

        let ksInfo = Globals.findOne({name: "keystore"});
        /**only create the keystore if it does not exist allready*/
        if (!ksInfo) {
            return createKeystore("server", Meteor.settings.ethPassword, null, null)
                .then((keystore) => {
                    Globals.insert({
                        name: "keystore",
                        user: "server",
                        mnemonic: CryptoJS.AES.encrypt(keystore.password, Meteor.settings.ethPassword).toString(),
                        salt: CryptoJS.AES.encrypt(keystore.salt, Meteor.settings.ethPassword).toString(),
                        address: add0x(keystore.username)
                    })
                })
        } else {
            return null; //just return to go to the next step
        }
    }).then(function () {

    }).catch(function (err) {
        winston.error(err);
    })

});

const transferEventCallback = Meteor.bindEnvironment(function (error, transfer) {
    if (error) {
        logger.error(error);
    } else {
        let block = getWeb3().eth.getBlock(transfer.blockNumber);
        Transactions.insert({
            from: transfer.args.from,
            to: transfer.args.to,
            value: transfer.args.value.toString(),
            timestamp: new Date(block.timestamp * 1000),
            blockNumber: transfer.blockNumber,
            logIndex: transfer.logIndex
        }, function (error, res) {
            //ignore errors
        })
    }
});

function startListener(previousListener) {
    try {
        if (previousListener) {
            logger.info("stopped previous listener");
            previousListener.stopWatching();
        }
    } catch (error) {
        logger.error(error)
    }

    return eventListener("SoarCoinImplementation", "Transfer", null, transferEventCallback);
}

/** in order to make sure the listener stays up and is restarted if it shuts down unexpectedly, it is restarted every 10 minutes*/
Meteor.startup(() => {
    /**make sure that transactions will be added only once*/
    Transactions._ensureIndex({blockNumber: 1, logIndex: 1}, {unique: true});

    /**get all the events for the contract*/
    let txLog = Globals.findOne({name: "transactionLog"});
    let eventBlock = 1;
    let currentBlock = getWeb3(true).eth.blockNumber;
    if (txLog) {
        eventBlock = txLog.lastBlock;
    }
    Globals.upsert({name: "transactionLog"}, {name: "transactionLog", lastBlock: currentBlock})

    getContract("SoarCoinImplementation", true)
        .then((contract) => {
            try {
                let event = contract["Transfer"](null, {fromBlock: eventBlock, toBlock: currentBlock});
                event.get(function (error, logs) {
                    logs.forEach(function (log) {
                        transferEventCallback(null, log);
                    });
                })
            } catch (error) {
                logger.error(error);
                throw new Meteor.Error(error);
            }
        })

    let transferEventListener = null;
    startListener().then(Meteor.bindEnvironment(
        function (listener) {
            transferEventListener = listener;

            Meteor.setInterval(Meteor.bindEnvironment(function () {
                startListener(transferEventListener).then(
                    (listener) => transferEventListener = listener);
            }), 60000)
        })
    );
})