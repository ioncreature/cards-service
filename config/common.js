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
    LOGIN: '/login',
    LOGOUT: '/logout',

    // REST API
    API: '/api',
    API_INFO: '/',
    CARDS: '/card',
    CARD: '/card/:id',
    ISSUERS: '/issuer',
    ISSUER: '/issuer/:id'
};

