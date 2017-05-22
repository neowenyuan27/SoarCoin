import {getWeb3, getWeiPerSoar, signAndSubmit} from "../imports/ethereum/ethereum-services";
import {callContractMethod, createRawTx, waitForTxMining} from "../imports/ethereum/ethereum-contracts";
import {currentProfile, Profiles} from "../imports/model/profiles";
import {Globals} from "../imports/model/globals";
import {Random} from "meteor/random";
import {Email} from "meteor/email";

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
    "verify-email": function (email) {
        return Meteor.users.find({"emails.address": email}).count() === 0;
    },

    "send-verification-link": function (recipient) {
        if (this.userId && recipient) {
            let token = Random.id(),
                emailAddress = recipient,
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
        } else {
            logger.error("user not logged in");
        }
    },

    "verify-captcha": function (token) {
        let user = Meteor.users.findOne({"services.email.verificationTokens.token": token});
        if (!user) {
            Meteor.users.update({"services.email.verificationTokens.token": token}, {
                $set: {"emails.0.captcha": "unverified", "emails.0.verified": false},
                $unset: {"services.email.verificationTokens": ""}
            });
            throw new Meteor.Error("You provided an invalid token");
        } else {
            Meteor.users.update({"services.email.verificationTokens.token": token}, {
                $set: {"emails.0.captcha": "verified", "emails.0.verified": true},
                $unset: {"services.email.verificationTokens": ""}
            });
            let profile = Profiles.findOne({owner: user._id});
            return true;
        }
    },

    "sync-user-details": function (recipient) {
        syncBalance(currentProfile().address);
        if (recipient)
            syncBalance(recipient);
    },

    "get-name-for-address": function (address) {
        let profile = Profiles.findOne({address: address});
        if (profile) return profile.email;
        return null;
    },

    "transfer-soar": function (amount, recipient) {
        let profile = currentProfile();
        let oracle = Globals.findOne({name: "keystore"});
        if (profile.address != "0x0") {
            let gasPrice = getWeb3().eth.gasPrice.times(Meteor.settings.public.txGas);

            return getWeiPerSoar()
                .then((weiPerSoar) => gasPrice.times(2).dividedToIntegerBy(weiPerSoar))
                .then(txPrice => {
                    gasPrice = txPrice;
                    return callContractMethod("SoarCoin", "balanceOf", profile.address);
                })
                .then(balance => {
                    if (balance.comparedTo(gasPrice.plus(amount)) < 0) {
                        return Promise.reject("insufficient funds");
                    }
                    /*transfer the gas price in SOAR */
                    return createRawTx("SoarCoinImplementation", "transfer", 0, oracle.address, 0,
                        profile.address, oracle.address, gasPrice.toString(10))
                })
                .then(tx => {
                    return signAndSubmit(Meteor.settings.ethPassword, tx.rawTx, oracle.address)
                })
                .then(tx => {
                    return createRawTx("SoarCoinImplementation", "transfer", 0, oracle.address, 0, profile.address, recipient, amount)
                })
                .then(tx => {
                    return signAndSubmit(Meteor.settings.ethPassword, tx.rawTx, oracle.address)
                })
                .then(Meteor.bindEnvironment(tx => {
                    console.log("transaction", getWeb3().eth.getTransaction(tx));
                    return waitForTxMining(tx).then()
                }))
                .then((receipt) => {
                    syncBalance(profile.address);
                    syncBalance(recipient);
                    console.log("transfer done", receipt);
                    return receipt;
                })
                .catch(err => {
                    throw new Meteor.Error(err);
                })
        }
    }
});