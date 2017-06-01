import {Meteor} from "meteor/meteor";
import {Promise} from "meteor/promise";
import {add0x, ether, getWeb3} from "./ethereum-services";
import {Mongo} from "meteor/mongo";
import {Globals} from "../model/globals";
import {currentProfile} from "../model/profiles";
import {txutils} from "eth-lightwallet";
import BigNumber from "bignumber.js";

/**
 * get the contract interface JSON from the project Assets (the private folder)
 * the JSON is pushed to the Globals collection to make it accessible by the client
 *
 * @returns {Promise that resolves with a JSON}
 */
export const getContractDefs = function () {
    return new Promise(function (resolve, reject) {
        let contracts = Globals.findOne({name: "contracts"});
        if (contracts) {
            resolve(contracts);
        } else if (Meteor.isClient) {
            Meteor.subscribe("globals", function () {
                resolve(Globals.findOne({name: "contracts"}));
            });
        } else {
            reject(new Meteor.Error("contracts are not defined"));
        }
    })
};

/**the events are used to record all the contract events that happen.
 * it is also used to avoid duplicate event triggering*/
export const Events = new Mongo.Collection("eth-events");

if (Meteor.isServer) {
    Meteor.startup(() => {
        Events._ensureIndex({hash: 1, logIndex: 1}, {unique: true});
        Events._ensureIndex({executed: 1}, {unique: false});
    })
}

export const getContract = (name, event) => {
    return getContractDefs().then(function (contractDefs) {
        try {
            return getWeb3(event).eth.contract(contractDefs[name].abi).at(contractDefs[name].address);
        } catch (err) {
            return Promise.reject(err);
        }
    })
};

export const callContractMethod = function (contract, funcName) {
    let args = Array.from(arguments).slice(2);
    return getContract(contract).then((contract) => {
        return contract[funcName].call.apply(this, args);
    })
};

/*start listening for events of this type*/
export const eventListener = function (contractName, eventName, filter, callback) {
    //TODO: verify that contract[eventName] is an event and that it exists
    return getContract(contractName, true)
        .then((contract) => {
            try {
                let event;
                if (eventName) {
                    event = contract[eventName](filter, {fromBlock: "latest", toBlock: "latest"});
                } else {
                    event = contract.allEvents(filter, {fromBlock: "latest", toBlock: "latest"});
                }
                if (typeof callback === "function")
                    event.watch(callback);

                return event;
            } catch (error) {
                logger.error(error);
                return Promise.reject(new Meteor.Error(error));
            }
        })
};

const getNonce = function (address) {
    let web3 = getWeb3();
    /*the nonce is the count of the next transaction*/
    let nonce = web3.eth.getTransactionCount(address, "pending");
    console.log("transactions including pending", nonce);
    return nonce;
};

export const createRawValueTx = function (recipient, value, from) {
    return new Promise((resolve, reject) => {
        let web3 = getWeb3();
        let gasPrice = web3.toHex(web3.eth.gasPrice);
        let address = from || currentProfile().address;

        let gasEstimate = web3.toHex(web3.eth.estimateGas({
            to: recipient,
            value: web3.toHex(value),
        }));

        let nonce = getNonce(address);
        console.log("the nonce is", nonce);

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasEstimate,
            to: recipient,
            from: address,
            value: web3.toHex(value),
        };

        let rawTxString = txutils.valueTx(rawTx);

        resolve({
            rawTx: rawTxString,
            transactionCost: new BigNumber(gasEstimate.toString()).times(gasPrice).dividedBy(ether).toNumber(),
            accountBalance: web3.eth.getBalance(address).dividedBy(ether).toNumber(),
        });
    })
};

export const createRawTx = function (contractName, funcName, value, from, providedEstimate) {
    let web3 = getWeb3();
    let gasPrice = web3.toHex(web3.eth.gasPrice);
    let address = from || currentProfile().address;

    return getContract(contractName).then((contract) => {
        let args = Array.from(arguments).slice(5);
        let payloadData = contract[funcName].getData.apply(this, args);
        let gasEstimate;
        /*if the gas estimate has been provided, do not compute it as the estimation from web3 is way off*/
        if(providedEstimate) {
            gasEstimate = web3.toHex(providedEstimate);
        } else {
            gasEstimate = web3.toHex(web3.eth.estimateGas({
                    from: address,
                    to: contract.address,
                    value: web3.toHex(value),
                    data: payloadData
                }) * 1.5);
        }

        let nonce = getNonce(address);
        console.log("the nonce is", nonce, "gas estimate", new BigNumber(gasEstimate, 16).toFormat(0));

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice.toString(10),
            gasLimit: gasEstimate,
            to: contract.address,
            from: address,
            value: web3.toHex(value),
            data: payloadData,
        };

        let rawTxString = txutils.functionTx(contract.abi, funcName, args, rawTx);

        return {
            rawTx: rawTxString,
            nonce: nonce,
            transactionCost: new BigNumber(gasEstimate.toString()).times(gasPrice).dividedBy(ether).toNumber(),
            accountBalance: web3.eth.getBalance(address).dividedBy(ether).toNumber(),
        };
    }).catch((err) => {
        return Promise.reject(new Meteor.Error("create function call for contract", err.message));
    });

};

export const submitRawTx = function (rawTxHexString, from) {
    let txHash = null;
    if (rawTxHexString.length > 2 && rawTxHexString.slice(0, 2) === "0x") {
        txHash = getWeb3().sha3(rawTxHexString.substr(2), {encoding: "hex"});
    } else {
        txHash = getWeb3().sha3(rawTxHexString, {encoding: "hex"});
    }
    let lastNonce = getNonce(from);
    return new Promise((resolve, reject) => {
        if (!getWeb3().eth.getTransaction(txHash)) {
            getWeb3().eth.sendRawTransaction(add0x(rawTxHexString), function (err, hash) {
                if (err) {
                    reject(new Meteor.Error("web3-error", err.message));
                } else {
                    let polls = 0;
                    while (getNonce(from) <= lastNonce) {
                        polls++;
                    }
                    console.log("polled", polls, "times for the nonce to increase");
                    resolve(hash);
                }
            });
        } else {
            resolve(txHash);
        }
    })
}

export const waitForTxMining = function (txHash) {
    if (txHash && typeof txHash === "string" && getWeb3().eth.getTransaction(txHash)) {
        logger.info("[wait for tx to mine] " + txHash);
        return new Promise((resolve, reject) => {
            let txloop = Meteor.setInterval(Meteor.bindEnvironment(function () {
                try {
                    const web3 = getWeb3();
                    let tx = web3.eth.getTransaction(txHash);
                    if (tx && tx.blockNumber) {
                        Meteor.clearInterval(txloop);
                        resolve(web3.eth.getTransactionReceipt(txHash));
                    }
                } catch (err) {
                    logger.error("[ERROR: wait for tx to mine]" + JSON.stringify(err));
                    Meteor.clearInterval(txloop);
                    reject(new Meteor.Error("wait for TX to mine", err.message));
                }
            }), 1000);
        })
    } else {
        throw new Meteor.Error("the txHash is mandatory and must be a string identifying a transaction");
    }
}

Meteor.methods({
    "submit-raw-tx": function (rawTxHexString, from) {
        return submitRawTx(rawTxHexString, from);
    },

    "wait-for-tx-mining": function (txHash, sender, recipient) {
        return waitForTxMining(txHash, sender, recipient);
    },

});