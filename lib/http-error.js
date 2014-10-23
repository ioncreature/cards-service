/**
 * @author Alexander Marenin
 * @date October 2014
 */

var assert = require( 'assert' );

var statusCodes = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    420: "Enhance Your Calm",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Unordered Collection",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    444: "No Response",
    449: "Retry With",
    450: "Blocked By Windows Parental Controls",
    499: "Client Closed Request",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",
    511: "Network Authentication Required"
};


function createError( code ){
    var fn = ErrorConstructor
            .toString()
            .replace( /ErrorConstructor/g, toCamelCase(statusCodes[code]) )
            .replace( '500', Number(code) )
            .replace( 'error', statusCodes[code] ),
        constructor = (new Function('return ' + fn))();

    constructor.prototype = Object.create( Error.prototype, {constructor: {value: constructor}} );
    return constructor;
}


function ErrorConstructor( message ){
    Error.apply( this, arguments );
    Error.captureStackTrace(this, ErrorConstructor);
    this.name = ErrorConstructor.name;
    this.status = 500;
    this.message = message || "error";
}


function toCamelCase( str ){
    return str
        .toLowerCase()
        .replace( /'/g, '' )
        .replace( /\-/g, ' ' )
        .replace( /(?:(^.)|(\s+.))/g, function( match ){
            return match.charAt( match.length - 1 ).toUpperCase();
        });
}


/*
 * Implicitly create all http errors constructors
 */
Object.keys( statusCodes ).forEach( function( code ){
    exports[toCamelCase(statusCodes[code])] = createError( code );
});


/*
 * Explicitly define most popular errors. This is for IDEs
 */


/**
 * @constructor
 * @extends Error
 */
exports.BadRequest = createError( 400 );

/**
 * @constructor
 * @extends Error
 */
exports.Unauthorized = createError( 401 );

/**
 * @constructor
 * @extends Error
 */
exports.PaymentRequired = createError( 402 );

/**
 * @constructor
 * @extends Error
 */
exports.Forbidden = createError( 403 );

/**
 * @constructor
 * @extends Error
 */
exports.NotFound = createError( 404 );

/**
 * @constructor
 * @extends Error
 */
exports.MethodNotAllowed = createError( 405 );

/**
 * @constructor
 * @extends Error
 */
exports.NotAcceptable = createError( 406 );

/**
 * @constructor
 * @extends Error
 */
exports.ProxyAuthenticationRequired = createError( 407 );

/**
 * @constructor
 * @extends Error
 */
exports.RequestTimeout = createError( 408 );

/**
 * @constructor
 * @extends Error
 */
exports.Conflict = createError( 409 );

/**
 * @constructor
 * @extends Error
 */
exports.InternalServerError = createError( 500 );

/**
 * @constructor
 * @extends Error
 */
exports.NotImplemented = createError( 501 );

/**
 * @constructor
 * @extends Error
 */
exports.BadGateway = createError( 502 );

/**
 * @constructor
 * @extends Error
 */
exports.ServiceUnavailable = createError( 503 );


(function(){
    assert( exports.NotFound instanceof Function, 'error constructor should be function' );
    var e = new exports.NotFound;
    assert( e instanceof Error, 'new object should be instance of error' );
    assert.equal( e.message, 'Not Found', 'new error should contain default error message' );
    assert( e.name, 'error object should contain error name' );
    assert( e.stack, 'error object should contain error stack' );
})();
