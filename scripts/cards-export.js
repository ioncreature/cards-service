/**
 * @author Alexander Marenin
 * @date July 2014
 */

require( 'colors' );

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

program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-s, --sourceDir <name>', 'set source dir path' );
program.parse( process.argv );

var config = util.getConfig( program.config ),
    sourceDir = program.sourceDir;

if ( !sourceDir )
    abort( new Error('sourceDir parameter is required') );


console.log( 'Connecting to db' + '...'.yellow );
db.connect( config.mongodb, {}, function( error ){
    if ( error )
        abort( error );
    else {
        console.log( '\nParsing source directory' + '...'.yellow );
        var parsingStart = Date.now();
        parseFolder( sourceDir, function( error, result ){
            if ( error )
                abort( error );
            else {
                console.log( 'Parsed %s cards in %s', result.files.length, toSec(Date.now() - parsingStart) );
                console.log( '\nExport users to database' + '...'.yellow );
                var usersStart = Date.now();
                createUsers( result.users, function( error, users ){
                    if ( error )
                        abort( error );
                    else {
                        console.log( '%s users added in %s', users.length, toSec(Date,now() - usersStart) );
                        console.log( '\nExport cards to database' + '...'.yellow );
                        var exportStart = Date.now();
                        createCards( result.cards, users, function( error ){
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

                result.users.push( user );

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

    function filterDots( folderName ){
        return folderName !== '.' && folderName !== '..';
    }
}


function createUsers( list, cb ){
    var usersData = list.map( function( userName ){
        return {source: 'crowd', externalId: userName};
    });
    User.create( usersData, function( error ){
        cb( error, Array.prototype.slice.call(arguments, 1) );
    });
}


function createCards( cards, users, callback ){
    var barTpl = '[:bar] :percent (:current/:total) estimated time :etas',
        bar = new ProgressBar( barTpl, {total: cards.length, width: 40} );

    async.forEachSeries( cards, function( cardInfo, cb ){
        var userId = cardInfo.userId;
        users.some( function( user ){
            if ( user.externalId === cardInfo.userId ){
                userId = user._id;
                return true;
            }
        });

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
            userId: userId
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


function toSec( int ){
    var minutes = Math.floor( int / 60 / 1000 ),
        seconds = int % (60 * 1000) / 1000;
    return (minutes ? minutes + 'm ' : '' ) + seconds.toFixed( 2 ) + 's';
}