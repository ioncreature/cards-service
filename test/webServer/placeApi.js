/**
 * @author Alexander Marenin
 * @date October 2014
 */

var registry = require( '../../lib/registry' ),
    app = registry.get( 'app' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    request = require( 'supertest' );


describe( 'Places API', function(){
    it( 'should return places list near i-free office', function( done ){
        request( app )
            .get( route.API_PREFIX + route.PLACES )
            .query( {lng: 30.303833, lat: 59.961} )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( done );
    });
});
