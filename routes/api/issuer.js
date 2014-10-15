/**
 * @author Alexander Marenin
 * @date October 2014
 */

const
    DAY = 24 * 3600 * 1000,
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
    Place = db.Place,
    File = db.File,
    ObjectId = db.ObjectId;


exports.getIssuers = function( req, res, next ){
    var sort = String( req.query.sort || '' ),
        search = req.query.search && req.query.search.trim().substr( 0, SEARCH_STRING_MAX_LENGTH ),
        limit = Number( req.query.limit ),
        query = {},
        options = {sort: {cards: -1}};

    if ( sort ){
        var sortField = sort.split( ',' )[0],
            order = sort.split( ',' )[1];
        if ( sortField ){
            options.sort = {};
            options.sort[sortField] = order === 'DESC' ? -1 : 1;
        }
    }

    if ( search )
        query.name = new RegExp( search, 'i' );

    if ( !isNaN(limit) && limit > 0 )
        options.limit = limit;

    Issuer.find( query, null, options, function( error, list ){
        if ( error )
            next( error );
        else {
            res.set( 'Expires', new Date(Date.now() + DAY) );
            res.json( list );
        }
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
            },
            places: function( cb ){
                Place.find( {issuerId: id}, cb );
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
                var i = issuer.toObject();
                i.cardTypes = result.types || [];
                i.places = result.places || [];
                res.json( i );
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


exports.getIssuerPlaces = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        Place.find( {issuerId: id}, function( error, list ){
            if ( error )
                next( error );
            else
                res.json( list || [] );
        });
    else
        next( new Error('Invalid issuer id') );
};