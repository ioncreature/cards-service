/**
 * @author Alexander Marenin
 * @date September 2014
 */

var Schema = require( 'mongoose' ).Schema;

var File = new Schema({
    name: {type: String, default: ''},
    mimeType: String,
    fileSize: {type: Number, default: 0},
    linkedEntity: Schema.Types.ObjectId,
    data: Buffer,
    updated: {type: Date, default: Date.now}
});

module.exports = File;
