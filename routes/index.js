/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    issuers = require( './issuers' ),
    Card = db.Card,
    CardType = db.CardType,
    ObjectId = db.ObjectId;

module.exports = router;


router.get( route.INDEX, function( req, res ){
    res.render( 'page/index', {
        pageName: 'index',
        pageTitle: 'Dashboard'
    });
});


router.get( route.CARDS_PAGE, function( req, res, next ){
    Card.find( function( error, cards ){
        if ( error )
            next( error );
        else
            res.render( 'page/cards', {
                pageName: 'cards',
                pageTitle: 'Cards list',
                cards: cards
            });
    });
});


router.get( route.CARD_PAGE, function( req, res ){
    res.render( 'page/index', {
        pageName: 'cards',
        pageTitle: 'card'
    });
});


router.get( route.ISSUERS_PAGE, issuers.getIssuers );
router.get( route.NEW_ISSUER_PAGE, issuers.getNewIssuer );
router.post( route.NEW_ISSUER_PAGE, issuers.createNewIssuer );
router.get( route.ISSUER_PAGE, issuers.getIssuer );
router.post( route.ISSUER_PAGE, issuers.updateIssuer );
