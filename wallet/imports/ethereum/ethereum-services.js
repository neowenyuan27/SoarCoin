import {Meteor} from "meteor/meteor";
import {Promise} from "meteor/promise";
import {keystore, signing} from "eth-lightwallet";
import CryptoJS from "crypto-js";
import W3 from "web3";
import * as LocalStorage from "meteor/simply:reactive-local-storage";
import BigNumber from "bignumber.js";
import {submitRawTx} from "./ethereum-contracts";
import {Globals} from "../model/globals";

export const ether = new BigNumber("1000000000000000000");
export const soar = new BigNumber("1000000");

let initialisedWeb3 = undefined;
let eventWeb3 = undefined;
export const getWeb3 = (event) => {
    let w3;
    if (event)
        w3 = eventWeb3;
    else
        w3 = initialisedWeb3;

    if (!w3) {
        let provider;
        if (event)
            provider = new W3.providers.HttpProvider(Meteor.settings.public.contractEvents);
        else
            provider = new W3.providers.HttpProvider(Meteor.settings.public.ethNodeAddress);

        w3 = new W3(provider);

        if (event)
            eventWeb3 = w3;
        else
            initialisedWeb3 = w3;
        try{
            let latestBlock = w3.eth.getBlock(w3.eth.blockNumber);
        } catch (error) {
            logger.error(error);
            throw new Meteor.Error(error);
        }
    }
    return w3;
};

export const signAndSubmit = (password, rawTx, from) => {
    let address = from || add0x(Meteor.user().username);

    return new Promise((resolve, reject) => {
        getKeystore(password).then(function (wallet) {
            wallet.keyFromPassword(password, (err, pwDerivedKey) => {
                if (err) {
                    reject(err);
                    return;
                }
                let signedTxString = signing.signTx(wallet, pwDerivedKey, add0x(rawTx), address);
                console.log("signedTxString", signedTxString);
                submitRawTx(add0x(signedTxString.toString('hex')))
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    })
            });
        })
    })
};

export const getKeystore = ((password) => {
    return new Promise(function (resolve, reject) {
            if (wallet) {
                resolve(wallet);
            } else {
                let mnemonic;
                let salt;
                let email;
                if (Meteor.isClient) {
                    mnemonic = LocalStorage.getItem('encrypted-mnemonic');
                    salt = LocalStorage.getItem('salt');
                    email = LocalStorage.getItem('email');
                    mnemonic = CryptoJS.AES.decrypt(mnemonic, password).toString(CryptoJS.enc.Utf8);
                } else {
                    let ksInfo = Globals.findOne({name: "keystore"});
                    mnemonic = CryptoJS.AES.decrypt(ksInfo.mnemonic, Meteor.settings.ethPassword).toString(CryptoJS.enc.Utf8);
                    salt = CryptoJS.AES.decrypt(ksInfo.salt, Meteor.settings.ethPassword).toString(CryptoJS.enc.Utf8);
                    email = "server";
                }

                return createKeystore(email, password, salt, mnemonic)
                    .then((ks) => {
                        wallet = ks.keystore;
                        resolve(wallet);
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }
        }
    )
});

let wallet = undefined;
let pdk = undefined;
export const createKeystore = (email, password, salt, mnemonic) => {
    let _resolve;
    let _reject;
    let keystoreCallback = (err, ks) => {
        if (err) _reject(err);
        wallet = ks;

        // Some methods will require providing the `pwDerivedKey`,
        // Allowing you to only decrypt private keys on an as-needed basis.
        // You can generate that value with this convenient method:
        ks.keyFromPassword(password, (err, pwDerivedKey) => {
            pdk = pwDerivedKey;
            if (err) _reject(err);

            // generate one new address/private key pair
            // the corresponding private key is also encrypted
            ks.generateNewAddress(pwDerivedKey);

            let mnemonic = ks.getSeed(pwDerivedKey);

            if (Meteor.isClient) {
                LocalStorage.setItem('encrypted-mnemonic', CryptoJS.AES.encrypt(mnemonic, password).toString());
                LocalStorage.setItem('salt', ks.salt);
                LocalStorage.setItem('email', email);
                LocalStorage.setItem('username', ks.getAddresses()[0]);
            }

            _resolve({
                username: ks.getAddresses()[0],
                email: email,
                password: mnemonic,
                salt: ks.salt,
                mnemonicHash: CryptoJS.SHA256(mnemonic).toString(),
                keystore: ks
            });
        });
    };

    /*if everything is known create from known data*/
    if (mnemonic && salt) {
        return new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
            keystore.createVault({
                password: password,
                seedPhrase: mnemonic,
                salt: salt
            }, keystoreCallback);

        });
    }

    /*if only the mnemonic is known it is a recovery*/
    if (mnemonic) {
        return new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
            Meteor.call('get-salt-from-mnemonic', CryptoJS.SHA256(mnemonic).toString(), function (salt) {
                let options = {
                    password: password,
                    seedPhrase: mnemonic,
                };
                if (salt) options.salt = salt;
                keystore.createVault(options, keystoreCallback);
            })
        });
    }

    /*if nothing is known it is a new keystore*/
    return new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
        keystore.createVault({
            password: password
        }, keystoreCallback);

    });

};

export const add0x = (input) => {
    if (typeof(input) !== 'string') {
        return input;
    } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
        return '0x' + input;
    } else {
        return input;
    }
};

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export const isValidAddress = function (address) {
    if (typeof address == "string" && address.length > 0) {
        address = add0x(address).toLowerCase();

        return (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address))
    }
    return false;
};

export const getWeiPerSoar = function() {
    return new Promise(function (resolve, reject) {
        resolve(250000000)
    })
}