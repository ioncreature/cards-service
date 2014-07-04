/**
 * @author Alexander Marenin
 * @date July 2014
 */


var mongoose = require( 'mongoose' ),
    util = require( './util' ),
    url = require( 'url' ),
    connection;

/**
 * @param {Array} connectObject
 * @param {Object?} options
 * @param {function(error Error)} callback
 */
exports.connect = function( connectObject, options, callback ){
    var url = connectObject.map( format ).join( ',' );

    connection = mongoose.connect( url, options, callback );
};


exports.Issuer = mongoose.model( 'Issuer', require('./models/Issuer'), 'issuers' );
exports.CardType = mongoose.model( 'CardType', require('./models/CardType'), 'cardTypes' );
exports.Card = mongoose.model( 'Card', require('./models/Card'), 'cards' );
exports.User = mongoose.model( 'User', require('./models/Card'), 'users' );


function format( connectionParams ){
    var settings = {
        port: 27017,
        slashes: true,
        protocol: 'mongodb'
    };

    settings.pathname = connectionParams.dbname;

    return url.format( util.mixin(settings, connectionParams) );
}