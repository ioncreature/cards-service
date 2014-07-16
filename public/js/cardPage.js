/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    var issuersSelect = $( 'select[name=issuerId]' ),
        typesSelect = $( 'select[name=typeId]' ),
        updateAndNext = $( '#update-and-next' );

    issuersSelect.chosen();

    issuersSelect.change( function(){
        var issuerId = issuersSelect.val();
        issuerId && Server.loadCardTypes( {issuerId: issuerId} ).then( function( typesList ){
            typesSelect.find( 'option' ).remove();
            (typesList || []).forEach( function( type ){
                typesSelect.append( '<option value="' + type._id + '">' + type.name + '</option>' );
            });
        });
    });


    updateAndNext.click( function(){
        updateAndNext.attr( 'name', 'next' );
        updateAndNext.attr( 'value', 'yep' );
    });
});