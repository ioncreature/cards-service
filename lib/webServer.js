/**
 * @author Alexander Marenin
 * @date July 2014
 */

var http = require( 'http' ),
    express = require( 'express' ),
    join = require( 'path' ).join,
    favicon = require( 'serve-favicon' ),
    httpError = require( './http-error' ),
    logger = require( 'morgan' ),
    bodyParser = require( 'body-parser' ),
    session = require( 'express-session' ),
    multer = require( 'multer' ),
    lessMiddleware = require( 'less-middleware' ),
    registry = require( './registry' ),
    app = express(),
    util = require( './util' ),
    config = registry.get( 'config' ),
    role = require( 'connect-acl' )( config.acl ),
    route = config.route;

registry.set( 'role', role );
registry.set( 'app', app );
var index = require( '../routes/index' ),
    api = require( '../routes/api' );

app.set( 'views', join(__dirname, '..', 'views') );
app.set( 'view engine', 'jade' );
config.debug
    ? app.disable( 'view cache' )
    : app.enable( 'view cache' );
app.disable( 'x-powered-by' );
config.debug && app.set( 'json spaces', '    ' );

app.locals.route = config.route;
app.locals.title = config.title;
app.locals.formatUrl = util.formatUrl;

var publicDir = join( __dirname, '..', 'public' );
app.use( favicon(join(publicDir, 'favicon.ico')) );
if ( !config.quiet )
    app.use( config.debug ? logger('dev') : logger() );
config.debug && app.use( route.PUBLIC_CSS, lessMiddleware(join(publicDir, 'less'), {
    dest: join(publicDir, 'css'),
    prefix: 'css',
    force: false
}));
app.use( route.PUBLIC, express.static(publicDir) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );
app.use( session({
    name: 'SID',
    cookie: {maxAge: config.cookieTtl},
    secret: 'cards service secret phrase',
    resave: true,
    saveUninitialized: true
}));

app.use( role.middleware() );
role.onAuthorizedFailure( function( req, res ){
    res.redirect( route.LOGIN );
});
role.onUnauthorizedFailure( function( req, res ){
    res.redirect( route.INDEX );
});

app.use( multer({dest: config.uploadsDir}) );
app.use( route.API_PREFIX, api );
app.use( route.INDEX, index );

app.use( function( req, res, next ){
    next( new httpError.NotFound );
});

app.use( function( err, req, res, next ){
    res.status( err.status || 500 );
    res.render( 'page/error', {
        pageName: 'error',
        pageTitle: 'Error occurred',
        message: err.message,
        error: config.debug ? err : ''
    });
});

module.exports = function( callback ){
    http.createServer( app ).listen( config.port, callback );
};