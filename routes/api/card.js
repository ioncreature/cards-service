/**
 * @author Alexander Marenin
 * @date September 2014
 */

const
    DEFAULT_LIMIT = 100,
    MAX_LIMIT = 1000;

var util = require( '../../lib/util' ),
    async = require( 'async' ),
    mime = require( 'mime' ),
    fs = require( 'fs' ),
    httpError = require( '../../lib/http-error' ),
    registry = require( '../../lib/registry' ),
    config = registry.get( 'config' ),
    db = registry.get( 'db' ),
    Card = db.Card,
    CardType = db.CardType,
    User = db.User,
    File = db.File,
    ObjectId = db.ObjectId,
    Matcher = require( '../../lib/Matcher' ),
    matcher;


if ( config.matcher )
    matcher = new Matcher( config.kuznech );


exports.getCards = function( req, res, next ){
    var skip = Number( req.query.skip ) || 0,
        limit = Number( req.query.limit ) || DEFAULT_LIMIT;

    if ( limit > MAX_LIMIT )
        limit = MAX_LIMIT;

    Card.find().skip( skip ).limit( limit ).exec( function( error, list ){
        if ( error )
            next( error );
        else
            res.json( list );
    });
};


exports.getCard = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) ){
        Card.findById( id, function( error, card ){
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound );
            else
                res.json( card );
        });
    }
    else
        next( new httpError.BadRequest('Card id is invalid') );
};


exports.createCard = function( req, res, next ){
    var b = req.body,
        userId = b.userId,
        files = req.files,
        cardData = {},
        queries = {};

    if ( !userId )
        next( new httpError.BadRequest('userId is required') );
    else if ( !ObjectId.isValid(userId) )
        next( new httpError.BadRequest('User id is invalid') );
    else
        User.findById( userId, function( error, user ){
            if ( error || !user )
                next( error || new httpError.NotFound('User not found') );
            else {
                cardData.userId = user._id;
                cardData.description = b.description || '';

                if ( b.city )
                    cardData.city = util.stripTags( b.city );
                if ( b.issuerId && ObjectId.isValid(b.issuerId) )
                    cardData.issuerId = b.issuerId;
                if ( b.typeId && ObjectId.isValid(b.typeId) )
                    cardData.typeId = b.typeId;

                if ( !files.imgBack && !files.imgFront )
                    next( new httpError.BadRequest('Required at least one of imgBack or imgFront parameters') );
                else {
                    if ( files.imgFront )
                        queries.imgFront = saveFile( files.imgFront, userId );
                    if ( files.imgBack )
                        queries.imgBack = saveFile( files.imgBack, userId );

                    if ( matcher && files.imgFront && files.imgBack )
                        queries.match = function( cb ){
                            matcher.match( files.imgFront.path, files.imgBack.path, function( error, result ){
                                if ( error )
                                    console.error( error );
                                cb( null, result );
                            });
                        };

                    delete req.files;
                    async.parallel( queries, function( error, result ){
                        if ( error )
                            next( error );
                        else {
                            if ( result.imgFront ){
                                removeFile( files.imgFront );
                                cardData.imgFrontId = result.imgFront[0]._id;
                            }
                            if ( result.imgBack ){
                                removeFile( files.imgBack );
                                cardData.imgBackId = result.imgBack[0]._id;
                            }
                            if ( result.match ){
                                if ( result.match.issuerId && ObjectId.isValid(result.match.issuerId) )
                                    cardData.issuerId = new ObjectId( result.match.issuerId );
                                if ( result.match.typeId && ObjectId.isValid(result.match.typeId) )
                                    cardData.typeId = new ObjectId( result.match.typeId );
                            }

                            var card = new Card;
                            card.set( cardData );
                            card.save( function( error, card ){
                                if ( error )
                                    next( error );
                                else
                                    res.json( card );
                            });
                        }
                    });
                }
            }
        });
};


exports.removeCard = function( req, res, next ){
    var id = req.params.id,
        userId = req.query.userId;

    if ( ObjectId.isValid(id) && ObjectId.isValid(userId) )
        Card.findById( id, function( error, card ){
            var e;
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound );
            else if ( String(card.userId) !== userId )
                next( new httpError.Forbidden );
            else
                Card.findByIdAndRemove( id, function( error ){
                    if ( error )
                        next( error );
                    else
                        res.json( 'ok' );
                });
        });
    else
        next( new httpError.BadRequest('Card or user id is invalid') );
};


exports.updateCard = function( req, res, next ){
    var id = req.params.id,
        typeId = req.body.typeId,
        issuerId = req.body.issuerId,
        number = Number( req.body.number );

    if ( ObjectId.isValid(id) ){
        Card.findById( id, function( error, card ){
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound );
            else {
                if ( issuerId && ObjectId.isValid(issuerId) )
                    card.issuerId = new ObjectId( issuerId );
                if ( typeId && ObjectId.isValid( typeId ) )
                    card.typeId = new ObjectId( typeId );
                if ( !isNaN(number) )
                    card.number = number;
                card.save( function( error ){
                    if ( error )
                        next( error );
                    else
                        res.json( card );
                });
            }
        });
    }
    else
        next( new httpError.BadRequest('Card id is invalid') );
};


exports.getPhoto = function( req, res, next ){
    var id = req.params.id,
        field = req.params.type === 'front' ? 'imgFrontId' : 'imgBackId';

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Card.findById( id, field, function( error, card ){
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound('Card with ID "' + util.stripTags(id) + '" not found') );
            else if ( !card[field] )
                next( new httpError.NotFound('Card with ID "' + util.stripTags(id) + '" does not have and image') );
            else
                File.findOne( card[field], function( error, file ){
                    if ( error )
                        next( error );
                    else if ( !file )
                        next( new httpError.NotFound('File not found') );
                    else {
                        res.type( file.mimeType || mime.lookup(file.name) );
                        res.set( 'Content-Disposition', 'filename="' + file.name + '"' );
                        res.send( file.data );
                    }
                });
        });
    }
    else
        next( new httpError.BadRequest('Incorrect card ID "' + util.stripTags(id) + '"') );
};


exports.getFile = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        File.findById( id, function( error, file ){
            if ( error )
                next( error );
            else if ( !file )
                next( new httpError.NotFound );
            else {
                res.type( file.mimeType || mime.lookup(file.name) );
                res.set( 'Content-Disposition', 'filename="' + file.name + '"' );
                res.send( file.data );
            }
        });
    else
        next( new httpError.BadRequest('File id is invalid') );
};


function saveFile( fileDesc, id ){
    return function( cb ){
        var file = new File,
            data = fs.readFileSync( fileDesc.path );
        file.set({
            name: fileDesc.originalname,
            data: data,
            mimeType: fileDesc.mimetype,
            fileSize: data.length,
            linkedEntity: id || undefined
        });
        file.save( cb );
    };
}


function removeFile( fileDesc ){
    fs.unlink( fileDesc.path, util.noop );
}