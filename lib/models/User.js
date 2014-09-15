/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: String,
    source: {type: String, index: true},
    externalId: {type: String, index: true},
    deviceId: {type: String, index: true}
});
