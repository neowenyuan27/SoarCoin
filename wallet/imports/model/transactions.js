import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {add0x} from "../ethereum/ethereum-services";
import {currentProfile} from "./profiles";

export const Transactions = new Mongo.Collection('transactions');

Transactions.deny({
    insert: function (userId, doc) {
        return !Meteor.isServer;
    },
    update: function (userId, doc, fields, modifier) {
        return !Meteor.isServer;
    },
    remove: function (userId, doc) {
        return !Meteor.isServer;
    }
});