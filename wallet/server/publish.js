import {Profiles, Roles} from "../imports/model/profiles";
import {Globals} from "../imports/model/globals";
import {Transactions} from "../imports/model/transactions";
import {add0x} from "../imports/ethereum/ethereum-services";

Meteor.startup (() => {
});

Meteor.publish("current-profile", function () {
    return Profiles.find({owner: this.userId});
});

Meteor.publish("user-profile", function (address) {
    let profile = Profiles.findOne({owner: this.userId});
    if (profile && profile.role === Roles.administrator)
        return Profiles.find({address: add0x(address)});
    return Profiles.find({address: "unauthorized"});
});

Meteor.publish("documents", function () {
    return Documents.find({});
});

Meteor.publish("globals", function () {
    return Globals.find({});
});

Meteor.publish("transactions", function () {
    let address = add0x(Meteor.users.findOne({_id: this.userId}).username);
    return Transactions.find({$or: [{from: address}, {to: address}]}, {sort: {timestamp: -1}, limit: 100});
})