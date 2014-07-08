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
    ISSUERS: '/issuer',
    ISSUER: '/issuer/:id'
};

