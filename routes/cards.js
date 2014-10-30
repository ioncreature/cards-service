/**
 * @author Alexander Marenin
 * @date July 2014
 */

const
    CARDS_PER_PAGE = 50,
    CARD_LOCK_TTL = 5 * 60 * 1000;

var registry = require( '../lib/registry' ),
    fs = require( 'fs' ),
    async = require( 'async' ),
    join = require( 'path' ).join,
    httpError = require( '../lib/http-error' ),
    qs = require( 'qs' ),
    util = require( '../lib/util' ),
    config = registry.get( 'config' ),
    route = config.route,
    db = registry.get( 'db' ),
    Matcher = require( '../lib/Matcher' ),
    Card = db.Card,
    File = db.File,
    CardType = db.CardType,
    Issuer = db.Issuer,
    ObjectId = db.ObjectId,
    Account = db.Account,
    Activity = db.Activity;

if ( config.matcher )
    var matcher = new Matcher( config.kuznech );


exports.getCards = function( req, res, next ){
    var query = {},
        page = Number( req.query.page ) || 1;

    async.parallel({
        count: function( cb ){
            Card.count( query, cb );
        },
        cards: function( cb ){
            Card.find( {}, '', {
                limit: CARDS_PER_PAGE,
                skip: ( page - 1 ) * CARDS_PER_PAGE
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

            res.render( 'page/cards', {
                pageName: 'cards',
                pageTitle: 'Cards list',
                cards: result.cards || [],
                totalPages: Math.ceil( result.count / CARDS_PER_PAGE ),
                tplUrl: tplUrl,
                currentPage: page,
                done: req.query.hasOwnProperty( 'done' )
            });
        }
    });
};


exports.getCard = function( req, res, next ){
    var id = req.params.id,
        accountId = req.session.user._id,
        card;

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        async.series({
            card: function( cb ){
                Card.findById( id, '', function( error, data ){
                    card = data;
                    cb( error, data );
                });
            },
            issuers: function( cb ){
                Issuer.find( {}, null, {sort: 'name'}, cb );
            },
            cardTypes: function( cb ){
                if ( card && card.issuerId )
                    CardType.find( {issuerId: card.issuerId}, cb );
                else
                    cb();
            },
            todayCards: function( cb ){
                Activity.countTodayModeratedCards( accountId, cb );
            }
        }, function( error, result ){
            var cardTypes = result.cardTypes || [],
                issuers = result.issuers;
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound );
            else {
                res.render( 'page/card', {
                    pageName: 'cards',
                    pageTitle: 'Card (today done: ' + result.todayCards + ')',
                    id: id,
                    city: card.city || '',
                    issuerId: card.issuerId || '',
                    issuers: issuers,
                    typeId: card.typeId || '',
                    cardTypes: cardTypes,
                    userId: card.userId || '',
                    showImages: true,
                    postUrl: util.formatUrl( route.CARD_PAGE, {id: id} ),
                    haveFrontImg: card.imgFrontId,
                    haveBackImg: card.imgBackId,
                    showNextButton: true,
                    locked: String(card.lastAccount) !== String(accountId) && (Date.now() - card.lastOpen < CARD_LOCK_TTL),
                    defaultNewType: 'Базовый',
                    submitCaption: 'Update'
                });
                card.setLast( accountId, util.noop );
            }
        });
    }
    else
        next( new httpError.BadRequest('Card id is invalid') );
};


exports.getNewCard = function( req, res, next ){
    Issuer.find( function( error, issuers ){
        if ( error )
            next( error );
        else
            res.render( 'page/card', {
                pageName: 'cards',
                pageTitle: 'New card',
                id: '',
                city: '',
                issuers: issuers || [],
                cardTypes: [],
                userId: '',
                showImages: false,
                postUrl: route.NEW_CARD_PAGE,
                submitCaption: 'Create card',
                defaultNewType: 'Базовый'
            });
    });
};


exports.validateCard = function( req, res, next ){
    var cardData = {
            city: filterString( req.body.city || '' )
        },
        id = req.params.id,
        issuerId = req.body.issuerId && filterString( req.body.issuerId ),
        newIssuerName = req.body.newIssuer,
        typeId = req.body.typeId && filterString( req.body.typeId ),
        newTypeName = req.body.newCardType,
        queries = {},
        role = req.role,
        accountId = req.session.user._id,
        error;

    if ( newIssuerName )
        queries.issuer = function( cb ){
            Issuer.create( {name: util.stripTags(newIssuerName)}, function( error, issuer ){
                if ( !error ){
                    cardData.issuerId = issuer._id;
                    Activity.createByAccount( accountId, issuer, {action: Activity.CREATE} );
                }
                cb( error, issuer );
            });
        };
    else if ( issuerId ){
        if ( ObjectId.isValid(issuerId) ){
            cardData.issuerId = new ObjectId( issuerId );
            queries.issuer = function( cb ){
                Issuer.findById( cardData.issuerId, 'name', cb );
            };
        }
        else
            error = new httpError.BadRequest( 'Invalid issuer id' );
    }

    if ( newTypeName ){
        queries.cardType = function( cb ){
            if ( !cardData.issuerId )
                cb();
            else
                CardType.create({
                    name: util.stripTags( newTypeName ),
                    issuerId: cardData.issuerId
                }, function( error, cardType ){
                    if ( !error ){
                        cardData.typeId = cardType._id;
                        Activity.createByAccount( accountId, cardType, {action: Activity.CREATE} );
                    }
                    cb( error, cardType );
                });
        };
    }
    else if ( typeId ){
        if ( ObjectId.isValid(typeId) ){
            cardData.typeId = new ObjectId( typeId );
            queries.cardType = function( cb ){
                CardType.findById( cardData.typeId, 'name', cb );
            };
        }
        else
            error = new httpError.BadRequest( 'Invalid card type id' );
    }

    if ( error )
        next( error );
    else {
        if ( role.can('upload card image') ){
            if ( req.files.imgFront )
                queries.imgFront = saveFile( req.files.imgFront, id );
            if ( req.files.imgBack )
                queries.imgBack = saveFile( req.files.imgBack, id );
            delete req.files;
        }
        req.cardData = cardData;

        if ( Object.keys(queries).length )
            async.series( queries, function( error, result ){
                if ( error )
                    next( error );
                else {
                    if ( result.issuer )
                        cardData.issuerName = result.issuer.name;
                    if ( result.cardType )
                        cardData.typeName = result.cardType.name;
                    if ( result.imgFront )
                        cardData.imgFrontId = result.imgFront[0]._id;
                    if ( result.imgBack )
                        cardData.imgBackId = result.imgBack[0]._id;
                    next();
                }
            });
        else
            next();
    }
};


exports.createCard = function( req, res, next ){
    var card = new Card;
    card.set( req.cardData );
    async.series({
        card: function( cb ){
            card.save( cb );
        },
        issuer: function( cb ){
            if ( card.issuerId )
                Issuer.increaseCards( card.issuerId, cb );
            else
                cb();
        }
    }, function( error ){
        if ( error )
            next( error );
        else
            res.redirect( route.CARDS_PAGE );
    });
};


exports.updateCard = function( req, res, next ){
    var id = req.params.id,
        accountId = req.session.user._id,
        cardData = req.cardData,
        goNextCard = req.body.hasOwnProperty( 'next' );

    if ( ObjectId.isValid(id) ){
        id = new ObjectId( id );
        Card.findById( id, function( error, card ){
            if ( error )
                next( error );
            else if ( !card )
                next( new httpError.NotFound );
            else {
                var prevIssuerId = card.issuerId,
                    wasFull = card.isFull(),
                    queries = {
                        update: function( cb ){
                            if ( req.body.switch === 'switch' ){
                                cardData.imgBackId = card.imgFrontId;
                                cardData.imgFrontId = card.imgBackId;
                            }
                            util.mixin( card, cardData );
                            card.save( cb );
                        }
                    };

                if ( prevIssuerId !== cardData.issuerId ){
                    if ( prevIssuerId )
                        queries.prevIssuer = function( cb ){
                            Issuer.decreaseCards( prevIssuerId, cb );
                        };
                    if ( cardData.issuerId )
                        queries.newIssuer = function( cb ){
                            Issuer.increaseCards( cardData.issuerId, cb );
                        };
                }

                async.series( queries, function( error ){
                    if ( error )
                        next( error );
                    else {
                        var moderate = !wasFull && card.isFull();

                        moderate && Account.addModeratedCard( accountId );
                        Activity.createByAccount( accountId, card, {moderate: moderate} );

                        if ( moderate && matcher ){
                            async.parallel({
                                imgFront: function( cb ){
                                    File.findById( card.imgFrontId, cb );
                                },
                                imgBack: function( cb ){
                                    File.findById( card.imgBackId, cb );
                                }
                            }, function( error, result ){
                                if ( error )
                                    next( error );
                                else {
                                    var front = result.imgFront,
                                        back = result.imgBack,
                                        frontPath = join( config.uploadsDir, front._id + front.name ),
                                        backPath = join( config.uploadsDir, back._id + back.name );
                                    fs.writeFileSync( frontPath, front.data );
                                    fs.writeFileSync( backPath, back.data );

                                    matcher.updateCard( card.issuerId, card.typeId, frontPath, backPath, function( error, result ){
                                        console.log( error, result );
                                        fs.unlinkSync( frontPath );
                                        fs.unlinkSync( backPath );
                                    });
                                }
                            });
                        }

                        if ( goNextCard )
                            res.redirect( route.CARD_MODERATE );
                        else
                            res.redirect( util.formatUrl( route.CARD_PAGE, {id: card._id} ) );
                    }
                });
            }
        });
    }
    else
        next( new httpError.BadRequest('Invalid card id') );
};


exports.moveToModerate = function( req, res, next ){
    Card.findOne({
        $or: [
            {issuerId: {$exists: false}},
            {typeId: {$exists: false}},
            {imgBackId: {$exists: false}},
            {imgFrontId: {$exists: false}}
        ],
        lastOpen: {$lt: Date.now() - CARD_LOCK_TTL}
    }, function( error, card ){
        if ( error )
            next( error );
        else if ( !card )
            res.redirect( route.CARDS_PAGE + '?done' );
        else
            res.redirect( util.formatUrl(route.CARD_PAGE, {id: card._id}) );
    });
};


function saveFile( fileDesc, id ){
    return function( cb ){
        var file = new File,
            data = fs.readFileSync( fileDesc.path );
        file.set({
            name: fileDesc.originalname,
            data: data,
            mimeType: fileDesc.mimetype,
            fileSize: data.length,
            linkedEntity: id || undefined
        });
        fs.unlinkSync( fileDesc.path );
        file.save( cb );
    };
}


function filterString( str ){
    return util.stripTags( str ).trim();
}
