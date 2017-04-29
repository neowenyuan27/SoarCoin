import {getWeb3, getWeiPerSoar, signAndSubmit} from "../imports/ethereum/ethereum-services";
import {callContractMethod, createRawTx, waitForTxMining} from "../imports/ethereum/ethereum-contracts";
import {currentProfile, Profiles} from "../imports/model/profiles";
import {Globals} from "../imports/model/globals";
import {HTTP} from "meteor/http";
import {Random} from "meteor/random";
import {Email} from "meteor/email";
import BigNumber from "bignumber.js";

export const syncBalance = function (address) {
    return callContractMethod("SoarCoin", "balanceOf", address)
        .then((balance) => {
            Profiles.update({address: address}, {
                $set: {
                    soarBalance: balance.toString(10),
                    ethBalance: getWeb3().eth.getBalance(address).toString(10)
                }
            });
        });
}

let refills = {};

Meteor.methods({
    "send-verification-link": function () {
        let userId = Meteor.userId();
        if (userId) {
            let token = Random.id(),
                emailAddress = Meteor.user().emails[0].address,
                urlWithoutHash = `${Meteor.absoluteUrl()}verify-email/${token}`,
                supportEmail = Meteor.settings.supportEmail,
                emailBody = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;
            let emailOptions = {
                subject: "SOARcoin - Verify Your Email Address",
                text: emailBody,
                to: emailAddress,
                from: supportEmail,
            }
            try {
                Email.send(emailOptions);
                logger.info("token mail sent to " + emailAddress);

                Meteor.users.update({_id: this.userId}, {
                    $push: {
                        "services.email.verificationTokens": {
                            token: token,
                            timestamp: new Date(),
                            email: emailAddress
                        }
                    }
                })
            } catch (error) {
                logger.error("token mail NOT sent to " + emailAddress, error);
            }
        }
    },

    "verify-captcha": function (captcha, token) {
        let captchaResult = HTTP.post("https://www.google.com/recaptcha/api/siteverify",
            {
                params: {
                    secret: Meteor.settings.recaptcha.secret,
                    response: captcha
                }
            })

        if (!captchaResult.data.success || Meteor.users.find({"services.email.verificationTokens.token": token}).count() === 0) {
            Meteor.users.update({"services.email.verificationTokens.token": token}, {
                $set: {"emails.0.captcha": "unverified", "emails.0.verified": false},
                $unset: {"services.email.verificationTokens": ""}
            });
            throw new Meteor.Error(captchaResult.data.success ? "You provided an invalid token" : "You were identified as a robot");
        } else {
            Meteor.users.update({"services.email.verificationTokens.token": token}, {
                $set: {"emails.0.captcha": "verified", "emails.0.verified": true},
                $unset: {"services.email.verificationTokens": ""}
            });
            return true;
        }
    },

    /*TODO: limit refill to once per hour*/
    "refill-ether": function () {
        /*do nothing if the user is not logged in or a refill is underway for that user*/
        if (!this.userId || refills[this.userId]) {
            console.log("refill underway for " + this.userId);
            return "no refill";
        }

        let self = this;
        /**compute the price in WEI for a transfer transaction*/
        let profile = currentProfile();
        let txCount = Meteor.settings.refillTxCount;
        let gasPrice = new BigNumber(Meteor.settings.public.txGas).times(getWeb3().eth.gasPrice);
        let refillGasPrice = new BigNumber(Meteor.settings.refillGas).times(getWeb3().eth.gasPrice);
        let toTransfer = gasPrice.times(txCount).minus(getWeb3().eth.getBalance(profile.address));
        let oracleAddress = Globals.findOne({name: "keystore"}).address;
        let userAddress = currentProfile().address;

        console.log("refill started for " + this.userId);
        refills[this.userId] = true;

        /*the test aims to thwart micro transaction atacks*/
        if (toTransfer.comparedTo(gasPrice.times(txCount - 2)) == 1) {
            /*TODO: verify that the account did not spend its ETH on something else than trsansfering SOAR*/
            getWeiPerSoar()
                .then(Meteor.bindEnvironment(function (weiPerSoar) {
                    return createRawTx("SoarCoinImplementation", "ethForToken",
                        toTransfer.toString(10),
                        oracleAddress,
                        null, //let web3 estimate
                        userAddress,
                        toTransfer.add(refillGasPrice).dividedToIntegerBy(weiPerSoar))
                }))
                .then(Meteor.bindEnvironment(function (tx) {
                    return signAndSubmit(Meteor.settings.ethPassword, tx.rawTx, oracleAddress)
                }))
                .then(Meteor.bindEnvironment(function (tx) {
                    console.log(tx);
                    return waitForTxMining(tx).then()
                }))
                .then((receipt) => {
                    refills[self.userId] = false;
                    syncBalance(userAddress);
                    console.log("refill done", receipt);
                    return receipt;
                })
                .catch(Meteor.bindEnvironment(function (error) {
                    console.log(err)
                    throw new Meteor.Error("refill-ether", err.message);
                }))
        } else {
            console.log("no refill necessary", toTransfer.toString(10));
            refills[self.userId] = false;
        }

    },

    "sync-user-details": function () {
        syncBalance(currentProfile().address);
    },

    "get-name-for-address": function (address) {
        let profile = Profiles.findOne({address: address});
        if (profile) return profile.email;
        return null;
    },

    "get-wei-for-soar": function () {
        let gasPrice = new BigNumber(Meteor.settings.public.txGas).times(getWeb3().eth.gasPrice);
        let toTransfer = gasPrice.times(10);
        let refillGasPrice = 0;
        return getWeiPerSoar().then((weiPerSoar) => toTransfer.add(refillGasPrice).dividedToIntegerBy(weiPerSoar).toString(10));
    }
});