/**
 * @author Alexander Marenin
 * @date August 2014
 */

var util = require( '../../../lib/util' ),
    db = require( '../../../lib/db' ),
    Card = db.Card,
    config = util.getConfig( process.argv[2] || 'test' );


db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else
        Card.update( null, {$set: {lastOpen: 0}}, {multi: true}, function( error ){
            if ( error )
                util.abort( error );
            else {
                console.log( 'Success!' );
                process.exit( 1 );
            }
        });
});
