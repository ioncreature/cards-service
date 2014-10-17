/**
 * @author Alexander Marenin
 * @date October 2014
 */

var program = require( 'commander' ),
    join = require( 'path' ).join,
    request = require( 'request' ),
    async = require( 'async' ),
    util = require( '../../lib/util' ),
    fs = require( 'fs' ),
    db = require( '../../lib/db' ),
    config,
    route;


program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '--card [id]', 'set card id to use', '53cd76b00bf505344037f08d' );

program.parse( process.argv );
config = util.getConfig( program.config );
route = config.route;


db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else {
        db.Card.findById( program.card, function( error, card ){
            console.log( 'Card', card );

            if ( error )
                util.abort( error );
            else
                async.parallel({
                    imgFront: function( cb ){
                        db.File.findById( card.imgFrontId, cb );
                    },
                    imgBack: function( cb ){
                        db.File.findById( card.imgBackId, cb );
                    }
                }, function( error, result ){
                    if ( error )
                        util.abort( error );
                    else {
                        var frontName = join( __dirname, result.imgFront.name ),
                            backName = join( __dirname, result.imgBack.name );
                        fs.writeFileSync( frontName, result.imgFront.data );
                        fs.writeFileSync( backName, result.imgBack.data );

                        request({
                            method: 'POST',
                            url: 'http://localhost:' + config.port + route.API_PREFIX + route.CARDS,
                            formData: {
                                userId: '53cd76a60bf505344037ef24',
                                imgFront: fs.createReadStream( frontName ),
                                imgBack: fs.createReadStream( backName )
                            }
                        }, function( error, response, body ){
                            fs.unlinkSync( frontName );
                            fs.unlinkSync( backName );

                            if ( error )
                                util.abort( error );
                            else {
                                console.log( 'Result:', body );
                                process.exit();
                            }
                        });
                    }
                });
        });
    }
});
