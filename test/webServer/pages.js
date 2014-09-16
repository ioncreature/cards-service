/**
 * @author Alexander Marenin
 * @date September 2014
 */


var request = require( 'supertest' ),
    registry = require( '../../lib/registry' ),
    config = registry.get( 'config' ),
    route = config.route,
    app = registry.get( 'app' ),
    cookie;

describe( 'pages', function(){
    it( 'should login', function( done ){
        request( app )
            .post( route.LOGIN )
            .send( {login: config.auth.login, password: config.auth.password} )
            .expect( 302 )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    cookie = res.headers['set-cookie'].pop().split( ';' )[0];
                    registry.set( 'cookie', cookie );
                    done();
                }
            });
    });


    it( 'should return index page', function( done ){
        request( app )
            .get( route.INDEX )
            .set( 'Cookie', cookie )
            .expect( 200 )
            .accept( 'html' )
            .end( done );
    });


    it( 'should return cards page', function( done ){
        request( app )
            .get( route.CARDS_PAGE )
            .set( 'Cookie', cookie )
            .expect( 200 )
            .accept( 'html' )
            .end( done );
    });


    it( 'should return cards page', function( done ){
        request( app )
            .get( route.ISSUERS_PAGE )
            .set( 'Cookie', cookie )
            .expect( 200 )
            .expect( 'Content-Type', /html/ )
            .end( done );
    });
});