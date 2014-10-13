/**
 * @author Alexander Marenin
 * @date July 2014
 */

exports.title = 'Cards Service';
exports.processTitle = 'cards-service';
exports.uploadsDir = require( 'path' ).join( __dirname, '..', 'uploads' );
exports.backupDir = require( 'path' ).join( __dirname, '..', 'backup' );
exports.cookieTtl = 6 * 3600 * 1000;

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
    CARD_TYPE_PAGE: '/card-type/:id',
    NEW_ISSUER_PAGE: '/issuers/new',
    USERS_PAGE: '/users',
    USER_PAGE: '/users/:id',
    ACCOUNTS_PAGE: '/accounts',
    ACCOUNT_PAGE: '/accounts/:login',
    ACCOUNT_OWN_PAGE: '/me',
    LOGIN: '/login',
    LOGOUT: '/logout',

    // REST API
    API_PREFIX: '/api',
    API_INFO: '/',
    USERS: '/user',
    USER: '/user/:id',
    USER_CARDS: '/user/:id/cards',
    USER_LOGIN: '/user/:id',
    FILE: '/file/:id',
    CARDS: '/card',
    CARD: '/card/:id',
    CARD_IMAGE: '/card/:id/img/:type',
    CARD_TYPES: '/card-type',
    CARD_TYPE: '/card-type/:id',
    CARD_TYPE_PREVIEW_FRONT: '/card-type/:id/img/:type',
    ISSUERS: '/issuer',
    ISSUER: '/issuer/:id',
    ISSUER_CARD_TYPES: '/issuer/:id/types',
    ISSUER_IMAGE: '/issuer/:id/preview'
};

exports.permissions = [
    'get dashboard',
    'get cards',
    'edit card',
    'upload card image',
    'get issuers',
    'edit issuer',
    'get users',
    'get accounts',
    'edit accounts',
    'edit permissions',
    'get log'
];

exports.acl = {
    'admin': {can: exports.permissions},
    'card moderator': {can: [
        'get dashboard',
        'get cards',
        'edit card',
        'get issuers'
    ]},
    'issuer moderator': {can: [
        'get dashboard',
        'get issuers',
        'edit issuer'
    ]}
};