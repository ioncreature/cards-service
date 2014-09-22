/**
 * @author Alexander Marenin
 * @date September 2014
 */

var Schema = require( 'mongoose' ).Schema;

var ActivityLog = new Schema({
    accountId: {type: Schema.Types.ObjectId, ref: 'Account', index: true, required: true},
    entityId: {type: Schema.Types.ObjectId, index: true, required: true},
    entityType: {type: String, enum: 'issuer card cardType file user'.split(' ')},
    type: {type: String, enum: 'create update remove'.split(' ')},
    moderate: Boolean,
    become: Object
});

ActivityLog.index( {accountId: true, entityId: true} );