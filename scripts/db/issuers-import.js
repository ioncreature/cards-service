/**
 * @author Alexander Marenin
 * @date July 2014
 */


var program = require( 'commander' ),
    join = require( 'path' ).join,
    util = require( '../../lib/util' ),
    db = require( '../../lib/db' ),
    Card = db.Card,
    Issuer = db.Issuer,
    fs = require( 'fs' ),
    mime = require( 'mime' ),
    async = require( 'async' );


program
    .option( '-c, --config [name]', 'set the config name to use, default is "test"', 'test' )
    .option( '-d, --destDir <name>', 'set destination dir path' )
    .option( '-n, --number [integer]', 'number of top issuers', 10 );
program.parse( process.argv );

var config = util.getConfig( program.config ),
    destDir = program.destDir,
    issuersCount = program.number;

if ( !destDir )
    util.abort( new Error('destDir parameter is required') );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else {
        loadCardInfo( issuersCount, function( error, list ){
            if ( error )
                util.abort( error );
            else {
                saveCards( destDir, list, function( error ){
                    if ( error )
                        util.abort( error );
                    else {
                        console.log( 'Success!' );
                        process.exit();
                    }
                });
            }
        });
    }
});


function loadCardInfo( issuersCount, callback ){
    Issuer
        .find()
        .limit( issuersCount )
        .sort( '-cards' )
        .exec( function( error, issuers ){
            if ( error )
                callback( error );
            else {
                var ids = issuers.map( function( item ){
                    return item._id;
                });

                Card
                    .find( {issuerId: {$in: ids}} )
                    .select( '-imgFront -imgBack' )
                    .exec( callback );
            }
        });
}


function saveCards( destDir, cards, callback ){
    async.forEach( cards, function( card, cb ){
        Card.findOne( card._id, function( error, card ){
            if ( error )
                cb( error );
            else {
                saveCard( destDir, card );
                cb();
            }
        });
    }, callback );
}


function saveCard( destDir, card ){
    var issuerDir = join( destDir, escape(card.issuerName) ),
        typeDir = join( issuerDir, escape(card.typeName + '-' + card.typeId) ),
        imgFrontPath = join( typeDir, card._id + '-front.' + mime.extension(card.imgFront.mimeType) ),
        imgBackPath = join( typeDir, card._id + '-back.' + mime.extension(card.imgBack.mimeType) );

console.log( issuerDir );
console.log( typeDir );
console.log( imgFrontPath );
console.log( imgBackPath );

    if ( !fs.existsSync(destDir) )
        fs.mkdirSync( destDir );
    if ( !fs.existsSync(issuerDir) )
        fs.mkdirSync( issuerDir );
    if ( !fs.existsSync(typeDir) )
        fs.mkdirSync( typeDir );

    card.imgFront.data && fs.writeFileSync( imgFrontPath, card.imgFront.data );
    card.imgBack.data && fs.writeFileSync( imgBackPath, card.imgBack.data );
}


function escape( str ){
    return str.replace( /[\|\/"\<\>\:\?\*\\]/g, '' );
}