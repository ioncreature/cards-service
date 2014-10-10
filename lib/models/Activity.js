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
    async = require( 'async' ),
    util = require( '../util' );

var Activity = new Schema({
    accountId: {type: Schema.Types.ObjectId, ref: 'Account', index: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', index: true},
    entityId: {type: Schema.Types.ObjectId, index: true, required: true},
    entityType: {type: String, enum: ['issuer', 'card', 'card type', 'user', 'account']},
    action: {type: String, enum: [CREATE, UPDATE, REMOVE]},
    moderate: Boolean,
    diff: Object
});


Activity.index( {accountId: true, entityId: true} );

Activity.statics.CREATE = CREATE;
Activity.statics.UPDATE = UPDATE;
Activity.statics.REMOVE = REMOVE;


Activity.statics.createByUser = function( userId, doc, explicitFields, callback ){
    var docs = doc instanceof Array ? doc : [doc],
        Activity = this.model( 'Activity' );

    async.each( docs, function( doc, cb ){
        Activity.createFrom( {
            userId: userId,
            doc: doc,
            fields: explicitFields
        }, cb );
    }, callback || util.noop )
};


Activity.statics.createByAccount = function( accountId, doc, explicitFields, callback ){
    var docs = doc instanceof Array ? doc : [doc],
        Activity = this.model( 'Activity' );

    async.each( docs, function( doc, cb ){
        Activity.createFrom({
            accountId: accountId,
            doc: doc,
            fields: explicitFields
        }, cb );
    }, callback || util.noop );
};


/**
 * @param {Object} options
 * @param {Function?} callback
 */
Activity.statics.createFrom = function( options, callback ){
    var cb = callback || util.noop,
        doc = options.doc,
        type,
        action;

    if ( doc instanceof this.model('Account') )
        type = 'account';
    else if ( doc instanceof this.model('Card') )
        type = 'card';
    else if ( doc instanceof this.model('CardType') )
        type = 'card type';
    else if ( doc instanceof this.model('Issuer') )
        type = 'issuer';
    else
        throw new Error( 'Unknown document type' );

    if ( doc._isNew )
        action = CREATE;
    else if ( doc._isRemove )
        action = REMOVE;
    else
        action = UPDATE;

    var data = {
        entityId: doc._id,
        entityType: type,
        action: action
    };

    if ( options.accountId )
        data.accountId = options.accountId;

    if ( options.userId )
        data.userId = options.userId;

    if ( options.fields )
        util.mixin( data, options.fields );

    if ( !data.diff )
        data.diff = getDiff( doc._original, doc.toObject() );

    this.model( 'Activity' ).create( data, cb );
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
    var prevObj = prev && typeof prev.toObject === 'function' ? prev.toObject() : (prev || {}),
        currObj = curr && typeof curr.toObject === 'function' ? curr.toObject() : (curr || {}),
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


module.exports = Activity;