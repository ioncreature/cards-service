/**
 * @author Alexander Marenin
 * @date September 2014
 */

var registry = require( '../lib/registry' ),
    async = require( 'async' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    ObjectId = db.ObjectId,
    Account = db.Account;


exports.getAccounts = function( req, res, next ){
    Account.find( function( error, list ){
        if ( error )
            next( error );
        else
            res.render( 'page/accounts', {
                pageName: 'accounts',
                pageTitle: 'Accounts list',
                accounts: list
            });
    });
};


exports.getAccount = function( req, res, next ){
    var login = req.params.login;

    Account.findOne( {login: login}, function( error, account ){
        if ( error )
            next( error );
        else if ( !account ){
            var e = new Error( 'User not found' );
            e.status = 404;
            next( e );
        }
        else
            res.render( 'page/account', {
                pageName: 'accounts',
                pageTitle: 'Account info',
                account: account
            });
    });
};


exports.updateAccount = function( req, res, next ){
    var id = req.params.id,
        b = req.body;

    if ( ObjectId.isValid(id) )
        Account.findById( id, function( error, account ){
            if ( error )
                next( error );
            else if ( !account ){
                var e = new Error( 'Account not found' );
                e.status = 404;
                next( e );
            }
            else {
                if ( b.password && b.confirmPassword && b.password === b.confirmPassword )
                    account.password = b.password;
                account.roles = b.roles || [];
                account.save( function( error ){
                    if ( error )
                        next( error );
                    else
                        res.redirect( util.formatUrl(route.ACCOUNT_PAGE, {id: account._id}) );
                });
            }
        });
    else
        next( new Error('Account id is invalid') );
};
