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
            else
                moveFiles( count );
        });

});


function moveFiles( cardsCount ){
    var barTpl = '[:bar] :percent (:current/:total) estimated time :etas',
        bar = new ProgressBar( barTpl, {total: cardsCount, width: 40} );
    Card.find().stream()
        .on( 'data', function( card ){
            async.parallel({
                front: function( cb ){
                    var img = card.imgFront;
                    if ( img && img.data ){
                        var file = new File;
                        file.set({
                            fileName: card._id + '-front.' + mime.extension( img.mimeType ),
                            data: img.data,
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
                            fileName: card._id + '-back.' + mime.extension( img.mimeType ),
                            data: img.data,
                            fileSize: img.data.length,
                            linkedEntity: card._id
                        });
                        file.save( cb );
                    }
                }
            }, function( error, files ){
                bar.tick();
                if ( error )
                    util.abort();
                else {
                    card.imgFrontId = files.front._id;
                    card.imgBackId = files.back._id;
                    card.save();
                }
            });
        })
        .on( 'error', function( error ){
            util.abort( error );
        })
        .on( 'close', function(){
            console.log( '\nSuccess!' );
            process.exit();
        });
}
