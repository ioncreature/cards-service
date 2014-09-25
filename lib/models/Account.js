/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema,
    crypto = require( 'crypto' );

var Account = new Schema({
    login: {type: String, index: {unique: true}},
    password: String,
    role: [String],
    name: String,
    email: String,
    phone: String,
    moderatedCards: {type: Number, default: 0},
    moderatedIssuers: {type: Number, default: 0}
});


module.exports = Account;


Account.statics.login = function( login, password, callback ){
    this.findOne( {login: login}, function( error, account ){
        if ( error )
            callback( error );
        else if ( !account || hashPassword(password) !== account.password )
            callback( new Error('Incorrect login or password') );
        else
            callback( error, account );
    });
};


Account.statics.addModeratedCard = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {moderatedCards: 1}}, callback );
};


Account.statics.addModeratedIssuer = function( id, callback ){
    this.findByIdAndUpdate( id, {$inc: {moderatedIssuers: 1}}, callback );
};


Account.path( 'password' ).set( function( value ){
    return hashPassword( value );
});


Account.statics.hashPassword = hashPassword;


function hashPassword( password ){
    return crypto.createHash( 'md5' ).update(
            crypto.createHash( 'sha1' ).update( password ).digest( 'hex' ) + 'wow! such secret! so secure!'
    ).digest( 'hex' );
}