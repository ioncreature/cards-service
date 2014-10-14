/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    var MAX_TEXTAREA_HEIGHT = 200,
        form = $( 'form#issuer' ),
        nameEl = $( 'input[name=name]' ),
        nameContainer = $( '#issuer-name-container' ),
        cardTypesEl = $( '#card-types' ),
        addCardTypeEl = $( '#add-type' ),
        issuerAddress = $( '#issuer-address' ),
        issuerDesc = $( '#issuer-desc' ),
        index = 100;

    addCardType();
    $( '#issuer-name' ).focus();


    form.submit( function( e ){
        if ( !nameEl.val() ){
            nameContainer.addClass( 'has-error' );
            e.preventDefault();
            return false;
        }
    });


    addCardTypeEl.click( function( e ){
        e.preventDefault();
        e.stopPropagation();
        addCardType( true );
    });


    issuerAddress.keyup( stretchTextArea );
    issuerDesc.keyup( stretchTextArea );
    stretchTextArea.call( issuerAddress[0] );
    stretchTextArea.call( issuerDesc[0] );


    function addCardType( focus ){
        var block = createCardTypeBlock( ++index );
        cardTypesEl.append( block );
        focus && block.find( 'input' ).focus();
    }


    function createCardTypeBlock( index ){
        var block = [
            "<div class='form-group'>",
                "<label>New card type</label>",
                "<input class='form-control' type='text' name='cardType[" + index + "][name]' />",
            "</div>",
        ].join( '' );
        return $( block );
    }

    function stretchTextArea(){
        var e = $( this ),
            scrollHeight = this.scrollHeight,
            height = e.innerHeight();

        if ( height < MAX_TEXTAREA_HEIGHT && scrollHeight > height )
            e.height( scrollHeight );
    }
});