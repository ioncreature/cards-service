/**
 * @author Alexander Marenin
 * @date July 2014
 */

exports.debug = true;
exports.quiet = true;

exports.port = 3000;

exports.mongodb = [
    {
        host: 'localhost',
        port: 27017,
        dbname: 'cardsDev'
    }
];

exports.auth = {
    login: 'admin',
    password: 'synqera'
};

exports.matcher = false;