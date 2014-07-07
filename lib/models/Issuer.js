/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: String,
    description: String,
    url: String,
    phone: String,
    address: String
});
