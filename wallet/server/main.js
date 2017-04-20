import {Meteor} from "meteor/meteor";
import {EJSON} from "meteor/ejson";
import CryptoJS from "crypto-js";
import {add0x, getWeb3, createKeystore} from "../import/ethereum/ethereum-services";
import {Globals} from "../import/model/globals";

let keystore = null;

Meteor.startup(() => {
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
            events: json.networks[chain].events,
            address: json.networks[chain].address
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
            events: json.networks[chain].events,
            address: soarContract.getImplementation()
        }
        return null;
    }).then(function () {
        Globals.upsert({name: "contracts"}, contracts);

        let ksInfo = Globals.findOne({name: "keystore"});
        /**only create the keystore if it does not exist allready*/
        if(!ksInfo) {
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
        console.log(err);
    })

});
