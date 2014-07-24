/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

var Issuer = new Schema({
    name: {type: String, index: true, required: true},
    description: String,
    url: String,
    phone: String,
    address: String,
    cards: {type: Number, index: true},
    cardTypes: {type: Number, index: true}
});

module.exports = Issuer;


Issuer.statics.increaseCards = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {cards: 1}}, callback );
};


Issuer.statics.decreaseCards = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {cards: -1}}, callback );
};