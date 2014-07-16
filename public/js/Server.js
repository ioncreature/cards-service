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
            i;

        for ( i = 0; i < placeholders.length; i++ )
            res = res.replace( new RegExp(placeholders[i], 'g'), encodeURIComponent(data[placeholders[i].substr(1)]) );

        return res;
    },


    /**
     * @param {Object?} options
     * @returns jQuery.Deferred
     */
    loadIssuers: function( options ){
        var query = {};

        if ( options && options.search )
            query.search = options.search;

        if ( options && options.sort )
            query.sort = options.sort;

        return $.get( Server.ISSUERS, query ).fail( function( error ){
            alert( error.toString() );
        });
    },


    /**
     * @param {{issuerId?, sort?}?} options
     * @returns {*}
     */
    loadCardTypes: function( options ){
        var query = {};
        if ( options && options.issuerId )
            query.issuerId = options.issuerId;
        if ( options && options.sort )
            query.sort = 'name';
        return $.get( Server.CARD_TYPES, query ).fail( function( error ){
            alert( error.toString() );
        });
    }
};
