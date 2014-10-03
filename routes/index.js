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
    accounts = require( './accounts' ),
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
                    {imgBackId: {$exists: true}},
                    {imgFrontId: {$exists: true}}
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
            Issuer.find( {}, null, {sort: {cards: -1}, limit: 10}, cb );
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


router.get( route.CARDS_PAGE, role.can('get cards', forbid), cards.getCards );
router.get( route.CARD_MODERATE, role.can('edit card', forbid), cards.moveToModerate );
router.get( route.NEW_CARD_PAGE, role.can('edit card', forbid), cards.getNewCard );
router.post( route.NEW_CARD_PAGE, role.can('edit card', forbid), cards.validateCard, cards.createCard );
router.get( route.CARD_PAGE, role.can('get cards', forbid), cards.getCard );
router.post( route.CARD_PAGE, role.can('edit card', forbid), cards.validateCard, cards.updateCard );

router.get( route.USERS_PAGE, role.can('get users', forbid), users.getUsers );
router.get( route.USER_PAGE, role.can('get users', forbid), users.getUser );

router.get( route.ISSUERS_PAGE, role.can('get issuers', forbid), issuers.getIssuers );
router.get( route.NEW_ISSUER_PAGE, role.can('edit issuer', forbid), issuers.getNewIssuer );
router.post( route.NEW_ISSUER_PAGE, role.can('edit issuer', forbid), issuers.createNewIssuer );
router.get( route.ISSUER_PAGE, role.can('get issuers', forbid), issuers.getIssuer );
router.post( route.ISSUER_PAGE, role.can('edit issuer', forbid), issuers.updateIssuer );
router.get( route.CARD_TYPE_PAGE, role.can('edit issuer', forbid), issuers.getCardType );

router.get( route.ACCOUNTS_PAGE, role.can('get accounts', forbid), accounts.getAccounts );
router.get( route.ACCOUNT_PAGE, accounts.getAccount );
router.post( route.ACCOUNT_PAGE, accounts.updateAccount );
router.get( route.ACCOUNT_OWN_PAGE, accounts.getMe );


function forbid( req, res, next ){
    var e = new Error( 'Forbidden! You have not enough permissions' );
    e.status = 403;
    next( e );
}