/**
 * @author Alexander Marenin
 * @date July 2014
 */

exports.debug = false;

exports.port = 8080;

exports.proxyUsed = true;

exports.mongodb = [
    {
        host: 'localhost',
        port: 27017,
        dbname: 'cardsProd'
    }
];

exports.matcher = true;