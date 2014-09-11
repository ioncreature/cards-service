/**
 * @author Alexander Marenin
 * @date September 2014
 */

require( 'colors' );

var program = require( 'commander' ),
    util = require( '../../lib/util' ),
    async = require( 'async' ),
    join = require( 'path' ).join,
    exec = require( 'child_process' ).exec,
    ProgressBar = require( 'progress' );

program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-C, --collection [name]', 'set collection to backup' );
program.parse( process.argv );

var config = util.getConfig( program.config ),
    mongodb = config.mongodb[0],
    command = 'mongoexport --host ' + mongodb.host + ':' + mongodb.port + ' --db ' + mongodb.dbname;

if ( mongodb.auth ){
    var auth = mongodb.auth.split( ':' );
    command += ' --username ' + auth[0];
    command += ' --password ' + auth[1];
}

if ( program.collection )
    command += ' --collection ' + program.collection;

var start = Date.now(),
    child = exec( command, function( error ){
        if ( error )
            util.abort( error );
        else {
            console.log( '\nSuccess!'.green );
            console.log( 'Elapsed time:', ((Date.now() - start) / 1000).toFixed(2) + ' sec' );
            process.exit();
        }
    });

child.on( 'data', function( data ){
    console.log( data );
})