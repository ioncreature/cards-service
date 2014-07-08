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


exports.getCard = function( req, res ){
    res.render( 'page/index', {
        pageName: 'cards',
        pageTitle: 'card'
    });
};