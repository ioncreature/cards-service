/**
 * @author Alexander Marenin
 * @date July 2014
 */

const ISSUERS_PER_PAGE = 50;

var registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    qs = require( 'qs' ),
    db = registry.get( 'db' ),
    async = require( 'async' ),
    util = require( '../lib/util' ),
    CardType = db.CardType,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;


exports.getIssuers = function( req, res, next ){
    var page = Number( req.query.page ) || 1;

    async.parallel({
        count: function( cb ){
            Issuer.count( cb );
        },
        issuers: function( cb ){
            Issuer.find( {}, null, {
                limit: ISSUERS_PER_PAGE,
                skip: ( page - 1 ) * ISSUERS_PER_PAGE,
                sort: {cards: -1}
            }, cb );
        }
    }, function( error, result ){
        if ( error )
            next( error );
        else {
            var tplQuery = util.mixin( {}, req.query ),
                tplUrl;
            delete tplQuery.page;
            tplQuery = qs.stringify( tplQuery );
            tplUrl = '?' + (tplQuery ? tplQuery + '&' : '') + 'page=:page';

            res.render( 'page/issuers', {
                pageName: 'issuers',
                pageTitle: 'Issuers list',
                issuers: result.issuers,
                currentPage: page,
                totalPages: Math.ceil( result.count / ISSUERS_PER_PAGE ),
                tplUrl: tplUrl
            });
        }
    });
};


exports.getNewIssuer = function( req, res ){
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
};


exports.createNewIssuer = function( req, res, next ){
    var cardTypes = (req.body.cardType || []).filter( function( item ){
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
};


exports.getIssuer = function( req, res, next ){
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
};


exports.updateIssuer = function( req, res, next ){
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
};


function filterString( str ){
    return util.stripTags( str ).trim();
}