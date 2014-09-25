/**
 * @author Alexander Marenin
 * @date September 2014
 */

var Schema = require( 'mongoose' ).Schema,
    util = require( '../util' );

var Activity = new Schema({
    accountId: {type: Schema.Types.ObjectId, ref: 'Account', index: true, required: true},
    entityId: {type: Schema.Types.ObjectId, index: true, required: true},
    entityType: {type: String, enum: 'issuer card cardType file user'.split(' ')},
    action: {type: String, enum: 'create update remove'.split(' ')},
    moderate: Boolean,
    diff: Object
});

Activity.index( {accountId: true, entityId: true} );

Activity.statics.getDiff = function( prev, curr ){
    var prevObj = typeof prev.toObject === 'function' ? prev.toObject() : prev,
        currObj = typeof curr.toObject === 'function' ? curr.toObject() : curr,
        keys = Object.keys( util.mixin({}, prevObj, currObj) ),
        diff = keys.reduce( function( res, key ){
            if ( String(prevObj[key]) !== String(currObj[key]) )
                res[key] = currObj[key];
            return res;
        }, {} );
    return Object.keys( diff ).length > 0 && diff;
};

module.exports = Activity;