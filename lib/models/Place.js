/**
 * @author Alexander Marenin
 * @date October 2014
 */

const
    STORE = 'store',
    HEADQUARTERS = 'headquarters',
    OFFICE = 'office',
    WAREHOUSE = 'warehouse';

var Schema = require( 'mongoose' ).Schema;

module.exports = new Schema({
    name: {type: String, default: ''},
    description: {type: String, default: ''},
    issuerId: {type: Schema.Types.ObjectId, ref: 'Issuer', index: true},
    address: {type: String, default: ''},
    pos: {type: [Number, Number], index: '2dsphere'},
    type: {type: String, default: STORE, enum: [STORE, HEADQUARTERS, OFFICE, WAREHOUSE]},
    phone: {type: String, default: ''},
    email: {type: String, default: ''}
});