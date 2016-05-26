'use strict';

var _Test = require('./Test.class');

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Unit test for spyrr front loader
 */

describe('the Test class', function () {

    function mockControllerStatusSend(req, res) {

        res.status(200).headers({ 'Content-Type': 'application/json' }).send({

            success: true
        });
    }

    function mockControllerStatusError(req, res) {

        res.status(500);
    }

    function mockControllerQuery(req, res) {

        if (req.query.test) {

            mockControllerStatusSend(req, res);
        } else {

            mockControllerStatusError(req, res);
        }
    }

    function mockControllerQueryBodyChain(req, res) {

        if (req.query.queryTest && req.body.bodyTest) {

            mockControllerStatusSend(req, res);
        } else {

            mockControllerStatusError(req, res);
        }
    }

    it('should handle response status if it is not matching', function () {

        var myTest = new _Test.Test(mockControllerStatusSend);

        myTest.expect(201).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });

    it('should handle response status if it is matching', function () {

        var myTest = new _Test.Test(mockControllerStatusSend);

        myTest.expect(200).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should handle a JSON response sent to the client with the correct properties', function () {

        var myTest = new _Test.Test(mockControllerStatusSend);

        myTest.expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should handle a JSON response sent to the client without the correct properties', function () {

        var myTest = new _Test.Test(mockControllerStatusSend);

        myTest.expect(function (res) {

            res.body.should.have.property('failure');
        }).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });

    it('should pass query parameters along correctly, and handle chained expect calls', function () {

        var myTest = new _Test.Test(mockControllerQuery);

        myTest.query({ test: true }).expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should pass query parameters along correctly, and handle chained expect calls with failures when appropriate', function () {

        var myTest = new _Test.Test(mockControllerQuery);

        myTest.query({ test: true }).expect(400).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            // we expect a thrown error here...
            expect(!!err).toBeTruthy();
        });
    });

    it('should pass query and body parameters chained together', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should pass query and body parameters chained together with headers', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).headers({ 'Content-Type': 'application/json' }).expect('Content-Type', /json/).expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should fail if headers are not correct using regular expression matching', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).headers({ 'Content-Type': 'application/json' }).expect('Content-Type', /sandwich/).expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });

    it('should fail if headers are not correct using string matching', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).headers({ 'Content-Type': 'application/json' }).expect('Content-Type', 'application/javascript').expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });

    it('should pass if headers are correct using string matching, even if the case does not line up in the key', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).headers({ 'Content-Type': 'application/json' }).expect('conTenT-TyPe', 'application/json').expect(200).expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should allow the extension of the response', function () {

        var myTest = new _Test.Test(mockControllerQueryBodyChain);

        myTest.query({ queryTest: true }).body({ bodyTest: true }).headers({ 'Content-Type': 'application/json' }).extendRes({ test: 'test' }).expect(200).expect(function (res) {

            res.body.should.have.property('success');
            res.should.have.property('test');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });
});