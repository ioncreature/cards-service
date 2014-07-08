/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    var form = $( '#addIssuer' ),
        cardTypesEl = $( '#cardTypes' ),
        addCardTypeEl = $( '#addType' ),
        index = 100;

    addCardTypeEl.click( function( e ){
        e.preventDefault();
        e.stopPropagation();

        var block = createCardTypeBlock( ++index );
        cardTypesEl.append( block );
        block.find( 'input' ).focus();
    });

    addCardTypeEl.click();


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