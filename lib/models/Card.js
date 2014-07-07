/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: String,
    city: String,
    issuerName: String,
    issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer'},
    typeId: {type: Schema.Types.ObjectId, ref: 'CardType'},
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    full: Boolean,
    images: [Buffer]
});