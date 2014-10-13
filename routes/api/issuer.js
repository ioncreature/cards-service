/**
 * @author Alexander Marenin
 * @date October 2014
 */

const
    ISSUERS_LIMIT = 50,
    SEARCH_STRING_MAX_LENGTH = 20;

var registry = require( '../../lib/registry' ),
    async = require( 'async' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;


exports.getIssuers = function( req, res, next ){
    var search = req.query.search && req.query.search.trim().substr( 0, SEARCH_STRING_MAX_LENGTH ),
        query = {};

    if ( search )
        query.name = new RegExp( search, 'i' );

    Issuer.find( query, null, {
        limit: ISSUERS_LIMIT,
        sort: {cards: -1}
    }, function( error, list ){
        if ( error )
            next( error );
        else
            res.json( list );
    });
};


exports.getIssuer = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        Issuer.findById( id, function( error, issuer ){
            if ( error )
                next( error );
            else if ( !issuer ){
                var e = new Error( 'Issuer not found' );
                e.status = 404;
                next( e );
            }
            else
                res.json( issuer );
        });
    else
        next( new Error('Invalid issuer id') );
};


exports.getIssuerImage = function( req, res, next ){
    res.json( 'ok' );
};
