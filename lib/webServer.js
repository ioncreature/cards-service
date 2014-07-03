/**
 * @author Alexander Marenin
 * @date July 2014
 */

var http = require( 'http' ),
    express = require( 'express' ),
    join = require( 'path' ).join,
    favicon = require( 'serve-favicon' ),
    logger = require( 'morgan' ),
    cookieParser = require( 'cookie-parser' ),
    bodyParser = require( 'body-parser' ),
    lessMiddleware = require( 'less-middleware' ),
    registry = require( './registry' ),
    app = express(),
    config = registry.get( 'config' ),
    route = config.route;


var index = require( '../routes/index' ),
    api = require( '../routes/api' );

app.set( 'views', join(__dirname, '..', 'views') );
app.set( 'view engine', 'jade' );

app.locals.route = config.route;
app.locals.title = config.title;

var publicDir = join( __dirname, '..', 'public' );
app.use( favicon(join(publicDir, 'favicon.ico')) );
app.use( logger( 'dev' ) );
app.use( route.PUBLIC_CSS, lessMiddleware(join(publicDir, 'less'), {
    dest: join(publicDir, 'css'),
    prefix: 'css',
    force: true
}));
app.use( route.PUBLIC, express.static(publicDir) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );
app.use( cookieParser() );
app.use( route.API, api );
app.use( route.INDEX, index );

// catch 404 and forward to error handler
app.use( function( req, res, next ){
    var err = new Error( 'Not Found' );
    err.status = 404;
    next( err );
} );

// error handler
app.use( function( err, req, res, next ){
    res.status( err.status || 500 );
    res.render( 'error', {
        message: err.message,
        error: config.debug ? err : ''
    });
});


http.createServer( app ).listen( config.port, function( error ){
    if ( error )
        console.error( error );
    else
        console.log( 'Server listening on port %s', config.port );
});
