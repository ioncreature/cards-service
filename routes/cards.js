/**
 * @author Alexander Marenin
 * @date July 2014
 */

var registry = require( '../lib/registry' ),
    fs = require( 'fs' ),
    async = require( 'async' ),
    util = require( '../lib/util' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    Card = db.Card,
    CardType = db.CardType,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;


exports.getCards = function( req, res, next ){
    Card.find( function( error, cards ){
        if ( error )
            next( error );
        else
            res.render( 'page/cards', {
                pageName: 'cards',
                pageTitle: 'Cards list',
                cards: cards || []
            });
    });
};


exports.getCard = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        async.parallel({
            card: function( cb ){
                Card.findById( id, cb );
            },
            issuers: function( cb ){
                Issuer.find( cb );
            }
        }, function( error, result ){
            var card = result.card,
                issuers = result.issuers;
            if ( error )
                next( error );
            else if ( !card )
                next( new Error('Card with ID ' + id + ' not found') );
            else
                res.render( 'page/card', {
                    pageName: 'cards',
                    pageTitle: 'Card',
                    id: id,
                    name: card.name || '',
                    city: card.city || '',
                    issuerId: card.issuerId || '',
                    issuers: issuers,
                    userId: card.userId || '',
                    showImages: true,
                    postUrl: util.formatUrl( route.CARD_PAGE, {id: id} ),
                    submitCaption: 'Update card'
                });
        });
    }
    else
        next( new Error('Card ID "' + util.stripTags(id) + '" is invalid') );
};


exports.getNewCard = function( req, res, next ){
    Issuer.find( function( error, issuers ){
        if ( error )
            next( error );
        else
            res.render( 'page/card', {
                pageName: 'cards',
                pageTitle: 'Card',
                id: '',
                name: '',
                city: '',
                issuers: issuers || [],
                userId: '',
                showImages: false,
                postUrl: route.NEW_CARD_PAGE,
                submitCaption: 'Create card'
            });
    });
};


exports.createCard = function( error, req, res, next ){
    if ( error )
        next( error );
    else {
        var card = new Card;
        if ( req.files.imgFront ){
            card.imgFront.mimeType = req.files.imgFront.mimetype;
            card.imgFront.data = fs.readFileSync( req.files.imgFront.path );
            fs.unlinkSync( req.files.imgFront.path );
        }
        if ( req.files.imgBack ){
            card.imgBack.mimeType = req.files.imgBack.mimetype;
            card.imgBack.data = fs.readFileSync( req.files.imgBack.path );
            fs.unlinkSync( req.files.imgBack.path );
        }
        delete req.files;
        card.set( cardData );
        card.save( function( error, card ){
            if ( error )
                next( error );
            else
                res.redirect( util.formatUrl(route.CARD_PAGE, {id: card._id}) );
        });
    }
};


exports.validateCard = function( req, res, next ){
    var cardData = {
            name: filterString( req.body.name || '' ),
            city: filterString( req.body.city || '' )
        },
        issuerId = req.body.issuerId && filterString( req.body.issuerId ),
        typeId = req.body.typeId && filterString( req.body.typeId ),
        queries = {},
        error;

    if ( issuerId ){
        if ( ObjectId.isValid(issuerId) ){
            cardData.issuerId = new ObjectId( issuerId );
            queries.issuer = function( cb ){
                Issuer.findById( cardData.issuerId, 'name', cb );
            };
        }
        else
            error = new Error( 'Invalid issuer ID "' + util.stripTags(issuerId) + '"' );
    }

    if ( typeId ){
        if ( ObjectId.isValid(typeId) ){
            cardData.typeId = new ObjectId( typeId );
            queries.cardType = function( cb ){
                CardType.findById( cardData.typeId, 'name', cb );
            };
        }
        else
            error = new Error( 'Invalid card type ID "' + util.stripTags(issuerId) + '"' );
    }

    if ( error )
        next( error );
    else {
        req.cardData = cardData;

        if ( Object.keys(queries).length )
            async.parallel( queries, function( error, result ){
                if ( error )
                    next( error );
                else {
                    if ( result.issuer )
                        cardData.issuerName = result.issuer.name;
                    if ( queries.cardType )
                        cardData.typeName = result.cardType.name;
                    next();
                }
            });
        else
            next();
    }
};


exports.updateCard = function( error, req, res, next ){
    if ( error )
        next( error );
    else {
        var card = new Card;
        if ( req.files.imgFront ){
            card.imgFront.mimeType = req.files.imgFront.mimetype;
            card.imgFront.data = fs.readFileSync( req.files.imgFront.path );
            fs.unlinkSync( req.files.imgFront.path );
        }
        if ( req.files.imgBack ){
            card.imgBack.mimeType = req.files.imgBack.mimetype;
            card.imgBack.data = fs.readFileSync( req.files.imgBack.path );
            fs.unlinkSync( req.files.imgBack.path );
        }
        delete req.files;
        card.set( req.cardData );
        card.save( function( error, card ){
            if ( error )
                next( error );
            else
                res.redirect( util.formatUrl(route.CARD_PAGE, {id: card._id}) );
        });
    }
    res.render( 'page/card', {
        pageName: 'cards',
        pageTitle: 'Card'
    });
};


function filterString( str ){
    return util.stripTags( str ).trim();
}