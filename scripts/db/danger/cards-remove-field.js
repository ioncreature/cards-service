/**
 * @author Alexander Marenin
 * @date September 2014
 */

var util = require( '../../../lib/util' ),
    db = require( '../../../lib/db' ),
    async = require( 'async' ),
    Card = db.Card,
    File = db.File,
    config = util.getConfig( process.argv[2] || 'test' ),
    ProgressBar = require( 'progress' );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else
        Card.count( null, function( error, cardsCount ){
            if ( error )
                util.abort( error );
            else {
                console.log( 'Removing images from cards collection...' );

                var start = Date.now(),
                    curr = 0,
                    barTpl = '[:bar] :percent (:current/:total) estimated time :etas',
                    bar = new ProgressBar( barTpl, {total: cardsCount, width: 40} );

                Card.find().stream()
                    .on( 'data', function( card ){
                        card.imgFront = undefined;
                        card.imgBack = undefined;
                        card.save( function( error ){
                            if ( error )
                                util.abort( error );
                            else {
                                bar.tick();
                                if ( ++curr >= cardsCount ){
                                    console.log( '\nSuccess!' );
                                    console.log( 'Time spent:', ((Date.now() - start) / 1000).toFixed(2) + ' sec' );
                                    process.exit();
                                }
                            }
                        });
                    })
                    .on( 'error', function( error ){
                        util.abort( error );
                    });
            }
        });

});


function moveFiles( cardsCount ){

}
