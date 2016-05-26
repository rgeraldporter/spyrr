import http     from 'http';
import util     from 'util';
import assert   from 'assert';

/**
 * @class Test
 * @classdesc Allows for testing of the request() method
 */
export class Test {

    /**
     * Initialize a new `Test` with the given `app`,
     * request `method` and `path`.
     *
     * @param {Function} action
     * @constructor
     */
    constructor( action ) {

        this.action         = action;
        this._asserts       = [];
        this.req            = {};
        this.res            = {};
    }

    /**
     * Set the params for a request
     * @param  {Object} params
     * @return {Test}
     */
    params( params ) {

        this.req.params = params;
        return this;
    }

    /**
     * Set the request query params 
     * @param  {Object} query
     * @return {Test}
     */
    query( query ) {

        this.req.query = query;
        return this;
    }

    /**
     * Set the body in the request
     * @param  {Object} body 
     * @return {Test}
     */
    body( body ) {

        this.req.body = body;
        return this;
    }

    /**
     * Set the headers in the request
     * @param  {*} headers
     * @return {Test}
     */
    headers( headers ) {

        this.req.headers = headers;
        return this;
    }

    /**
     * Set the files in the request
     * Note: In Express 4, req.files is no longer available on the req object by default. 
     *     To access uploaded files on the req.files object, use multipart-handling middleware 
     *     like busboy, multer, formidable, multiparty, connect-multiparty, or pez.
     * @param  {Object} files
     * @return {Test}
     */
    files( files ) {

        this.req.files = files;
        return this;
    }

    /**
     * Extend the request object further
     * @param  {*} data 
     * @return {Test}
     */
    extendReq( data ) {

        extend( this.req, data );
        return this;
    }

    /**
     * Extend the resource object further
     * @param  {*} data 
     * @return {Test}
     */
    extendRes( data ) {

        extend( this.res, data );
        return this;
    }

    /**
     * [next description]
     * @param  {Function} callback
     * @return {Test}
     */
    next( callback ) {

        this.nextFn = callback;
        return this;
    }

    /**
     * [errNext description]
     * @param  {Function} callback
     * @return {Test}
     */
    errNext( callback ) {

        this.errNextFn = callback;
        return this;
    }

    /**
     * Before Send
     * @param  {Function} transformer
     * @return {Test}
     */
    beforeSend( transformer ) {

        this.transformer = transformer;
        return this;
    }

    /**
     * Expectations:
     *
     *   .expect( 200 )
     *   .expect( 200, fn )
     *   .expect( 200, body )
     *   .expect( 'Some body' )
     *   .expect( 'Some body', fn )
     *   .expect( 'Content-Type', 'application/json' )
     *   .expect( 'Content-Type', 'application/json', fn )
     *   .expect( fn)
     *
     * @return {Test}
     * @api public
     */
    expect( a, b, c ) {

        // callback
        if ( typeof a === 'function' ) {

            this._asserts.push( a );
            return this;
        }

        if ( typeof b === 'function' ) {

            this.end( b );
        }

        if ( typeof c === 'function' ) {

            this.end( c );
        }

        // status
        if ( typeof a === 'number' ) {

            this._asserts.push( this._assertStatus.bind( this, a ) );

            // body
            if ( typeof b !== 'function' && arguments.length > 1 ) {

                this._asserts.push( this._assertBody.bind( this, b ) );
            }

            return this;
        }

        // header field
        if ( typeof b === 'string' || typeof b === 'number' || b instanceof RegExp ) {

            this._asserts.push( this._assertHeader.bind( this, { name: '' + a, value: b } ) );

            return this;
        }

        // body
        this._asserts.push( this._assertBody.bind( this, a ) );

        return this;
    }

    /**
     * Defers the action to the end of the chain
     *
     * @param {Function} fn
     * @api public
     */
    end( fn ) {

        let that    = this,
            end     = this.action
        ;

        if ( ! end ) { 

            throw new Error( 'No action defined' );
        }

        that.res.send   = send;
        that.res.json   = send;
        that.res.status = status;
        that.res.headers = headers;

        end( that.req, that.res ); 

        return that;

        function send( body ) {

            that.res.body = body;
            that.assert( null, that.res, fn );
        }

        function status( status ) {

            that.res.status         = status;
            that.res.statusCode     = status;

            return that.res;
        }

        function headers( headers ) {

            let lcHeaders = {};

            Object.keys( headers ).forEach( headerKey => {

                if ( typeof headers[ headerKey ] === 'string' ) {

                    lcHeaders[ headerKey.toLowerCase() ] = headers[ headerKey ].toLowerCase();
                }
                else {

                    lcHeaders[ headerKey.toLowerCase() ] = headers[ headerKey ];
                }
            });

            that.res.headers        = lcHeaders;

            return that.res;
        }
    }

    /**
     * Perform assertions and invoke `fn(err, res)`.
     *
     * @param {?Error} resError
     * @param {Response} res
     * @param {Function} fn
     * @api private
     */
    assert( resError, res, fn ) {

        let error;

        // asserts
        for ( let i = 0; i < this._asserts.length && ! error ; ++i ) {

            error = this._assertFunction( this._asserts[ i ], res );
        }

        // set unexpected superagent error if no other error has occurred.
        if ( ! error && resError instanceof Error && ( ! res || resError.status !== res.status ) ) {

            error = resError;
        }

        fn.call( this, error || null, res );
    }

    /**
     * Perform assertions on a response body and return an Error upon failure.
     *
     * @param {Mixed} body
     * @param {Response} res
     * @return {?Error}
     * @api private
     */
    _assertBody( body, res ) {

        const isregexp = body instanceof RegExp;
        let a, b;

        // parsed
        if ( typeof body === 'object' && ! isregexp ) {

            try {

                assert.deepEqual( body, res.body );
            }
            catch ( err ) {

                a = util.inspect( body );
                b = util.inspect( res.body );

                return error( 'expected ' + a + ' response body, got ' + b, body, res.body );
            }
        } 
        else {

            // string
            if ( body !== res.text ) {

                a = util.inspect( body );
                b = util.inspect( res.text );

                // regexp
                if ( isregexp ) {

                    if ( ! body.test( res.text ) ) {

                        return error( 'expected body ' + b + ' to match ' + body, body, res.body );
                    }
                } 
                else {

                    return error( 'expected ' + a + ' response body, got ' + b, body, res.body );
                }
            }
        }
    }

    /**
     * Perform assertions on a response header and return an Error upon failure.
     *
     * @param {Object} header
     * @param {Response} res
     * @return {?Error}
     * @api private
     */
    _assertHeader( header, res ) {

        const   field           = header.name,
                actual          = res.headers[ field.toLowerCase() ],
                fieldExpected   = header.value
        ;

        if ( typeof actual === 'undefined' ) {

            return new Error( 'expected "' + field + '" header field' );
        }

        // This check handles header values that may be a String or single element Array
        if ( ( actual instanceof Array && actual.toString() === fieldExpected) || fieldExpected === actual ) {

            return;
        }

        if ( fieldExpected instanceof RegExp ) {

            if ( ! fieldExpected.test( actual ) ) {

                return new Error( 'expected "' + field + '" matching ' + fieldExpected + ', got "' + actual + '"' );
            }
        } 
        else {

            return new Error( 'expected "' + field + '" of "' + fieldExpected + '", got "' + actual + '"' );
        }
    }

    /**
     * Perform assertions on the response status and return an Error upon failure.
     *
     * @param {Number} status
     * @param {Response} res
     * @return {?Error}
     * @api private
     */
    _assertStatus( status, res ) {

        if ( res.status !== status ) {

            let a, b;

            a = http.STATUS_CODES[ status ];
            b = http.STATUS_CODES[ res.status ];

            return new Error( 'expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"' );
        }
    }

    /**
     * Performs an assertion by calling a function and return an Error upon failure.
     *
     * @param {Function} fn
     * @param {Response} res
     * @return {?Error}
     * @api private
     */
    _assertFunction( check, res ) {

        let err;

        try {

            err = check( res );
        }
        catch ( e ) {

            err = e;
        }

        if ( err instanceof Error ) {

            return err;
        }
    }
}

/**
 * Return an `Error` with `msg` and results properties.
 *
 * @param {String} msg
 * @param {Mixed} expected
 * @param {Mixed} actual
 * @return {Error}
 * @api private
 */

function error( msg, expected, actual ) {

    let err = new Error( msg );

    err.expected      = expected;
    err.actual        = actual;
    err.showDiff      = true;

    return err;
}

/**
 * Extends an object
 * @param  {Object} target
 * @param  {*} data
 */
function extend( target, data ) {

    for( let i in data ) {

        target[ i ] = data[ i ];
    }
}