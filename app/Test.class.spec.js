'use strict';

var _Test = require('./Test.class');

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Unit test for spyrr front loader
 */

describe('the Test class', function () {

    function mockController(req, res) {

        res.status(200).send({

            success: true
        });
    }

    it('should handle response status if it is not matching', function () {

        var myTest = new _Test.Test(mockController);

        myTest.expect(201).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });

    it('should handle response status if it is matching', function () {

        var myTest = new _Test.Test(mockController);

        myTest.expect(200).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should handle a JSON response sent to the client with the correct properties', function () {

        var myTest = new _Test.Test(mockController);

        myTest.expect(function (res) {

            res.body.should.have.property('success');
        }).end(function (err, res) {

            expect(!!err).toBe(false);
        });
    });

    it('should handle a JSON response sent to the client without the correct properties', function () {

        var myTest = new _Test.Test(mockController);

        myTest.expect(function (res) {

            res.body.should.have.property('failure');
        }).end(function (err, res) {

            expect(!!err).toBeTruthy();
        });
    });
});