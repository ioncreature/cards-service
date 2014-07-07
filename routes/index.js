/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    Card = db.Card,
    Issuer = db.Issuer;

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


router.get( route.ISSUERS_PAGE, function( req, res, next ){
    Issuer.find( function( error, issuers ){
        if ( error )
            next( error );
        else
            res.render( 'page/issuers', {
                pageName: 'issuers',
                pageTitle: 'Issuers list',
                issuers: issuers
            });
    });
});


router.get( route.NEW_ISSUER_PAGE, function( req, res ){
    res.render( 'page/issuer', {
        pageName: 'issuers',
        pageTitle: 'Create issuer',
        postUrl: route.NEW_ISSUER_PAGE,
        name: '',
        description: '',
        url: '',
        phone: '',
        address: '',
        submitCaption: 'Create'
    });
});


router.get( route.ISSUER_PAGE, function( req, res ){
    res.render( 'page/index', {
        pageName: 'issuers',
        pageTitle: 'Issuer'
    });
});
