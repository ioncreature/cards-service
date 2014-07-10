/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: String,
    city: String,
    issuerName: String,
    issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true},
    typeName: String,
    typeId: {type: Schema.Types.ObjectId, ref: 'CardType', index: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', index: true},
    full: Boolean,
    imgFront: {data: Buffer, mimeType: String},
    imgBack: {data: Buffer, mimeType: String}
});
