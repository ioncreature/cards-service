/**
 * @author Alexander Marenin
 * @date October 2014
 */

var expect = require( 'chai' ).expect,
    registry = require( '../../lib/registry' ),
    app = registry.get( 'app' ),
    util = require( '../../lib/util' ),
    route = registry.get( 'config' ).route,
    request = require( 'supertest' );


describe( 'Issuer API', function(){
    var issuer;

    it( 'should return issuers list', function( done ){
        request( app )
            .get( route.API_PREFIX + route.ISSUERS )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var list = res.body;

                    list.forEach( function( issuer ){
                        expect( issuer ).to.contain.keys( 'name' );
                    });
                    issuer = list[0];
                    done();
                }
            });
    });


    it( 'should return issuer by id', function( done ){
        request( app )
            .get( route.API_PREFIX + util.formatUrl(route.ISSUER, {id: issuer._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var iss = res.body;
                    expect( iss.name ).to.equal( issuer.name );
                    expect( iss._id ).to.equal( issuer._id );
                    expect( iss.cardTypes ).to.be.instanceof( Array );
                    expect( iss.places ).to.be.instanceof( Array );
                    done();
                }
            });
    });


    it( 'should return issuer card types list', function( done ){
        request( app )
            .get( route.API_PREFIX + util.formatUrl(route.ISSUER_CARD_TYPES, {id: issuer._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var types = res.body;
                    expect( types ).to.be.instanceof( Array );

                    types.forEach( function( item ){
                        expect( item ).to.contain.keys( '_id', 'name', 'issuerId' );
                        expect( item.issuerId ).to.equal( issuer._id );
                    });
                    done();
                }
            });
    });


    it( 'should return issuer places list', function( done ){
        request( app )
            .get( route.API_PREFIX + util.formatUrl(route.ISSUER_PLACES, {id: issuer._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( done );
    });


    it( 'should return issuer preview image', function( done ){
        request( app )
            .get( util.formatUrl(route.API_PREFIX + route.ISSUER_IMAGE, {id: issuer._id}) )
            .set( 'Cookie', registry.get('cookie') )
            .accept( 'image/jpeg' )
            .expect( 200 )
            .end( done );
    });


    it( 'should return filtered by name issuers list', function( done ){
        var search = issuer.name.substr( 0, 2 ).toLowerCase();
        request( app )
            .get( route.API_PREFIX + route.ISSUERS )
            .query( {search: search} )
            .set( 'Cookie', registry.get('cookie') )
            .expect( 200 )
            .accept( 'json' )
            .end( function( error, res ){
                if ( error )
                    done( error );
                else {
                    var list = res.body;

                    expect( list.some( function( item ){
                        return issuer._id === item._id;
                    })).to.be.ok;
                    list.forEach( function( item ){
                        expect( item.name.toLowerCase() ).to.contain( search );
                    });

                    done();
                }
            });
    });
});
