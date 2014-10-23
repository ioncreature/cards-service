/**
 * @author Alexander Marenin
 * @date October 2014
 */

const
    DEFAULT_RADIUS = 5000, //meters
    MAX_RADIUS = 20000, //meters
    MIN_RADIUS = 100,
    MIN_LNG = -180,
    MAX_LNG = 180,
    MIN_LAT = -90,
    MAX_LAT = 90;


var registry = require( '../../lib/registry' ),
    util = require( '../../lib/util' ),
    httpError = require( '../../lib/http-error' ),
    route = registry.get( 'config' ).route,
    db = registry.get( 'db' ),
    Place = db.Place,
    ObjectId = db.ObjectId;


exports.getPlacesNear = function( req, res, next ){
    var lng = Number( req.query.lng ),
        lat = Number( req.query.lat ),
        radius = Number( req.query.radius ) || DEFAULT_RADIUS,
        issuerId = req.query.issuerId,
        conditions = {};

    if ( issuerId && ObjectId.isValid(issuerId) )
        conditions.issuerId = issuerId;

    if ( isNaN(lng) || isNaN(lat) )
        next( new httpError.BadRequest('Incorrect lng or lat parameters') );
    else {
        lng = bounds( lng, MIN_LNG, MAX_LNG );
        lat = bounds( lat, MIN_LAT, MAX_LAT );
        radius = bounds( radius, MIN_RADIUS, MAX_RADIUS );

        conditions.pos = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: radius
            }
        };

        Place.find( conditions, function( error, places ){
            if ( error )
                next( error );
            else
                res.json( places );
        });
    }
};


function bounds( val, min, max ){
    return Math.max( min, Math.min(max, val) );
}