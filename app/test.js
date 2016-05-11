'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Test = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Test
 * @classdesc Allows for testing of the request() method
 */

var Test = function () {

    /**
     * Initialize a new `Test` with the given `app`,
     * request `method` and `path`.
     *
     * @param {Function} action
     * @constructor
     */

    function Test(action) {
        _classCallCheck(this, Test);

        this.action = action;
        this._asserts = [];
        this.req = {};
        this.res = {};
    }

    /**
     * Set the params for a request
     * @param  {Object} params
     * @return {Test}
     */


    _createClass(Test, [{
        key: 'params',
        value: function params(_params) {

            this.req.params = _params;
            return this;
        }

        /**
         * Set the request query params 
         * @param  {Object} query
         * @return {Test}
         */

    }, {
        key: 'query',
        value: function query(_query) {

            this.req.query = _query;
            return this;
        }

        /**
         * Set the body in the request
         * @param  {Object} body 
         * @return {Test}
         */

    }, {
        key: 'body',
        value: function body(_body) {

            this.req.body = _body;
            return this;
        }

        /**
         * Set the headers in the request
         * @param  {*} headers
         * @return {Test}
         */

    }, {
        key: 'headers',
        value: function headers(_headers) {

            this.req.headers = _headers;
            return this;
        }

        /**
         * Set the files in the request
         * @param  {Object} files
         * @return {Test}
         */

    }, {
        key: 'files',
        value: function files(_files) {

            this.req.files = _files;
            return this;
        }

        /**
         * [extendReq description]
         * @param  {*} data 
         * @return {Test}
         */

    }, {
        key: 'extendReq',
        value: function extendReq(data) {

            extend(this.req, data);
            return this;
        }

        /**
         * [extendRes description]
         * @param  {*} data 
         * @return {Test}
         */

    }, {
        key: 'extendRes',
        value: function extendRes(data) {

            extend(this.res, data);
            return this;
        }

        /**
         * [next description]
         * @param  {Function} callback
         * @return {Test}
         */

    }, {
        key: 'next',
        value: function next(callback) {

            this.nextFn = callback;
            return this;
        }

        /**
         * [errNext description]
         * @param  {Function} callback
         * @return {Test}
         */

    }, {
        key: 'errNext',
        value: function errNext(callback) {

            this.errNextFn = callback;
            return this;
        }

        /**
         * Before Send
         * @param  {Function} transformer
         * @return {Test}
         */

    }, {
        key: 'beforeSend',
        value: function beforeSend(transformer) {

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

    }, {
        key: 'expect',
        value: function expect(a, b, c) {

            // callback
            if (typeof a === 'function') {

                this._asserts.push(a);
                return this;
            }

            if (typeof b === 'function') {

                this.end(b);
            }

            if (typeof c === 'function') {

                this.end(c);
            }

            // status
            if (typeof a === 'number') {

                this._asserts.push(this._assertStatus.bind(this, a));

                // body
                if (typeof b !== 'function' && arguments.length > 1) {

                    this._asserts.push(this._assertBody.bind(this, b));
                }

                return this;
            }

            // header field
            if (typeof b === 'string' || typeof b === 'number' || b instanceof RegExp) {

                this._asserts.push(this._assertHeader.bind(this, { name: '' + a, value: b }));

                return this;
            }

            // body
            this._asserts.push(this._assertBody.bind(this, a));

            return this;
        }

        /**
         * Defer invoking superagent's `.end()` until
         * the server is listening.
         *
         * @param {Function} fn
         * @api public
         */

    }, {
        key: 'end',
        value: function end(fn) {

            var that = this,
                end = this.action;

            if (!end) {

                throw new Error('No action defined');
            }

            that.res.send = send;
            that.res.json = send;
            that.res.status = status;

            end(that.req, that.res);

            return that;

            function send(body) {

                that.res.body = body;
                that.assert(null, that.res, fn);
            }

            function status(status) {

                that.res.status = status;
                that.res.statusCode = status;

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

    }, {
        key: 'assert',
        value: function assert(resError, res, fn) {

            var error = void 0;

            // asserts
            for (var i = 0; i < this._asserts.length && !error; ++i) {

                error = this._assertFunction(this._asserts[i], res);
            }

            // set unexpected superagent error if no other error has occurred.
            if (!error && resError instanceof Error && (!res || resError.status !== res.status)) {

                error = resError;
            }

            fn.call(this, error || null, res);
        }

        /**
         * Perform assertions on a response body and return an Error upon failure.
         *
         * @param {Mixed} body
         * @param {Response} res
         * @return {?Error}
         * @api private
         */

    }, {
        key: '_assertBody',
        value: function _assertBody(body, res) {

            var isregexp = body instanceof RegExp;
            var a = void 0,
                b = void 0;

            // parsed
            if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' && !isregexp) {

                try {

                    _assert2.default.deepEqual(body, res.body);
                } catch (err) {

                    a = _util2.default.inspect(body);
                    b = _util2.default.inspect(res.body);

                    return error('expected ' + a + ' response body, got ' + b, body, res.body);
                }
            } else {

                // string
                if (body !== res.text) {

                    a = _util2.default.inspect(body);
                    b = _util2.default.inspect(res.text);

                    // regexp
                    if (isregexp) {

                        if (!body.test(res.text)) {

                            return error('expected body ' + b + ' to match ' + body, body, res.body);
                        }
                    } else {

                        return error('expected ' + a + ' response body, got ' + b, body, res.body);
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

    }, {
        key: '_assertHeader',
        value: function _assertHeader(header, res) {

            var field = header.name,
                actual = res.header[field.toLowerCase()],
                fieldExpected = header.value;

            if (typeof actual === 'undefined') {

                return new Error('expected "' + field + '" header field');
            }

            // This check handles header values that may be a String or single element Array
            if (actual instanceof Array && actual.toString() === fieldExpected || fieldExpected === actual) {

                return;
            }

            if (fieldExpected instanceof RegExp) {

                if (!fieldExpected.test(actual)) {

                    return new Error('expected "' + field + '" matching ' + fieldExpected + ', got "' + actual + '"');
                }
            } else {

                return new Error('expected "' + field + '" of "' + fieldExpected + '", got "' + actual + '"');
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

    }, {
        key: '_assertStatus',
        value: function _assertStatus(status, res) {

            if (res.status !== status) {

                var a = void 0,
                    b = void 0;

                a = _http2.default.STATUS_CODES[status];
                b = _http2.default.STATUS_CODES[res.status];

                return new Error('expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"');
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

    }, {
        key: '_assertFunction',
        value: function _assertFunction(check, res) {

            var err = void 0;

            try {

                err = check(res);
            } catch (e) {

                err = e;
            }

            if (err instanceof Error) {

                return err;
            }
        }
    }]);

    return Test;
}();

/**
 * Return an `Error` with `msg` and results properties.
 *
 * @param {String} msg
 * @param {Mixed} expected
 * @param {Mixed} actual
 * @return {Error}
 * @api private
 */

exports.Test = Test;
function error(msg, expected, actual) {

    var err = new Error(msg);

    err.expected = expected;
    err.actual = actual;
    err.showDiff = true;

    return err;
}