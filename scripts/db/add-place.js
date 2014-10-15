/**
 * @author Alexander Marenin
 * @date October 2014
 */

var program = require( 'commander' ),
    util = require( '../../lib/util' ),
    db = require( '../../lib/db' ),
    config;


program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '--name [<name]', 'set place name', 'Somewhere in Saint-Petersburg' )
    .option( '--longitude [longitude]', 'set longitude', 30 + Math.random() )
    .option( '--latitude [latitude]', 'set latitude', 59 + Math.random() );

program.parse( process.argv );


config = util.getConfig( program.config );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else {
        var data = {
            name: program.name,
            pos: [Number(program.longitude), Number(program.latitude)]
        };

        db.Place.create( data, function( error, place ){
            if ( error )
                util.abort( error );
            else if ( !place )
                util.abort( new Error('Place was not created') );
            else {
                console.log( place );
                console.log( '\nSuccess!' );
                process.exit();
            }
        });
    }
});
