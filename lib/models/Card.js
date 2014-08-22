/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

var CardSchema = new Schema({
    city: String,
    issuerName: String,
    issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true},
    typeName: String,
    typeId: {type: Schema.Types.ObjectId, ref: 'CardType', index: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', index: true},
    imgFront: {data: Buffer, mimeType: String},
    imgBack: {data: Buffer, mimeType: String},
    lastOpen: {type: Number, default: 0}
});


CardSchema.methods.isFull = function(){
    var full = !!( this.issuerId && this.typeId );

    if ( !this.imgFront || !this.imgFront.mimeType )
        full = false;

    if ( !this.imgBack || !this.imgBack.mimeType )
        full = false;

    return full;
};

module.exports = CardSchema;
