/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema,
    statePlugin = require( './plugins/state' ),
    CardType = new Schema({
        name: {type: String, required: true},
        issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true, required: true},
        magneticStripe: {type: Boolean, default: false},
        cardNumber: {type: Boolean, default: false},
        cardNumberLength: {type: Number, default: 0},
        userName: {type: Boolean, default: false},
        chip: {type: Boolean, default: false},
        nfc: {type: Boolean, default: false}
    });

CardType.plugin( statePlugin );

module.exports = CardType;
