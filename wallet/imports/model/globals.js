import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";

export const Globals = new Mongo.Collection('globals');

Globals.deny({
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