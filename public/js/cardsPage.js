/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    $( 'tr[data-card-url]' ).dblclick( function(){
        window.location.href = $( this ).data( 'card-url' );
    });
});