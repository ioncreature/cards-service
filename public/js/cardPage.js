/**
 * @author Alexander Marenin
 * @date July 2014
 */

$( function(){
    Server.loadIssuers().done( function( issuers ){
        //console.log( issuers );
    });
});