/**
 * @author Alexander Marenin
 * @date September 2014
 */

const
    DEFAULT_LIMIT = 100,
    MAX_LIMIT = 1000;

var util = require( '../../lib/util' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    registry = require( '../../lib/registry' ),
    db = registry.get( 'db' ),
    Card = db.Card,
    User = db.User,
    File = db.File,
    ObjectId = db.ObjectId;


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


exports.createCard = function( req, res, next ){
    var b = req.body,
        userId = b.userId,
        files = req.files,
        cardData = {},
        queries = {};

    if ( !userId )
        next( new Error('userId is required') );
    else if ( !ObjectId.isValid(userId) )
        next( new Error('User id is invalid') );
    else
        User.findOne( new ObjectId(userId), function( error, user ){
            if ( error || !user )
                next( error || new Error('User not found') );
            else {
                cardData.userId = user._id;
                if ( b.city )
                    cardData.city = util.stripTags( b.city );
                if ( b.issuerId && ObjectId.isValid(b.issuerId) )
                    cardData.issuerId = b.issuerId;
                if ( b.typeId && ObjectId.isValid(b.typeId) )
                    cardData.typeId = b.typeId;

                if ( !files.imgBack && !files.imgFront )
                    next( new Error('Required at least one of imgBack or imgFront parameters') );
                else {
                    if ( files.imgBack )
                        queries.imgBack = saveFile( files.imgBack, userId );
                    if ( files.imgFront )
                        queries.imgFront = saveFile( files.imgFront, userId );
                    delete req.files;
                    async.parallel( queries, function( error, result ){
                        if ( error )
                            next( error );
                        else {
                            if ( result.imgBack )
                                cardData.imgBackId = result.imgBack[0]._id;
                            if ( result.imgFront )
                                cardData.imgFrontId = result.imgFront[0]._id;

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


exports.getPhoto = function( req, res, next ){
    var id = req.params.id,
        field = req.params.type === 'front' ? 'imgFrontId' : 'imgBackId';

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Card.findById( id, field, function( error, card ){
            var e;
            if ( error )
                next( error );
            else if ( !card ){
                e = new Error( 'Card with ID "' + util.stripTags( id ) + '" not found' );
                e.status = 404;
                next( e );
            }
            else if ( !card[field] ){
                e = new Error( 'Card with ID "' + util.stripTags( id ) + '" does not have and image' );
                e.status = 404;
                next( e );
            }
            else
                File.findOne( card[field], function( error, file ){
                    if ( error )
                        next( error );
                    else if ( !file ){
                        e = new Error( 'File not found' );
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
    }
    else
        next( new Error('Incorrect card ID "' + util.stripTags(id) + '"') );
};


function findUser( id, callback ){

}


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
        fs.unlinkSync( fileDesc.path );
        file.save( cb );
    };
}