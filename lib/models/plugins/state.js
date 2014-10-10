/**
 * @author Alexander Marenin
 * @date October 2014
 */

module.exports = function( schema ){
    schema.post( 'init', function(){
        this._original = this.toObject();
        this._isNew = this.isNew;
    });

    schema.post( 'remove', function(){
        this._isRemoved = true;
    });
};
