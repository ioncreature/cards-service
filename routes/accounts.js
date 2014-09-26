/**
 * @author Alexander Marenin
 * @date September 2014
 */

const
    ACTIVITY_LOG_LENGTH = 12;

var registry = require( '../lib/registry' ),
    util = require( '../lib/util' ),
    async = require( 'async' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    ObjectId = db.ObjectId,
    Account = db.Account,
    Activity = db.Activity;


exports.getAccounts = function( req, res, next ){
    Account.find( function( error, list ){
        if ( error )
            next( error );
        else
            res.render( 'page/accounts', {
                pageName: 'account',
                pageTitle: 'Accounts list',
                accounts: list
            });
    });
};


exports.getAccount = function( req, res, next ){
    var login = req.params.login,
        sessionLogin = req.session.user.login;

    if ( login !== sessionLogin && !req.role.can('get accounts') ){
        var e = new Error( 'Forbidden' );
        e.status = 403;
        next( e );
    }
    else
        Account.findOne( {login: login}, function( error, account ){
            if ( error )
                next( error );
            else if ( !account ){
                var e = new Error( 'Account not found' );
                e.status = 404;
                next( e );
            }
            else
                Activity
                    .find( {accountId: account._id} )
                    .limit( ACTIVITY_LOG_LENGTH )
                    .sort( {_id: -1} )
                    .exec( function( error, list ){
                        if ( error )
                            next( error );
                        else
                            res.render( 'page/account', {
                                pageName: 'account',
                                pageTitle: 'Account info',
                                postUrl: util.formatUrl( route.ACCOUNT_PAGE, {login: account.login} ),
                                account: account,
                                activities: list
                            });
                    });
        });
};


exports.getMe = function( req, res, next ){
    var login = req.session.user && req.session.user.login;

    if ( login )
        res.redirect( util.formatUrl(route.ACCOUNT_PAGE, {login: login}) );
    else
        next( new Error('Session doesn\'t have user info') );
};


exports.updateAccount = function( req, res, next ){
    var role = req.role,
        login = req.params.login,
        sessionLogin = req.session.user.login,
        b = req.body;

    if ( login !== sessionLogin && !role.can('edit accounts') ){
        var e = new Error( 'Forbidden' );
        e.status = 403;
        next( e );
    }
    else
        Account.findOne( {login: login}, function( error, account ){
            if ( error )
                next( error );
            else if ( !account ){
                var e = new Error( 'Account not found' );
                e.status = 404;
                next( e );
            }
            else {
                if ( b.password && b.passwordConfirm && b.password === b.passwordConfirm )
                    account.password = b.password;
                if ( role.can('edit permissions') )
                    account.role = (b.role || []).map( function( item ){
                        return util.stripTags( item );
                    });
                account.name = util.stripTags( b.name ) || '';
                account.phone = util.stripTags( b.phone ) || '';
                account.email = util.stripTags( b.email ) || '';
                account.save( function( error ){
                    if ( error )
                        next( error );
                    else
                        res.redirect( util.formatUrl(route.ACCOUNT_PAGE, {login: account.login}) );
                });
            }
        });
};
