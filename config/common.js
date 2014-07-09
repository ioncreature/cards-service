/**
 * @author Alexander Marenin
 * @date July 2014
 */

exports.title = 'Cards Service';
exports.processTitle = 'cards-service';

exports.route = {
    PUBLIC: '/public',
    PUBLIC_CSS: '/public/css',

    INDEX: '/',
    CARDS_PAGE: '/cards',
    NEW_CARD_PAGE: '/cards/new',
    CARD_PAGE: '/cards/:id',
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
    CARD_IMAGE: '/card/:id/image/:imgId',
    CARD_TYPES: '/card-type',
    CARD_TYPE: '/card-type/:id',
    ISSUERS: '/issuer',
    ISSUER: '/issuer/:id'
};

