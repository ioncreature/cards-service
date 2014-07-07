/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route;

module.exports = router;


router.get( route.INDEX, function( req, res ){
    res.render( 'index', {
        pageName: 'index',
        pageTitle: 'Dashboard'
    });
});


router.get( route.CARDS_PAGE, function( req, res ){
    res.render( 'index', {
        pageName: 'cards',
        pageTitle: 'Cards list'
    });
});


router.get( route.CARD_PAGE, function( req, res ){
    res.render( 'index', {
        pageName: 'cards',
        pageTitle: 'card'
    });
});


router.get( route.ISSUERS_PAGE, function( req, res ){
    res.render( 'index', {
        pageName: 'issuers',
        pageTitle: 'Issuers list'
    });
});


router.get( route.ISSUER_PAGE, function( req, res ){
    res.render( 'index', {
        pageName: 'issuers',
        pageTitle: 'Issuer'
    });
});
