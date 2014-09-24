/**
 * @author Alexander Marenin
 * @date July 2014
 */

var util = require( '../../../lib/util' ),
    db = require( '../../../lib/db' ),
    config = util.getConfig( process.argv[2] || 'test' );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        abort( error );
    else {
        db.Account.create({
            login: 'admin',
            password: 'synqera',
            name: 'Sad Admin',
            role: ['admin'],
            phone: '1 555 123 4567',
            email: 'synq.us.to'
        }, function( error, account ){
            if ( error )
                abort( error );
            else if ( !account )
                abort( new Error('Account was not created') );
            else {
                console.log( 'Success!' );
                process.exit();
            }
        });
    }
});


function abort( error ){
    if ( error ){
        console.error( error.message );
        console.error( error.stack );
    }
    process.abort( 1 );
}