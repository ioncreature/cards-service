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
    Card.find( {}, '-imgFront.data -imgBack.data', function( error, cards ){
        if ( error )
            next( error );
        else
            res.render( 'page/cards', {
                pageName: 'cards',
                pageTitle: 'Cards list',
                cards: cards || [],
                done: req.query.hasOwnProperty( 'done' )
            });
    });
};


exports.getCard = function( req, res, next ){
    var id = req.params.id,
        card;

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        async.series({
            card: function( cb ){
                Card.findById( id, '-imgFront.data -imgBack.data', function( error, data ){
                    card = data;
                    cb( error, data );
                });
            },
            issuers: function( cb ){
                Issuer.find( cb );
            },
            cardTypes: function( cb ){
                if ( card && card.issuerId )
                    CardType.find( {issuerId: card.issuerId}, cb );
                else
                    cb();
            }
        }, function( error, result ){
            var cardTypes = result.cardTypes || [],
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
                    typeId: card.typeId || '',
                    cardTypes: cardTypes,
                    userId: card.userId || '',
                    showImages: true,
                    postUrl: util.formatUrl( route.CARD_PAGE, {id: id} ),
                    haveFrontImg: card.imgFront && !!card.imgFront.mimeType,
                    haveBackImg: card.imgBack && !!card.imgBack.mimeType,
                    showNextButton: true,
                    submitCaption: 'Update'
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
                cardTypes: [],
                userId: '',
                showImages: false,
                postUrl: route.NEW_CARD_PAGE,
                submitCaption: 'Create card'
            });
    });
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
        if ( req.files.imgFront )
            setFile( cardData, 'imgFront', req.files.imgFront );
        if ( req.files.imgBack )
            setFile( cardData, 'imgBack', req.files.imgBack );
        delete req.files;
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


exports.createCard = function( req, res, next ){
    var card = new Card;
    card.set( req.cardData );
    card.save( function( error ){
        if ( error )
            next( error );
        else
            res.redirect( route.CARDS_PAGE );
    });
};


exports.updateCard = function( req, res, next ){
    var id = req.params.id,
        card = req.cardData,
        goNextCard = req.body.hasOwnProperty( 'next' );

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Card.findByIdAndUpdate( id, card, function( error, card ){
            if ( error )
                next( error );
            else if ( goNextCard )
                res.redirect( route.CARD_MODERATE );
            else
                res.redirect( util.formatUrl(route.CARD_PAGE, {id: card._id}) );
        });
    }
    else
        next( new Error('Invalid ID "' + util.stripTags(id)) );
};



exports.moveToModerate = function( req, res, next ){
    Card.findOne({
        $or: [
            {issuerId: {$exists: false}},
            {typeId: {$exists: false}},
            {imgBack: {$exists: false}},
            {imgFront: {$exists: false}}
        ]
    }, function( error, card ){
        if ( error )
            next( error );
        else if ( !card )
            res.redirect( route.CARDS_PAGE + '?done' );
        else
            res.redirect( util.formatUrl(route.CARD_PAGE, {id: card._id}) );

    });
};


function setFile( object, name, fileDescriptor ){
    if ( !object[name] )
        object[name] = {};
    object[name].mimeType = fileDescriptor.mimetype;
    object[name].data = fs.readFileSync( fileDescriptor.path );
    fs.unlinkSync( fileDescriptor.path );
}


function filterString( str ){
    return util.stripTags( str ).trim();
}