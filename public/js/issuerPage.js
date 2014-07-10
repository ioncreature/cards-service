/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    var form = $( 'form#issuer' ),
        nameEl = $( 'input[name=name]' ),
        nameContainer = $( '#issuer-name-container' ),
        cardTypesEl = $( '#cardTypes' ),
        addCardTypeEl = $( '#addType' ),
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
});