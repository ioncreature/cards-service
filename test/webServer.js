/**
 * @author Alexander Marenin
 * @date September 2014
 */

var util = require( '../lib/util' ),
    registry = require( '../lib/registry' ),
    config = util.getConfig( 'test' ),
    db = require( '../lib/db' );

registry.set( 'config', config );
registry.set( 'db', db );

var webServer = require( '../lib/webServer' );

describe( 'web server', function(){
    it( 'should connect to mongo', function( done ){
        db.connect( config.mongodb, {}, done );
    });

    it( 'should start web server', function( done ){
        webServer( done );
    });

    require( './webServer/pages' );
    require( './webServer/userApi' );
    require( './webServer/issuerApi' );
});