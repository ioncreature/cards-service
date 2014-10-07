/**
 * @author Alexander Marenin
 * @date September 2014
 */

var Schema = require( 'mongoose' ).Schema,
    ObjectId = require( 'mongoose' ).Types.ObjectId,
    util = require( '../util' );

var Activity = new Schema({
    accountId: {type: Schema.Types.ObjectId, ref: 'Account', index: true, required: true},
    entityId: {type: Schema.Types.ObjectId, index: true, required: true},
    entityType: {type: String, enum: ['issuer', 'card', 'card type', 'user', 'account']},
    action: {type: String, enum: ['create', 'update', 'remove']},
    moderate: Boolean,
    diff: Object
});

module.exports = Activity;

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


Activity.statics.countTodayModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('today')},
        entityType: 'card',
        action: 'update',
        moderate: true
    }, callback );
};


Activity.statics.countWeekModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('week')},
        entityType: 'card',
        action: 'update',
        moderate: true
    }, callback );
};


Activity.statics.countMonthModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('month')},
        entityType: 'card',
        action: 'update',
        moderate: true
    }, callback );
};


function getDateObjectId( date ){
    var d = new Date;
    d.setHours( 0 );
    d.setMinutes( 0 );
    d.setSeconds( 0 );
    d.setMilliseconds( 0 );

    switch ( date ){
        case 'week':
            d.setTime( d.getTime() - 7 * 24 * 3600 * 1000 );
            break;
        case 'month':
            d.setTime( d.getTime() - 30 * 24 * 3600 * 1000 );
    }

    return ObjectId.createFromTime( Math.floor(d.getTime() / 1000) );
}