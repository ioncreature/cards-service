/**
 * @author Alexander Marenin
 * @date September 2014
 */

$( function(){
    var editButton = $( '#edit-button' ),
        cancelButton = $( '#cancel-button' ),
        panelInfoEdit = $( '#panel-info-edit' ),
        panelInfo = $( '#panel-info' );


    editButton.click( function(){
        if ( panelInfo.is(':visible') ){
            panelInfo.hide();
            panelInfoEdit.show();
        }
        else
            cancelButton.click();
    });


    cancelButton.click( function( e ){
        e.preventDefault();
        e.stopPropagation();

        panelInfo.show();
        panelInfoEdit.hide();

        return false;
    });
});