/**
 * @author Alexander Marenin
 * @date July 2014
 */


var registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    util = require( '../lib/util' ),
    db = registry.get( 'db' ),
    User = db.User,
    ObjectId = db.ObjectId;


exports.getUsers = function( req, res, next ){
    User.find( function( error, users ){
        if ( error )
            next( error );
        else
            res.render( 'page/users', {
                pageName: 'users',
                pageTitle: 'Users list',
                users: users || []
            });
    });
};


exports.getUser = function( req, res ){
    var id = req.params.id;
    if ( ObjectId.isValid(id) )
        User.findOne( {_id: new ObjectId(id)}, function( error, user ){
            if ( error )
                next( error );
            else if ( !user )
                next( new Error('User with ID "' + util.stripTags(id) + '" not found') );
            else
                res.render( 'page/user', {
                    pageName: 'users',
                    pageTitle: 'User',
                    postUrl: '#',
                    user: user
                });
        });
    else
        next( new Error('Invalid user ID "' + util.stripTags(id) + '"') );
};