/**
 * @author Alexander Marenin
 * @date July 2014
 */


var mongoose = require( 'mongoose' ),
    util = require( './util' ),
    url = require( 'url' );


exports.ObjectId = mongoose.Types.ObjectId;
exports.Issuer = mongoose.model( 'Issuer', require('./models/Issuer'), 'issuers' );
exports.CardType = mongoose.model( 'CardType', require('./models/CardType'), 'cardTypes' );
exports.Card = mongoose.model( 'Card', require('./models/Card'), 'cards' );
exports.User = mongoose.model( 'User', require('./models/User'), 'users' );
exports.Account = mongoose.model( 'Account', require('./models/Account'), 'accounts' );
exports.File = mongoose.model( 'File', require('./models/File'), 'files' );


/**
 * @param {Array} serverList
 * @param {Object} options
 * @param {function(error Error), db} callback
 */
exports.connect = function( serverList, options, callback ){
    var url = serverList.map( format ).join( ',' );
    mongoose.connect( url, options, function( error ){
        callback( error, mongoose.connection.db );
    });
};


function format( serverParams ){
    var settings = {
        port: 27017,
        slashes: true,
        protocol: 'mongodb'
    };
    settings.pathname = serverParams.dbname;
    return url.format( util.mixin(settings, serverParams) );
}