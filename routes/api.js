/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    util = require( '../lib/util' ),
    registry = require( '../lib/registry' ),
    packageInfo = util.getPackageInfo(),
    route = registry.get( 'config' ).route,
    Issuer = registry.get( 'db' ).Issuer;

module.exports = router;


router.get( route.API_INFO, function( req, res ){
    res.json({
        name: 'Cards service REST API',
        version: packageInfo.version
    });
});


router.get( route.ISSUERS, function( req, res ){
    Issuer.find( function( error, docs ){
        if ( error )
            res.json( 500, {error: error});
        else
            res.json( docs );
    });
});

