#!/usr/bin/env node
/**
 * @author Alexander Marenin
 * @date July 2014
 */

var program = require( 'commander' ),
    util = require( './lib/util' ),
    packageInfo = util.getPackageInfo(),
    registry = require( './lib/registry' );


program
    .version( packageInfo.version )
    .usage( '[options]' )
    .option( '-c, --config [name]', 'set the config name to use, default is "dev"', 'dev' );


program.parse( process.argv );
var config = util.getConfig( program.config );
process.title = config.processTitle;
registry.set( 'config', config );

var db = require( './lib/db' );


db.connect( config.mongodb, {}, function( error ){
    if ( error ){
        console.log( error );
        process.abort();
    }
    else {
        registry.set( 'db', db );
        require( './lib/webServer' );
    }
});
