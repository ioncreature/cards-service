/**
 * @author Alexander Marenin
 * @date July 2014
 */

exports.title = 'Cards Service';
exports.processTitle = 'cards-service';
exports.uploadsDir = require( 'path' ).join( __dirname, '..', 'uploads' );

exports.route = {
    PUBLIC: '/public',
    PUBLIC_CSS: '/public/css',

    INDEX: '/',
    CARDS_PAGE: '/cards',
    NEW_CARD_PAGE: '/cards/new',
    CARD_PAGE: '/cards/:id',
    CARD_MODERATE: '/cards/moderate',
    ISSUERS_PAGE: '/issuers',
    ISSUER_PAGE: '/issuers/:id',
    NEW_ISSUER_PAGE: '/issuers/new',
    USERS_PAGE: '/users',
    USER_PAGE: '/users/:id',
    LOGIN: '/login',
    LOGOUT: '/logout',

    // REST API
    API_PREFIX: '/api',
    API_INFO: '/',
    CARDS: '/card',
    CARD: '/card/:id',
    CARD_IMAGE: '/card/:id/img/:type',
    CARD_TYPES: '/card-type',
    CARD_TYPE: '/card-type/:id',
    CARD_TYPE_PREVIEW_FRONT: '/card-type/:id/img/:type',
    ISSUERS: '/issuer',
    ISSUER: '/issuer/:id'
};


exports.cookieTtl = 6 * 3600 * 1000;
