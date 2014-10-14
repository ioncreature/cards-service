/**
 * @author Alexander Marenin
 * @date July 2014
 */

const
    ISSUERS_PER_PAGE = 50,
    SEARCH_STRING_MAX_LENGTH = 20;

var registry = require( '../lib/registry' ),
    route = registry.get( 'config' ).route,
    qs = require( 'qs' ),
    db = registry.get( 'db' ),
    async = require( 'async' ),
    util = require( '../lib/util' ),
    Card = db.Card,
    CardType = db.CardType,
    Activity = db.Activity,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId;


exports.getIssuers = function( req, res, next ){
    var page = Number( req.query.page ) || 1,
        search = req.query.search && req.query.search.trim().substr( 0, SEARCH_STRING_MAX_LENGTH ),
        query = {};

    if ( search )
        query.name = new RegExp( search, 'i' );

    async.parallel({
        count: function( cb ){
            Issuer.count( query, cb );
        },
        issuers: function( cb ){
            Issuer.find( query, null, {
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
                pageTitle: 'Issuers list (' + result.issuers.length + ' of ' + result.count + ')',
                issuers: result.issuers,
                currentPage: page,
                totalPages: Math.ceil( result.count / ISSUERS_PER_PAGE ),
                tplUrl: tplUrl,
                search: search || ''
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
                            priority: issuer.priority || 0,
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
        accountId = req.session.user._id,
        priority = Number( req.body.priority ),
        issuerData = {
            name: filterString( req.body.name ),
            description: filterString( req.body.description ),
            url: filterString( req.body.url ),
            phone: filterString( req.body.phone ),
            address: filterString( req.body.address ),
            priority: isNaN( priority ) ? Issuer.NORMAL : Math.min( Math.max(priority, Issuer.LOW), Issuer.VERY_HIGH )
        },
        cardTypes = (req.body.cardType || [])
            .filter( function( cardType ){
                return cardType.name && !cardType._id;
            })
            .map( function( type ){
                return {
                    name: type.name,
                    issuerId: id
                };
            });

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Issuer.findById( id, function( error, issuer ){
            if ( error )
                next( error );
            else if ( !issuer )
                next( new Error('Issuer not found') );
            else
                async.series({
                    update: function( cb ){
                        util.mixin( issuer, issuerData );
                        issuer.save( cb );
                    },
                    cardTypes: function( cb ){
                        CardType.create( cardTypes, cb );
                    }
                }, function( error, result ){
                    if ( error )
                        next( error );
                    else {
                        Activity.createByAccount( accountId, issuer );
                        if ( result.cardTypes )
                            Activity.createByAccount( accountId, result.cardTypes, {action: Activity.CREATE} );
                        res.redirect( util.formatUrl(route.ISSUER_PAGE, {id: id}) );
                    }
                });
        });
    }
    else
        next( new Error('Incorrect Issuer ID ' + id) )
};


exports.getCardType = function( req, res, next ){
    var id = req.params.id;

    if ( ObjectId.isValid(id) ){
        CardType.findById( id, function( error, type ){
            if ( error )
                next( error );
            else if ( !type ){
                var e = new Error( 'Card type not found' );
                e.status = 404;
                next( error );
            }
            else {
                async.parallel({
                    issuer: function( cb ){
                        Issuer.findById( type.issuerId, cb );
                    },
                    cards: function( cb ){
                        Card.find( {typeId: type._id}, cb );
                    }
                }, function( error, result ){
                    if ( error )
                        next( error );
                    else if ( !result.issuer ){
                        var e = new Error( 'Issuer of this type of card not found' );
                        e.status = 404;
                        next( e );
                    }
                    else {
                        res.render( 'page/card-type', {
                            pageName: 'issuers',
                            pageTitle: 'Card type',
                            type: type,
                            issuer: result.issuer,
                            cards: result.cards
                        });
                    }
                });
            }
        });
    }
    else
        next( new Error('Card type id is invalid') );
};


exports.updateCardType = function( req, res, next ){
    var id = req.params.id,
        accountId = req.session.user._id;

    if ( ObjectId.isValid(id) ){
        CardType.findById( id, function( error, type ){
            if ( error )
                next( error );
            else if ( !type ){
                var e = new Error( 'Card type not found' );
                e.status = 404;
                next( e );
            }
            else {
                var prevData = type.toObject();
                type.name = util.stripTags( req.body.name );
                type.magneticStripe = req.body.magneticStripe === 'yes';
                type.cardNumber = req.body.cardNumber === 'yes';
                if ( type.cardNumber ){
                    var numberLength = Number( req.body.cardNumberLength );
                    type.cardNumberLength = isNaN( numberLength ) ? 0 : numberLength;
                }
                type.userName = req.body.userName === 'yes';
                type.chip = req.body.chip === 'yes';
                type.nfc = req.body.nfc === 'yes';

                type.save( function( error ){
                    if ( error )
                        next( error );
                    else {
                        var activity = new Activity;
                        activity.accountId = accountId;
                        activity.entityId = type._id;
                        activity.entityType = 'card type';
                        activity.action = 'update';
                        activity.moderate = false;
                        activity.diff = Activity.getDiff( prevData, type );
                        activity.save( util.noop );

                        res.redirect( util.formatUrl(route.CARD_TYPE_PAGE, {id: type._id}) );
                    }
                })
            }
        });
    }
    else
        next( new Error('Invalid card type id') );


};


function filterString( str ){
    return util.stripTags( str ).trim();
}
