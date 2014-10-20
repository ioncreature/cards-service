/**
 * @author Alexander Marenin
 * @date October 2014
 */

module.exports = function( schema ){
    schema.post( 'init', function( doc ){
        doc._original = doc.toObject();
        doc._isNew = doc.isNew;
    });

    schema.post( 'remove', function(){
        this._isRemoved = true;
    });
};
