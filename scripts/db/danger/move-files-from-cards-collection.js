/**
 * @author Alexander Marenin
 * @date September 2014
 */

var util = require( '../../../lib/util' ),
    mime = require( 'mime' ),
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
        Card.count( null, function( error, count ){
            if ( error )
                util.abort( error );
            else {
                console.log( 'Total cards:', count );
                moveFiles( count );
            }
        });

});


function moveFiles( cardsCount ){
    var start = Date.now(),
        curr = 0,
        barTpl = '[:bar] :percent (:current/:total) estimated time :etas',
        bar = new ProgressBar( barTpl, {total: cardsCount, width: 40} );

    Card.find().stream()
        .on( 'data', function( card ){
            async.parallel({
                front: function( cb ){
                    var img = card.imgFront;
                    if ( img && img.data ){
                        var file = new File;
                        file.set({
                            name: card._id + '-front.' + mime.extension( img.mimeType ),
                            data: img.data,
                            mimeType: img.mimeType,
                            fileSize: img.data.length,
                            linkedEntity: card._id
                        });
                        file.save( cb );
                    }
                },
                back: function( cb ){
                    var img = card.imgBack;
                    if ( img && img.data ){
                        var file = new File;
                        file.set({
                            name: card._id + '-back.' + mime.extension( img.mimeType ),
                            data: img.data,
                            mimeType: img.mimeType,
                            fileSize: img.data.length,
                            linkedEntity: card._id
                        });
                        file.save( cb );
                    }
                }
            }, function( error, files ){
                if ( error )
                    util.abort();
                else {
                    card.imgFrontId = files.front[0]._id;
                    card.imgBackId = files.back[0]._id;
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
                }
            });
        })
        .on( 'error', function( error ){
            util.abort( error );
        });
}
