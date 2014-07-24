/**
 * @author Alexander Marenin
 * @date July 2014
 */

var util = require( '../../lib/util' ),
    db = require( '../../lib/db' ),
    config = util.getConfig( process.argv[2] || 'test' ),
    async = require( 'async' );

db.connect( config.mongodb, {}, function( error ){
    if ( error )
        util.abort( error );
    else {
        db.Card.aggregate([
            {$project: {issuerId: 1}},
            {$match: {issuerId: {$exists: true}}},
            {$group: {_id: '$issuerId', count: {$sum: 1}}},
            {$project: {issuerId: '$_id', count: 1, _id: 0}}
        ]).exec( function( error, list ){
            if ( error )
                util.abort( error );
            else
                async.forEach( list,
                    function( item, cb ){
                        db.Issuer.findByIdAndUpdate( item.issuerId, {cards: item.count}, cb );
                    },
                    function( error ){
                        if ( error )
                            util.abort( error );
                        else {
                            console.log( 'Success!' );
                            process.exit();
                        }
                    }
                );
        });
    }
});
