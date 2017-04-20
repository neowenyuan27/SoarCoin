import {Profiles, Roles} from "../import/model/profiles";
import {Globals} from "../import/model/globals";
import {add0x} from "../import/ethereum/ethereum-services";

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