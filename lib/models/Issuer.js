/**
 * @author Alexander Marenin
 * @date July 2014
 */

const
    LOW = -1,
    NORMAL = 0,
    HIGH = 1,
    VERY_HIGH = 2;

var Schema = require( 'mongoose' ).Schema,
    util = require( '../util' ),
    statePlugin = require( './plugins/state' ),
    Issuer = new Schema({
        name: {type: String, index: true, required: true, unique: true},
        description: String,
        url: String,
        phone: String,
        address: String,
        cards: {type: Number, index: true, default: 0},
        priority: {type: Number, enum: [LOW, NORMAL, HIGH, VERY_HIGH], default: NORMAL}
    });

Issuer.statics.LOW = LOW;
Issuer.statics.NORMAL = NORMAL;
Issuer.statics.HIGH = HIGH;
Issuer.statics.VERY_HIGH = VERY_HIGH;


Issuer.plugin( statePlugin );


Issuer.post( 'save', function( doc ){
    if ( doc._original && doc._original.name !== doc.name )
        this.model( 'Card' ).update( {issuerId: doc._id}, {issuerName: doc.name}, {multi: true}, util.noop );
});


Issuer.statics.increaseCards = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {cards: 1}}, callback );
};


Issuer.statics.decreaseCards = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {cards: -1}}, callback );
};


Issuer.statics.hasCardType = function( issuerId, typeId, callback ){
    this.model( 'CardType' ).find( {issuerId: issuerId}, function( error, type ){
        callback( null, !(error || !type) );
    });
};

module.exports = Issuer;