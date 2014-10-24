/**
 * @author Alexander Marenin
 * @date October 2014
 */

var request = require( 'request' ),
    fs = require( 'fs' );

module.exports = Matcher;


function Matcher( cfg ){
    this.url = cfg.url;
    this.route = cfg.route;
}


Matcher.prototype.match = function( front, back, callback ){
    request({
        url: this.url + this.route.SEND_CARD,
        method: 'POST',
        formData: {
            image1: fs.createReadStream( front ),
            image2: fs.createReadStream( back )
        }
    }, function( error, res, body ){
        if ( error )
            callback( error );
        else if ( res.statusCode !== 200 ){
            var e = new Error( 'Response: ' +  body );
            e.status = res.statusCode;
            callback( e );
        }
        else {
            try {
                callback( null, JSON.parse(body) );
            }
            catch ( e ){
                callback( e );
            }
        }
    });
};


Matcher.prototype.updateCard = function( issuerId, typeId, back, front, callback ){
    request({
        url: util.formatUrl( this.url + this.route.UPDATE_CARD, {issuerId: issuerId, typeId: typeId} ),
        method: 'POST',
        formData: {
            imageFront: fs.createReadStream( front ),
            imageBack: fs.createReadStream( back )
        }
    }, function( error, res, body ){
        if ( error )
            callback( error );
        else {
            try {
                var result = JSON.parse( body );
                callback( error, result );
            }
            catch ( e ){
                callback( e );
            }
        }
    });
};
