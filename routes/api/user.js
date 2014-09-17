/**
 * @author Alexander Marenin
 * @date September 2014
 */

const DEFAULT_LIMIT = 100;

var registry = require( '../../lib/registry' ),
    async = require( 'async' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    User = db.User,
    Card = db.Card,
    ObjectId = db.ObjectId;


exports.createUser = function( req, res, next ){
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
            res.json( doc );
    });
};


exports.getUsers = function( req, res, next ){
    var skip = Number( req.query.skip ) || 0,
        limit = Number( req.query.limit ) || DEFAULT_LIMIT;

    User.find().skip( skip ).limit( limit ).exec( function( error, list ){
        if ( error )
            next( error );
        else
            res.json( list );
    });
};


exports.getUser = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) )
        User.findById( id, function( error, user ){
            if ( error )
                next( error );
            else if ( !user ){
                var e = new Error( 'User not found' );
                e.status = 404;
                next( e );
            }
            else
                res.json( user );
        });
    else
        next( new Error('User id is invalid') );
};


exports.getUserCards = function( req, res, next ){
    var userId = req.params.id;

    if ( ObjectId.isValid(userId) )
        Card.find( {userId: userId}, function( error, list ){
            if ( error )
                next( error );
            else
                res.json( list );
        });
    else
        next( new Error('User id is invalid') );
};

