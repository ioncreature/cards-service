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
var s;

router.post( route.LOGIN, role.isUnauthorized(), function( req, res ){
    var login = req.body.login,
        password = req.body.password;
    s = Date.now();
    console.log( 1 );

    if ( login && password )
        Account.login( login, password, function( error, account ){
            console.log( 2, Date.now() - s );
            if ( error )
                res.render( 'page/login', {
                    pageName: 'login',
                    errorMsg: error.message
                });
            else {
                console.log( 3, Date.now() - s );
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
    console.log( 4, Date.now() - s );
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
        topCities: function( cb ){
            Card.aggregate([
                {$project: {city: 1}},
                {$group: {_id: '$city', count: {$sum: 1}}},
                {$sort: {count: -1}},
                {$limit: 5},
                {$project: {name: '$_id', count: 1, _id: 0}}
            ]).exec( cb );
        },
        topIssuers: function( cb ){
            Card.aggregate([
                {$match: {issuerName: {$exists: true}}},
                {$group: {_id: '$issuerName', count: {$sum: 1}}},
                {$project: {name: '$_id', count: 1, _id: 0}},
                {$sort: {count: -1}},
                {$limit: 10}
            ]).exec( cb );
        },
        topUsers: function( cb ){
            Card.aggregate([
                {$match: {userId: {$exists: true}}},
                {$group: {_id: '$userId', count: {$sum: 1}}},
                {$project: {id: '$_id', count: 1, _id: 0}},
                {$sort: {count: -1}},
                {$limit: 10}
            ]).exec( cb );
        },
        cardTypesCount: function( cb ){
            CardType.count( cb );
        }
    }, function( error, result ){
        console.log( 5, Date.now() - s );
        if ( error )
            next( error );
        else
            res.render( 'page/dashboard', {
                pageName: 'dashboard',
                pageTitle: 'Dashboard',
                usersCount: result.usersCount,
                cardsPerUser: (result.cardsCount / result.usersCount).toFixed( 1 ),
                issuersCount: result.issuersCount,
                cardsCount: result.cardsCount,
                filledCardsCount: result.filledCardsCount,
                emptyCardsCount: result.cardsCount - result.filledCardsCount,
                cardTypesCount: result.cardTypesCount,
                topCities: result.topCities,
                topIssuers: result.topIssuers,
                topUsers: result.topUsers
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
