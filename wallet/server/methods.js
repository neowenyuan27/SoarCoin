import {getWeb3, soar} from "../imports/ethereum/ethereum-services";
import {callContractMethod, createRawValueTx} from "../imports/ethereum/ethereum-contracts";
import {Profiles, currentProfile} from "../imports/model/profiles";
import {HTTP} from 'meteor/http'
import {Random} from 'meteor/random'
import {Email} from 'meteor/email'

const syncBalance = function (address) {
    return callContractMethod("SoarCoin", "balanceOf", address)
        .then((balance) => {
            Profiles.update({address: address}, {$set: {soarBalance: balance.toString()}});
        });
}

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

    "get-tx-ether": function () {

    },

    "sync-user-details": function () {
        syncBalance(currentProfile().address);
    },

    "get-name-for-address": function (address) {
        let profile = Profiles.findOne({address: address});
        if (profile) return profile.email;
        return null;
    },

    "update-balances": function (recipientAddress) {
        return new Promise(function (resolve, reject) {
            Meteor.setTimeout(Meteor.bindEnvironment(function () {
                syncBalance(currentProfile().address);
                syncBalance(recipientAddress);
                resolve();
            }), 0);
        })
    }
});