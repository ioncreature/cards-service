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
    mkdirp = require( 'mkdirp' );

program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-C, --collection <name>', 'set collection to backup' )
    .option( '-o, --out [path]', 'set directory path to export' );
program.parse( process.argv );

if ( !program.collection )
    util.abort( new Error('--collection parameter is required') );

var config = util.getConfig( program.config ),
    mongodb = config.mongodb[0],
    command = 'mongoexport --host ' + mongodb.host + ':' + mongodb.port + ' --db ' + mongodb.dbname,
    outDir = program.out || join( config.backupDir, mongodb.dbname );

mkdirp.sync( outDir );

if ( mongodb.auth ){
    var auth = mongodb.auth.split( ':' );
    command += ' --username ' + auth[0];
    command += ' --password ' + auth[1];
}

command += ' --collection ' + program.collection;
command += ' --out ' + join( outDir, program.collection +'.json' );

var start = Date.now(),
    child = exec( command, function( error, strout, errout ){
        if ( error )
            util.abort( error );
        else {
            console.log( '\nSuccess!'.green );
            console.log( 'Elapsed time:', ((Date.now() - start) / 1000).toFixed(2) + ' sec' );
            process.exit();
        }
    });
