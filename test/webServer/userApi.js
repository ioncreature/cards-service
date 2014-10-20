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

describe( 'User API', function(){
    var user,
        card;

    it( 'should forbid querying without auth', function( done ){
        request( app )
            .get( route.API_PREFIX + route.USERS )
            .expect( 403 )
            .accept( 'json' )
            .end( done )
    });


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


    it( 'should return user by id', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.USER, {id: user._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var u = res.body;
                    expect( u._id ).to.equal( user._id );
                    expect( u.name ).to.equal( user.name );
                    done();
                }
            });
    });


    it( 'should create card', function( done ){
        request( app )
            .post( route.API_PREFIX + route.CARDS )
            .field( 'userId', user._id )
            .attach( 'imgFront', imgPath )
            .attach( 'imgBack', imgPath )
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


    it( 'should return card by its id', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.CARD, {id: card._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'json' )
            .expect( 200 )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var c = res.body;
                    expect( c.imgFrontId ).to.be.ok;
                    expect( c.imgBackId ).to.be.ok;
                    expect( c.userId ).to.equal( user._id );
                    done();
                }
            });
    });

    it( 'should return previously uploaded image', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.CARD_IMAGE, {id: card._id, type: 'front'}) )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'image/jpeg' )
            .expect( 200 )
            .end( done );
    });


    it( 'should return image by its id' , function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.FILE, {id: card.imgFrontId}) )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'image/jpeg' )
            .expect( 200 )
            .end( done );
    });


    it( 'should return list of user cards', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.USER_CARDS, {id: user._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'json' )
            .expect( 200 )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var list = res.body;
                    expect( list.some(function( item ){
                        return item._id === card._id;
                    })).to.be.true;
                    done();
                }
            });
    });


    it( 'should update card number', function( done ){
        var number = '123123';
        request( app )
            .post( util.formatUrl(route.API_PREFIX + route.CARD, {id: card._id}) )
            .send( {number: number} )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var card = res.body;
                    expect( card.number ).to.equal( number );
                    done();
                }
            });
    });


    it( 'should remove card', function( done ){
        request( app )
            .del( util.formatUrl(route.API_PREFIX + route.CARD, {id: card._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( done );
    });


    it( 'should return list of user cards without previously removed', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.USER_CARDS, {id: user._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var list = res.body;
                    expect( list.every(function( item ){
                        return item._id !== card._id;
                    })).to.be.true;
                    done();
                }
            });
    });
});
