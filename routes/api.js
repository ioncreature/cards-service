/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    util = require( '../lib/util' ),
    registry = require( '../lib/registry' ),
    config = registry.get( 'config' ),
    packageInfo = util.getPackageInfo(),
    route = config.route,
    db = registry.get( 'db' ),
    Issuer = db.Issuer,
    CardType = db.CardType,
    Card = db.Card,
    ObjectId = db.ObjectId;

module.exports = router;


router.get( route.API_INFO, function( req, res ){
    res.json({
        name: 'Cards service REST API',
        version: packageInfo.version
    });
});


router.get( route.ISSUERS, function( req, res, next ){
    var sort = String( req.query.sort || '' ),
        conditions = {},
        options = {};

    if ( sort ){
        var field = sort.split( ',' )[0],
            order = sort.split( ',' )[1];
        if ( field ){
            options.sort = {};
            options.sort[field] = order === 'DESC' ? -1 : 1;
        }
    }

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


router.get( route.CARD_IMAGE, function( req, res, next ){
    var id = req.params.id,
        field = req.params.type === 'front' ? 'imgFront' : 'imgBack';

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Card.findById( id, field, function( error, card ){
            var e;
            if ( error )
                next( error );
            else if ( !card ){
                e = new Error( 'Card with ID "' + util.stripTags( id ) + '" not found' );
                e.status = 404;
                next( e );
            }
            else if ( !card[field] || !card[field].data ){
                e = new Error( 'Card with ID "' + util.stripTags( id ) + '" not found' );
                e.status = 404;
                next( e );
            }
            else {
                card[field].mimeType && res.contentType( card[field].mimeType );
                res.send( card[field].data );
            }
        });
    }
    else
        next( new Error('Incorrect card ID "' + util.stripTags(id) + '"') );
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
