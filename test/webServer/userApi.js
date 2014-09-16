/**
 * @author Alexander Marenin
 * @date September 2014
 */

var expect = require( 'chai' ).expect,
    registry = require( '../../lib/registry' ),
    app = registry.get( 'app' ),
    imgPath = require( 'path' ).join( __dirname, 'test.jpg' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    request = require( 'supertest' );

describe( 'user API', function(){
    var user,
        card;

    it( 'should return users list', function( done ){
        request( app )
            .get( route.API_PREFIX + route.USERS )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var list = res.body;
                    expect( list ).to.be.instanceof( Array );
                    done();
                }
            });
    });


    it( 'should create user', function( done ){
        var name = 'test user ' + Date.now();
        request( app )
            .post( route.API_PREFIX + route.USERS )
            .set( 'Cookie', registry.get('cookie') )
            .send( {name: name} )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    user = res.body;
                    expect( user.name ).to.equal( name );
                    done();
                }
            });
    });


    it( 'should create card', function( done ){
        request( app )
            .post( route.API_PREFIX + route.CARDS )
            .field( 'userId', user._id )
            .attach( 'imgFront', imgPath )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    card = res.body;
                    expect( card.userId ).to.equal( String(user._id) );
                    expect( card ).to.have.property( 'imgFrontId' );
                    done();
                }
            });
    });


    it( 'should return previously uploaded image', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.CARD_IMAGE, {id: card._id, type: 'front'}) )
            .query( {userId: user._id} )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'image/jpeg' )
            .expect( 200 )
            .end( done );
    });
});
