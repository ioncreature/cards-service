/**
 * @author Alexander Marenin
 * @date July 2014
 */


var Server = {
    ISSUERS: '/api/issuer',
    ISSUER: '/api/issuer/:id',
    CARDS: '/api/card',
    CARD_TYPES: '/api/card-type',

    formatUrl: function( route, data ){
        var placeholders = route.match( /:\w+/g ) || [],
            res = route,
            encodedData = {},
            i;

        for ( var key in data )
            if ( data.hasOwnProperty(key) )
                encodedData[key] = encodeURIComponent( data[key] );

        for ( i = 0; i < placeholders.length; i++ )
            res = res.replace( new RegExp(placeholders[i], 'g'), encodedData[placeholders[i].substr(1)] );

        return res;
    },


    /**
     * @returns jQuery.Deferred
     */
    loadIssuers: function(){
        return $.get( Server.ISSUERS ).fail( function( error ){
            alert( error.toString() );
        });
    }
};
