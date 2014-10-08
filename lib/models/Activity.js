/**
 * @author Alexander Marenin
 * @date September 2014
 */

const
    CREATE = 'create',
    UPDATE = 'update',
    REMOVE = 'remove';

var Schema = require( 'mongoose' ).Schema,
    ObjectId = require( 'mongoose' ).Types.ObjectId,
    util = require( '../util' );

var Activity = new Schema({
    accountId: {type: Schema.Types.ObjectId, ref: 'Account', index: true, required: true},
    entityId: {type: Schema.Types.ObjectId, index: true, required: true},
    entityType: {type: String, enum: ['issuer', 'card', 'card type', 'user', 'account']},
    action: {type: String, enum: [CREATE, UPDATE, REMOVE]},
    moderate: Boolean,
    diff: Object
});

module.exports = Activity;

Activity.index( {accountId: true, entityId: true} );


/**
 * @param {Schema.Types.ObjectId} accountId
 * @param {Document} doc
 * @param {Object|Function?} explicitFields
 * @param {Function?} callback
 */
Activity.statics.createFrom = function( accountId, doc, explicitFields, callback ){
    var fields = explicitFields,
        type,
        action,
        data,
        model = this.model;

    if ( arguments.length == 2 )
        callback = util.noop;
    else if ( arguments.length == 3 ){
        if ( typeof explicitFields === 'function' ){
            callback = explicitFields;
            fields = false;
        }
        else
            callback = util.noop;
    }

    if ( doc instanceof model('Account') )
        type = 'account';
    else if ( doc instanceof model('Card') )
        type = 'card';
    else if ( doc instanceof model('CardType') )
        type = 'card type';
    else if ( doc instanceof model('Issuer') )
        type = 'issuer';
    else
        throw new Error( 'Unknown document type' );

    if ( doc._isNew )
        action = CREATE;
    else if ( doc._isRemove )
        action = REMOVE;
    else
        action = UPDATE;

    data = {
        accountId: accountId,
        entityId: doc._id,
        entityType: type,
        action: action
    };

    if ( fields )
        util.mixin( data, fields );

    if ( !data.diff )
        data.diff = getDiff( doc._original, doc.toObject() );


    this.model( 'Activity' ).create( data, callback );
};


Activity.statics.getDiff = getDiff;


Activity.statics.countTodayModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('today')},
        entityType: 'card',
        action: UPDATE,
        moderate: true
    }, callback );
};


Activity.statics.countWeekModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('week')},
        entityType: 'card',
        action: UPDATE,
        moderate: true
    }, callback );
};


Activity.statics.countMonthModeratedCards = function( accountId, callback ){
    this.model( 'Activity' ).count({
        accountId: accountId,
        _id: {$gt: getDateObjectId('month')},
        entityType: 'card',
        action: UPDATE,
        moderate: true
    }, callback );
};


function getDiff( prev, curr ){
    var prevObj = typeof prev.toObject === 'function' ? prev.toObject() : prev,
        currObj = typeof curr.toObject === 'function' ? curr.toObject() : curr,
        keys = Object.keys( util.mixin({}, prevObj, currObj) ),
        diff = keys.reduce( function( res, key ){
            if ( String(prevObj[key]) !== String(currObj[key]) )
                res[key] = currObj[key];
            return res;
        }, {} );
    return Object.keys( diff ).length > 0 && diff;
}


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
