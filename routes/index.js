/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    issuers = require( './issuers' ),
    users = require( './users' ),
    cards = require( './cards' ),
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

router.get( route.CARDS_PAGE, cards.getCards );
router.get( route.NEW_CARD_PAGE, cards.getNewCard );
router.post( route.NEW_CARD_PAGE, cards.validateCard );
router.post( route.NEW_CARD_PAGE, cards.createCard );
router.get( route.CARD_PAGE, cards.getCard );
router.post( route.CARD_PAGE, cards.validateCard );
router.post( route.CARD_PAGE, cards.updateCard );

router.get( route.USERS_PAGE, users.getUsers );
router.get( route.USER_PAGE, users.getUser );

router.get( route.ISSUERS_PAGE, issuers.getIssuers );
router.get( route.NEW_ISSUER_PAGE, issuers.getNewIssuer );
router.post( route.NEW_ISSUER_PAGE, issuers.createNewIssuer );
router.get( route.ISSUER_PAGE, issuers.getIssuer );
router.post( route.ISSUER_PAGE, issuers.updateIssuer );
