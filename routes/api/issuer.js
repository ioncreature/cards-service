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
    mime = require( 'mime' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    Issuer = db.Issuer,
    CardType = db.CardType,
    Card = db.Card,
    File = db.File,
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
        async.parallel({
            issuer: function( cb ){
                Issuer.findById( id, cb );
            },
            types: function( cb ){
                CardType.find( {issuerId: id}, cb );
            }
        }, function( error, result ){
            var issuer = result.issuer;
            if ( error )
                next( error );
            else if ( !issuer ){
                var e = new Error( 'Issuer not found' );
                e.status = 404;
                next( e );
            }
            else {
                var iss = issuer.toObject();
                iss.cardTypes = result.types || [];
                res.json( iss );
            }
        });
    else
        next( new Error('Invalid issuer id') );
};


exports.getIssuerImage = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        Card.findOne( {issuerId: id}, function( error, card ){
            if ( error )
                next( error );
            else if ( !card || !card.imgFrontId ){
                var e = new Error( 'Not found' );
                e.status = 404;
                next( e );
            }
            else
                File.findById( card.imgFrontId, function( error, file ){
                    if ( error )
                        next( error );
                    if ( !file ){
                        e = new Error( 'Not found' );
                        e.status = 404;
                        next( e );
                    }
                    else {
                        res.type( file.mimeType || mime.lookup(file.name) );
                        res.set( 'Content-Disposition', 'filename="' + file.name + '"' );
                        res.send( file.data );
                    }
                });
        });
    else
        next( new Error('Invalid issuer id') );
};


exports.getIssuerCardTypes = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        CardType.find( {issuerId: id}, function( error, list ){
            if ( error )
                next( error );
            else
                res.json( list || [] );
        });
    else
        next( new Error('Invalid issuer id') );
};