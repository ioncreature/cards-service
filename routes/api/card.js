/**
 * @author Alexander Marenin
 * @date September 2014
 */

var util = require( '../../lib/util' ),
    registry = require( '../../lib/registry' ),
    db = registry.get( 'db' ),
    Card = db.Card,
    User = db.User,
    ObjectId = db.ObjectId;


exports.getCards = function( req, res, next ){
    findUser( req.body.userId, function( error, user ){
        if ( error || !user )
            next( error || new Error('User not found') );
        else
            Card.find( {userId: user._id}, function( error, list ){
                if ( error )
                    next( error );
                else
                    res.json( list );
            });
    });
};


exports.createCard = function( req, res, next ){
    var b = req.body,
        files = req.files,
        cardData = {},
        queries = {};

    findUser( b.userId, function( error, user ){
        if ( error || !user )
            next( error || new Error('User not found') );
        else {
            cardData.userId = user._id;
            if ( b.city )
                cardData.city = util.stripTags( b.city );
            if ( b.issuerId && ObjectId.isValid(b.issuerId) )
                cardData.issuerId = b.issuerId;

            if ( !files.imgBack || !files.imgFront )
                next( new Error('Required at least one of imgBack or imgFront parameters') );
            else {
                if ( files.imgBack )
                    queries.imgBack = saveFile( files.imgBack, id );
                if ( files.imgFront )
                    queries.imgFront = saveFile( files.imgFront, id );
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

function findUser( someId, callback ){
    if ( !someId )
        callback( new Error('userId is required') );
    else
        User.findOne({
            $or: {
                externalId: someId,
                deviceId: someId
            }
        }, callback );
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