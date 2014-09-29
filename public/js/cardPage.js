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
        newCardTypeInput = $( '#new-card-type' ),
        cardTypeContainer = $( '#existing-card-type-container' ),
        hideNewCardType = $( 'span#hide-new-card-type' ),
        newCardTypeContainer = $( '#new-card-type-container' ),
        typePreviewFront = $( '#preview-front' ),
        typePreviewBack = $( '#preview-back' ),
        typePreviewContainer = $( '#card-type-preview' ),
        switchImagesButton = $( '#switch-images' ),
        switchInput = $( 'input[name="switch"]' ),
        imgFront = $( '#imgFront' ),
        imgBack = $( '#imgBack' );

    var KEY_ESC = 27,
        KEY_ENTER = 13,
        KEY_I = 73,
        KEY_X = 88;


    $( '[rel=popover]' ).popover({
        html: true,
        placement: 'left',
        content: function(){
            return $( $(this).data('contentwrapper') ).html();
        }
    });


    issuersSelect.chosen();

    issuersSelect.change( function(){
        var issuerId = issuersSelect.val();
        issuerId && Server.loadCardTypes( {issuerId: issuerId} ).then( function( typesList ){
            typesSelect.find( 'option' ).remove();
            (typesList || []).forEach( function( type ){
                typesSelect.append( '<option value="' + type._id + '">' + type.name + '</option>' );
            });
            typesSelect.change();
        });
    });


    typesSelect.change( function(){
        var typeId = typesSelect.val();

        if ( typeId ){
            typePreviewContainer.show();
            typePreviewFront.attr( 'src', Server.formatUrl(Server.CARD_TYPE_IMG_FRONT, {id: typeId}) );
            typePreviewBack.attr( 'src', Server.formatUrl(Server.CARD_TYPE_IMG_BACK, {id: typeId}) );
        }
        else
            typePreviewContainer.hide();
    });
    typesSelect.change();


    updateAndNext.click( function(){
        updateAndNext.attr( 'name', 'next' );
        updateAndNext.attr( 'value', 'yep' );
    });


    newIssuerHelp.click( function(){
        issuerContainer.hide();
        newIssuerContainer.show();
        cardTypeContainer.hide();
        newCardTypeHelp.click();
        newIssuerContainer.find( 'input' ).focus();
    }).find( 'a' ).click( function( event ){
        event.preventDefault();
    });


    hideNewIssuer.click( function(){
        newIssuerContainer.hide();
        newIssuerContainer.find( 'input' ).val( '' );
        issuerContainer.show();
        hideNewCardType.click();
        setTimeout( function(){
            issuersSelect.trigger( 'chosen:activate' );
        }, 50 );
    });


    newCardTypeHelp.click( function(){
        cardTypeContainer.hide();
        newCardTypeContainer.show();
        newCardTypeContainer.find( 'input' ).focus();
        newCardTypeInput.val( newCardTypeInput.data('default') );
    }).find( 'a' ).click( function( event ){
        event.preventDefault();
    });


    newCardTypeContainer.find( 'input' ).on( 'keyup', function( event ){
        if ( event.keyCode === KEY_ESC )
            hideNewCardType.click();
    });


    hideNewCardType.click( function(){
        newCardTypeContainer.hide();
        newCardTypeContainer.find( 'input' ).val( '' );
        cardTypeContainer.show();
        newCardTypeInput.val( '' );
    });


    issuersSelect.trigger( 'chosen:activate' );


    switchImagesButton.click( function(){
        var val = switchInput.val();
        switchInput.val( val ? '' : 'switch' );

        var parent = imgFront.parent();
        imgBack.parent().append( imgFront );
        parent.append( imgBack );
    });


    $( 'body, input' ).on( 'keydown', function( e ){
        if ( e.ctrlKey && e.keyCode === KEY_ENTER )
            updateAndNext.click();

        if ( e.ctrlKey && e.keyCode === KEY_I )
            newIssuerHelp.click();

        if ( e.ctrlKey && e.keyCode === KEY_X )
            switchImagesButton.click();

        if ( e.keyCode === KEY_ESC )
            hideNewIssuer.click();
    });
});
