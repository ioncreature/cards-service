/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    util = require( '../lib/util' ),
    registry = require( '../lib/registry' ),
    packageInfo = util.getPackageInfo(),
    route = registry.get( 'config' ).route,
    dataLayer = registry.get( 'dataLayer' );

module.exports = router;


router.get( route.API_INFO, function( req, res ){
    res.json({
        name: 'Cards service REST API',
        version: packageInfo.version
    });
});

