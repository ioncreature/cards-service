/**
 * @author Alexander Marenin
 * @date July 2014
 */

var util = require( '../../../lib/util' ),
    db = require( '../../../lib/db' ),
    config = util.getConfig( process.argv[2] || 'test' );


db.connect( config.mongodb, {}, function( error, connection ){
    if ( error )
        abort( error );
    else
        connection.dropDatabase( function( error ){
            if ( error )
                abort( error );
            else {
                console.log( 'Database successfully dropped' );
                process.exit();
            }
        });
});


function abort( error ){
    if ( error ){
        console.error( error.message );
        console.error( error.stack );
    }
    process.abort( 1 );
}