/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    var issuersSelect = $( 'select[name=issuerId]' ),
        typesSelect = $( 'select[name=typeId]' ),
        updateAndNext = $( '#update-and-next' ),
        newIssuerHelp = $( '#new-issuer-help' ),
        issuerContainer = $( '#exisitng-issuer-container' ),
        hideNewIssuer = $( 'span#hide-new-issuer' ),
        newIssuerContainer = $( '#new-issuer-container' ),
        newCardTypeHelp = $( '#new-card-type-help' ),
        cardTypeContainer = $( '#existing-card-type-container' ),
        hideNewCardType = $( 'span#hide-new-card-type' ),
        newCardTypeContainer = $( '#new-card-type-container' );

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


    newIssuerHelp.click( function(){
        issuerContainer.hide();
        newIssuerContainer.show();
        newIssuerContainer.find( 'input' ).focus();
        cardTypeContainer.hide();
        newCardTypeContainer.show();
    }).find( 'a' ).click( function( event ){
        event.preventDefault();
    });


    newIssuerContainer.find( 'input' ).on( 'keyup', function( event ){
        if ( event.keyCode === 27 )
            hideNewIssuer.click();
    });


    hideNewIssuer.click( function(){
        newIssuerContainer.hide();
        newIssuerContainer.find( 'input' ).val( '' );
        issuerContainer.show();
        hideNewCardType.click();
    });


    newCardTypeHelp.click( function(){
        cardTypeContainer.hide();
        newCardTypeContainer.show();
        newCardTypeContainer.find( 'input' ).focus();
    }).find( 'a' ).click( function( event ){
        event.preventDefault();
    });


    newCardTypeContainer.find( 'input' ).on( 'keyup', function( event ){
        if ( event.keyCode === 27 )
            hideNewCardType.click();
    });


    hideNewCardType.click( function(){
        newCardTypeContainer.hide();
        newCardTypeContainer.find( 'input' ).val( '' );
        cardTypeContainer.show();
    });
});