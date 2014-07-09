/**
 * @author Alexander Marenin
 * @date July 2014
 */

var registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    async = require( 'async' ),
    util = require( '../lib/util' ),
    Card = db.Card,
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
        Card.findById( id, function( error, card ){
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
                    issuerName: card.issuerName || '',
                    typeName: card.typeName || '',
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


exports.getNewCard = function( req, res ){
    res.render( 'page/card', {
        pageName: 'cards',
        pageTitle: 'Card',
        id: '',
        name: '',
        issuerName: '',
        typeName: '',
        userId: '',
        postUrl: route.NEW_CARD_PAGE,
        submitCaption: 'Create card'
    });
};


exports.createCard = function( req, res, next  ){
    res.render( 'page/card', {
        pageName: 'cards',
        pageTitle: 'Card'
    });
};


exports.updateCard = function( req, res, next ){
    res.render( 'page/card', {
        pageName: 'cards',
        pageTitle: 'Card'
    });
};