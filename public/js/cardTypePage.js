/**
 * @author Alexander Marenin
 * @date September 2014
 */

$( function(){
    var editButton = $( '#edit-button' ),
        typeInfo = $( '#type-info' ),
        typeForm = $( '#type-form' ),
        cancelButton = $( '#cancel-button' ),
        cardNumberCheckbox = $( 'input[name="cardNumber"]' ),
        cardNumberLengthContainer = $( '#card-number-length-container' );

    editButton.click( function(){
        if ( typeInfo.is(':visible') ){
            typeInfo.hide();
            typeForm.show();
        }
        else
            cancelButton.click();
    });


    cancelButton.click( function( e ){
        e.preventDefault();
        e.stopPropagation();

        typeInfo.show();
        typeForm.hide();

        return false;
    });


    cardNumberCheckbox.change( function(){
        if ( cardNumberCheckbox.is(':checked') )
            cardNumberLengthContainer.show();
        else
            cardNumberLengthContainer.hide();
    });
});