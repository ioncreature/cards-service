/**
 * @author Alexander Marenin
 * @date July 2014
 */


var registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
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
    res.render( 'page/user', {
        pageName: 'users',
        pageTitle: 'User'
    });
};