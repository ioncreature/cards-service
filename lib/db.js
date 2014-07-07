/**
 * @author Alexander Marenin
 * @date July 2014
 */


var mongoose = require( 'mongoose' ),
    util = require( './util' ),
    url = require( 'url' ),
    connection;

/**
 * @param {Array} serverList
 * @param {Object?} options
 * @param {function(error Error)} callback
 */
exports.connect = function( serverList, options, callback ){
    var url = serverList.map( format ).join( ',' );

    connection = mongoose.connect( url, options, callback );
};


exports.Issuer = mongoose.model( 'Issuer', require('./models/Issuer'), 'issuers' );
exports.CardType = mongoose.model( 'CardType', require('./models/CardType'), 'cardTypes' );
exports.Card = mongoose.model( 'Card', require('./models/Card'), 'cards' );
exports.User = mongoose.model( 'User', require('./models/User'), 'users' );


function format( serverParams ){
    var settings = {
        port: 27017,
        slashes: true,
        protocol: 'mongodb'
    };

    settings.pathname = serverParams.dbname;

    return url.format( util.mixin(settings, serverParams) );
}