/**
 * @author Alexander Marenin
 * @date July 2014
 */

var program = require( 'commander' ),
    util = require( '../lib/util' ),
    async = require( 'async' ),
    join = require( 'path' ).join,
    db = require( '../lib/db' ),
    Card = db.Card,
    User = db.User,
    fs = require( 'fs' ),
    mime = require( 'mime' ),
    ProgressBar = require( 'progress' );

require( 'colors' );

program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-s, --sourceDir <name>', 'set source dir path' );

program.parse( process.argv );

var config = util.getConfig( program.config ),
    sourceDir = program.sourceDir;

if ( !sourceDir )
    abort( new Error('sourceDir parameter is required') );


console.log( 'Connecting to db' + '...'.green );
db.connect( config.mongodb, {}, function( error ){
    if ( error )
        abort( error );
    else {
        console.log( 'Parsing source directory' + '...'.green );
        var parsingStart = Date.now();
        parseFolder( sourceDir, function( error, files ){
            if ( error )
                abort( error );
            else {
                console.log( 'Parsed %s cards in %s', files.length, toSec(Date.now() - parsingStart) );
                console.log( 'Export cards to database' + '...'.green );
                var exportStart = Date.now();
                createCards( files, function( error ){
                    if ( error )
                        abort( error );
                    else {
                        console.log( 'Export done in %s', toSec(Date.now() - exportStart) );
                        console.log( 'Done!' );
                        process.exit();
                    }
                });
            }
        });
    }
});


function parseFolder( sourceDir, callback ){
    var result = {cards: [], users: []},
        list = [],
        cities = fs.readdirSync( sourceDir );

    try {
        cities.filter( filterDots ).forEach( function( city ){
            var cityDir = join( sourceDir, city ),
                users = fs.readdirSync( cityDir );

            users.filter( filterDots ).forEach( function( user ){
                var userDir = join( cityDir, user ),
                    cards = fs.readdirSync( userDir );

                cards.filter( filterDots ).forEach( function( folderName ){
                    var cardDir = join( userDir, folderName ),
                        files = fs.readdirSync( cardDir ).filter( filterDots );

                    splitToPairs( files ).forEach( function( pair ){
                        result.cards.push({
                            city: city,
                            userId: user,
                            frontImgPath: join( cardDir, pair[0] ),
                            backImgPath: join( cardDir, pair[1] )
                        });
                    });
                });
            });
        });
        callback( undefined, list );
    }
    catch ( error ){
        callback( error );
    }

    function splitToPairs( list ){
        var res = [];

        for ( var i = 0; i < list.length; i += 2 )
            if ( list[i] && list[i + 1] )
                res.push( [list[i], list[i + 1]] );

        return res;
    }
}


function createCards( list, callback ){
    var barTpl = '[:bar] :percent (:current/:total) estimated time :etas',
        bar = new ProgressBar( barTpl, {total: list.length, width: 30} );

    async.forEachSeries( list, function( cardInfo, cb ){
        Card.create({
            imgFront: {
                mimeType: mime.lookup( cardInfo.frontImgPath ),
                data: fs.readFileSync( cardInfo.frontImgPath )
            },
            imgBack: {
                mimeType: mime.lookup( cardInfo.backImgPath ),
                data: fs.readFileSync( cardInfo.backImgPath )
            },
            city: cardInfo.city,
            userExtId: cardInfo.userId
        }, function( error ){
            bar.tick();
            if ( error )
                abort( error );
            cb( error );
        });
    }, callback );
}


function abort( error ){
    if ( error ){
        console.error( error.message.red );
        console.error( error.stack.grey );
    }
    process.abort( 1 );
}

function filterDots( folderName ){
    return folderName !== '.' && folderName !== '..';
}


function toSec( int ){
    var minutes = Math.floor( int / 60 / 1000 ),
        seconds = int % (60 * 1000) / 1000;
    return (minutes ? minutes + 'm ' : '' ) + seconds.toFixed( 2 ) + 's';
}