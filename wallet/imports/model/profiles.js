import {Mongo} from "meteor/mongo";
import BigNumber from "bignumber.js";
import {ether, soar} from "../ethereum/ethereum-services";

export const Profiles = new Mongo.Collection('profiles',
    {
        transform: (profile) => {
            if (profile.ethBalance)
                profile.ethBalance = new BigNumber(profile.ethBalance.toString(10)).dividedBy(ether);
            else
                profile.ethBalance = new BigNumber(0);

            if (profile.soarBalance)
                profile.soarBalance = new BigNumber(profile.soarBalance.toString(10)).dividedBy(soar);
            else
                profile.soarBalance = new BigNumber(0);

            profile.formattedEthBalance = profile.ethBalance.round(2).toFormat(2);
            profile.formattedSoarBalance = profile.soarBalance.round(2).toFormat(2);
            return profile;
        }
    });

Profiles.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents unless you are an admin
        console.log(userId, ' is owner ', doc.owner, doc.owner === userId);
        return doc.owner === userId || Profiles.find({role: Roles.administrator, owner: userId}).count() > 0;
    },
    remove: function (userId, doc) {
        // can only remove your own documents unless you are an admin
        return doc.owner === userId || Profiles.find({role: Roles.administrator, owner: userId}).count() > 0;
    },
    fetch: ['owner']
});

Profiles.deny({
    update: function (userId, doc, fields, modifier) {
        // can't change owners
        return _.contains(fields, 'owner');
    },
    remove: function (userId, doc) {
        // can't remove locked documents
        return doc.locked;
    },
    fetch: ['locked'] // no need to fetch 'owner'
});

export const currentProfile = function () {
    return Profiles.findOne({owner: Meteor.userId()}) || {
            alias: "not logged in",
            balance: new BigNumber(0),
            soarBalance: new BigNumber(0),
            ethBalance: new BigNumber(0),
            address: "0x0",
        };
};

export const Roles = {
    all: -1,
    coinowner: 0,
    administrator: 1,
};
