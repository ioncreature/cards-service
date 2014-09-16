/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    util = require( '../lib/util' ),
    mime = require( 'mime' ),
    registry = require( '../lib/registry' ),
    config = registry.get( 'config' ),
    packageInfo = util.getPackageInfo(),
    route = config.route,
    db = registry.get( 'db' ),
    role = registry.get( 'role' ),
    Issuer = db.Issuer,
    File = db.File,
    CardType = db.CardType,
    Card = db.Card,
    ObjectId = db.ObjectId,
    userApi = require( './api/user' ),
    cardApi = require( './api/card' );

module.exports = router;


router.get( route.API_INFO, function( req, res ){
    res.json({
        name: 'Cards service REST API',
        version: packageInfo.version
    });
});


router.use( role.isAuthorized( function( req, res, next ){
    var e = new Error( 'Forbidden' );
    e.status = 403;
    next( e );
}));


router.get( route.USERS, userApi.getUsers );
router.get( route.USER_CARDS, userApi.getUserCards );
router.post( route.USERS, userApi.createUser );

router.get( route.CARDS, cardApi.getCards );
router.post( route.CARDS, cardApi.createCard );
router.get( route.CARD_IMAGE, cardApi.getPhoto );


router.get( route.ISSUERS, function( req, res, next ){
    var sort = String( req.query.sort || '' ),
        search = String( req.query.search || '' ),
        conditions = {},
        options = {limit: 10};

    if ( sort ){
        var sortField = sort.split( ',' )[0],
            order = sort.split( ',' )[1];
        if ( sortField ){
            options.sort = {};
            options.sort[sortField] = order === 'DESC' ? -1 : 1;
        }
    }

    if ( search )
        conditions.name = new RegExp( search, 'i' );

    Issuer.find( conditions, null, options, function( error, docs ){
        if ( error )
            next( error );
        else
            res.json( docs );
    });
});


router.get( route.CARD_TYPES, function( req, res, next ){
    var issuerId = req.query.issuerId,
        conditions = {},
        options = {};

    if ( issuerId && ObjectId.isValid(issuerId) )
        conditions.issuerId = new ObjectId( issuerId );

    CardType.find( conditions, null, options, function( error, docs ){
        if ( error )
            next( error );
        else
            res.json( docs );
    });
});


router.get( route.CARD_TYPE_PREVIEW_FRONT, function( req, res, next ){
    var typeId = req.params.id,
        field = req.params.type === 'front' ? 'imgFrontId' : 'imgBackId',
        query = {};

    if ( ObjectId.isValid(typeId) ){
        typeId = new ObjectId( typeId );
        query[field] = {$exists: true};
        query.typeId = typeId;

        Card.findOne( query, field, function( error, card ){
            if ( error )
                next( error );
            else if ( !card ){
                var e = new Error( 'Card with ID "' + util.stripTags( typeId ) + '" not found' );
                e.status = 404;
                next( e );
            }
            else
                File.findOne( card[field], function( error, file ){
                    res.type( file.mimeType || mime.lookup( file.name ) );
                    res.set( 'Content-Disposition', 'filename="' + file.name + '"' );
                    res.send( file.data );
                });
        });
    }
    else
        next( new Error('Incorrect card type ID "' + util.stripTags(id) + '"') );
});


router.use( function( req, res, next ){
    var error = new Error( 'Not Found' );
    error.status = 404;
    next( error );
});


router.use( function( error, req, res, next ){
    res.json( error.status || 500, {
        error: error.message,
        status: error.status || '',
        stack: config.debug ? error.stack : ''
    });
});
