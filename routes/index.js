/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    async = require( 'async' ),
    route = registry.get( 'config' ).route,
    role = registry.get( 'role' ),
    db = registry.get( 'db' ),
    issuers = require( './issuers' ),
    users = require( './users' ),
    cards = require( './cards' ),
    Account = db.Account,
    Card = db.Card,
    CardType = db.CardType,
    User = db.User,
    Issuer = db.Issuer;

module.exports = router;


router.get( route.LOGIN, role.isUnauthorized(), function( req, res ){
    res.render( 'page/login', {
        pageName: 'login'
    });
});


router.post( route.LOGIN, role.isUnauthorized(), function( req, res ){
    var login = req.body.login,
        password = req.body.password;

    if ( login && password )
        Account.login( login, password, function( error, account ){
            if ( error )
                res.render( 'page/login', {
                    pageName: 'login',
                    errorMsg: error.message
                });
            else {
                req.session.user = account;
                res.redirect( route.INDEX );
            }
        });
    else
        res.render( 'page/login', {
            pageName: 'login',
            errorMsg: 'Login and password are required'
        });
});


router.use( role.isAuthorized() );

router.get( route.LOGOUT, function( req, res ){
    delete req.session.user;
    res.redirect( route.LOGIN );
});

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
        filledCardsCount: function( cb ){
            Card.find({
                $and: [
                    {issuerId: {$exists: true}},
                    {typeId: {$exists: true}},
                    {imgBack: {$exists: true}},
                    {imgFront: {$exists: true}}
                ]
            }).count( cb );
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
                filledCardsCount: result.filledCardsCount,
                emptyCardsCount: result.cardsCount - result.filledCardsCount,
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
