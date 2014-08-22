/**
 * @author Alexander Marenin
 * @date August 2014
 */

var util = require( '../../../lib/util' ),
    db = require( '../../../lib/db' ),
    async = require( 'async' ),
    Card = db.Card,
    CardType = db.CardType,
    Issuer = db.Issuer,
    config = util.getConfig( process.argv[2] || 'test' );

const
    TYPE_TO_MERGE = 'Базовый';


db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else
        collectDuplicateCardType( function( error, list ){
            console.log( arguments );
            if ( error )
                util.abort( error );
            else
                async.forEach( list,
                    function( item, cb ){
                        if ( error )
                            cb( error );
                        else
                            mergeTypes( item, cb );
                    },
                    function( error ){
                        console.log( arguments );
                        if ( error )
                            util.abort( error );
                        else {
                            console.log( 'Success!' );
                            process.exit();
                        }
                    }
                );
        });
});


function collectDuplicateCardType( callback ){
    var issuerTypes = {};
    CardType.find( null, null, {sort: {issuerId: 1}}, function( error, types ){
        if ( error )
            callback( error );
        else {
            types.forEach( function( item ){
                var issuerId = item.issuerId.toString();
                if ( item.name === TYPE_TO_MERGE ){
                    if ( issuerTypes[issuerId] )
                        issuerTypes[issuerId].push( item );
                    else
                        issuerTypes[issuerId] = [item];
                }
            });
            callback( null, Object.keys(issuerTypes).map( function( key ){
                return issuerTypes[key];
            }));
        }
    });
}

function mergeTypes( types, callback ){
    if ( types.length > 1 ){
        var mainType = types.shift(),
            otherIds = types.map( function( item ){
                return item._id;
            });

        Card.update(
            {
                typeId: {$in: otherIds}
            },
            {
                $set: {
                    typeId: mainType._id,
                    typeName: mainType.name
                }
            },
            function( error ){
                if ( error )
                    callback( error );
                else
                    CardType.remove( {_id: {$in: otherIds}}, callback );
            }
        );
    }
    else
        callback();
}