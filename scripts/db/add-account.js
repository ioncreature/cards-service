/**
 * @author Alexander Marenin
 * @date September 2014
 */

var program = require( 'commander' ),
    util = require( '../../lib/util' ),
    db = require( '../../lib/db' ),
    config;


program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-l, --login <login>', 'set account login' )
    .option( '-p, --password <password>', 'set account password' )
    .option( '-n, --name [name]', 'set account name', '' )
    .option( '-P, --phone [phone]', 'set account phone', '' )
    .option( '-e, --email [email]', 'set account email', '' )
    .option( '-r, --role [role]', 'set account role', '' );
program.parse( process.argv );


config = util.getConfig( program.config );

if ( !program.login || !program.password )
    util.abort( 'Login and password are required' );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else {
        var data = {
            login: program.login,
            password: program.password
        };

        if ( program.name )
            data.name = program.name;

        if ( program.email )
            data.email = program.email;

        if ( program.phone )
            data.phone = program.phone;

        if ( program.role )
            data.role = [program.role];

        db.Account.create( data, function( error, account ){
            if ( error )
                util.abort( error );
            else if ( !account )
                util.abort( new Error('Account was not created') );
            else {
                console.log( account );
                console.log( '\nSuccess!' );
                process.exit();
            }
        });
    }
});
