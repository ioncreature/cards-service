/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    async = require( 'async' ),
    util = require( '../lib/util' ),
    Card = db.Card,
    CardType = db.CardType,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;

module.exports = router;


router.get( route.INDEX, function( req, res ){
    res.render( 'page/index', {
        pageName: 'index',
        pageTitle: 'Dashboard'
    });
});


router.get( route.CARDS_PAGE, function( req, res, next ){
    Card.find( function( error, cards ){
        if ( error )
            next( error );
        else
            res.render( 'page/cards', {
                pageName: 'cards',
                pageTitle: 'Cards list',
                cards: cards
            });
    });
});


router.get( route.CARD_PAGE, function( req, res ){
    res.render( 'page/index', {
        pageName: 'cards',
        pageTitle: 'card'
    });
});


router.get( route.ISSUERS_PAGE, function( req, res, next ){
    Issuer.find( function( error, issuers ){
        if ( error )
            next( error );
        else
            res.render( 'page/issuers', {
                pageName: 'issuers',
                pageTitle: 'Issuers list',
                issuers: issuers
            });
    });
});


router.get( route.NEW_ISSUER_PAGE, function( req, res ){
    res.render( 'page/issuer', {
        pageName: 'issuers',
        pageTitle: 'Add issuer',
        postUrl: route.NEW_ISSUER_PAGE,
        name: '',
        description: '',
        url: '',
        phone: '',
        address: '',
        cardTypes: [],
        submitCaption: 'Add issuer'
    });
});


router.post( route.NEW_ISSUER_PAGE, function( req, res, next ){
    var cardTypes = (b.cardType || []).filter( function( item ){
            return item.name;
        }),
        issuerData = {
            name: filterString( req.body.name ),
            description: filterString( req.body.description ),
            url: filterString( req.body.url ),
            phone: filterString( req.body.phone ),
            address: filterString( req.body.address )
        };

    Issuer.create( issuerData, function( error, issuer ){
        if ( error )
            next( error );
        else {
            var items = cardTypes.map( function( item ){
                return {
                    name: filterString( item.name ),
                    issuerId: issuer._id
                }
            });
            CardType.create( items, function( error ){
                if ( error )
                    next( error );
                else
                    res.redirect( route.ISSUERS_PAGE );
            });
        }
    });
});


router.get( route.ISSUER_PAGE, function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Issuer.findById( id, function( error, issuer ){
            if ( error )
                next( error );
            else if ( !issuer )
                next( new Error('Issuer with ID ' + id + ' not found') );
            else
                CardType.find( {issuerId: issuer._id}, function( error, cardTypes ){
                    if ( error )
                        next( error );
                    else
                        res.render( 'page/issuer', {
                            pageName: 'issuers',
                            pageTitle: 'Issuer',
                            postUrl: util.formatUrl( route.ISSUER_PAGE, {id: id} ),
                            name: issuer.name,
                            description: issuer.description,
                            url: issuer.url,
                            phone: issuer.phone,
                            address: issuer.address,
                            cardTypes: cardTypes || [],
                            submitCaption: 'Update issuer'
                        });
                });
        });
    }
    else
        next( new Error('Incorrect Issuer ID ' + id) )
});


router.post( route.ISSUER_PAGE, function( req, res, next ){
    var id = req.params.id,
        issuerData = {
            name: filterString( req.body.name ),
            description: filterString( req.body.description ),
            url: filterString( req.body.url ),
            phone: filterString( req.body.phone ),
            address: filterString( req.body.address )
        },
        cardTypes = (req.body.cardType || []).filter( function( cardType ){
            return cardType.name && !cardType._id;
        });

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Issuer.findByIdAndUpdate( id, issuerData, function( error, issuer ){
            if ( error )
                next( error );
            else if ( !issuer )
                next( new Error('Issuer with ID ' + id + ' not found') );
            else {
                var types = cardTypes.map( function( type ){
                    return {
                        name: type.name,
                        issuerId: id
                    };
                });
                CardType.create( types, function( error ){
                    if ( error )
                        next( error );
                    else
                        res.redirect( util.formatUrl(route.ISSUER_PAGE, {id: id}) );
                });
            }
        });
    }
    else
        next( new Error('Incorrect Issuer ID ' + id) )
});


function filterString( str ){
    return util.stripTags( str ).trim();
}