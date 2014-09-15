/**
 * @author Alexander Marenin
 * @date September 2014
 */

var registry = require( '../../lib/registry' ),
    async = require( 'async' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    User = db.User;


exports.create = function( req, res, next ){
    var b = req.body,
        user = new User;

    if ( b.name )
        user.name = util.stripTags( b.name ).trim();

    if ( b.deviceId )
        user.deviceId = util.stripTags( b.deviceId ).trim();

    user.save( function( error, doc ){
        if ( error )
            next( error );
        else
            res.json( {id: doc._id} );
    });
};
