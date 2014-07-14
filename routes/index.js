/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    async = require( 'async' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    issuers = require( './issuers' ),
    users = require( './users' ),
    cards = require( './cards' ),
    Card = db.Card,
    CardType = db.CardType,
    User = db.User,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;

module.exports = router;


router.get( route.INDEX, function( req, res, next ){
    async.parallel({
        usersCount: function( cb ){
            User.count( cb );
        },
        issuersCount: function( cb ){
            Issuer.count( cb);
        },
        cardsCount: function( cb ){
            Card.count( cb );
        },
        cardTypesCount: function( cb ){
            CardType.count( cb );
        }
    }, function( error, result ){
        if ( error )
            next( error );
        else
            res.render( 'page/dashboard', {
                pageName: 'dashboard',
                pageTitle: 'Dashboard',
                usersCount: result.usersCount,
                issuersCount: result.issuersCount,
                cardsCount: result.cardsCount,
                cardTypesCount: result.cardTypesCount
            });
    });
});

router.get( route.CARDS_PAGE, cards.getCards );
router.get( route.CARD_MODERATE, cards.moveToModerate );
router.get( route.NEW_CARD_PAGE, cards.getNewCard );
router.post( route.NEW_CARD_PAGE, cards.validateCard, cards.createCard );
router.get( route.CARD_PAGE, cards.getCard );
router.post( route.CARD_PAGE, cards.validateCard, cards.updateCard );

router.get( route.USERS_PAGE, users.getUsers );
router.get( route.USER_PAGE, users.getUser );

router.get( route.ISSUERS_PAGE, issuers.getIssuers );
router.get( route.NEW_ISSUER_PAGE, issuers.getNewIssuer );
router.post( route.NEW_ISSUER_PAGE, issuers.createNewIssuer );
router.get( route.ISSUER_PAGE, issuers.getIssuer );
router.post( route.ISSUER_PAGE, issuers.updateIssuer );
