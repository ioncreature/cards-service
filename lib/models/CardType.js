/**
 * @author Alexander Marenin
 * @date July 2014
 */

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: {type: String, required: true},
    issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true, required: true}
});