import {getWeb3} from "../import/ethereum/ethereum-services";
import {callContractMethod, createRawValueTx} from "../import/ethereum/ethereum-contracts";
import {Profiles, currentProfile} from "../import/model/profiles";

const syncBalance = function (address) {
    callContractMethod("SoarCoin", "balanceOf", address)
        .then((balance) => {
            Profiles.update({address: address}, {$set: {soarBalance: balance.toString()}});
        });
}

Meteor.methods({
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
        Meteor.setTimeout(Meteor.bindEnvironment(function () {
            syncBalance(currentProfile().address);
            syncBalance(recipientAddress);
        }), 2000);
    }
});