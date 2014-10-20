/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema,
    statePlugin = require( './plugins/state' ),
    Card = new Schema({
        city: String,
        issuerName: String,
        description: {type: String, default: ''},
        issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true},
        typeName: String,
        typeId: {type: Schema.Types.ObjectId, ref: 'CardType', index: true},
        userId: {type: Schema.Types.ObjectId, ref: 'User', index: true},
        imgFrontId: {type: Schema.Types.ObjectId, ref: 'File'},
        imgBackId: {type: Schema.Types.ObjectId, ref: 'File'},
        number: String,
        lastOpen: {type: Number, default: 0},
        lastAccount: {type: Schema.Types.ObjectId, ref: 'Account'},
        lastEditor: {type: Schema.Types.ObjectId, ref: 'Account'}
    });


Card.plugin( statePlugin );


Card.post( 'remove', function(){
    if ( this.issuerId )
        this.model( 'Issuer' ).decreaseCards( this.issuerId, util.noop );
    if ( this.imgFrontId )
        this.model( 'File' ).findOneAndRemove( {_id: this.imgFrontId}, util.noop );
    if ( this.imgBackId )
        this.model( 'File' ).findOneAndRemove( {_id: this.imgBackId}, util.noop );
});


Card.methods.isFull = function(){
    var full = !!( this.issuerId && this.typeId );

    if ( !this.imgFrontId )
        full = false;

    if ( !this.imgBackId )
        full = false;

    return full;
};


Card.methods.setLast = function( accountId, callback ){
    this.model( 'Card' ).findByIdAndUpdate( this._id, {$set: {lastOpen: Date.now(), lastAccount: accountId}}, callback );
};

module.exports = Card;
