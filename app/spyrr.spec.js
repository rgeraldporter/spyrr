'use strict';

var _spyrr = require('./spyrr');

var _spyrr2 = _interopRequireDefault(_spyrr);

var _Test = require('./Test.class');

var _Test2 = _interopRequireDefault(_Test);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('the module', function () {

    var mockController = function mockController(req, res) {/*noop*/},
        mockTest = (0, _spyrr2.default)(mockController);

    it('should load the Test class instance', function () {

        mockTest.should.have.property('res');
        mockTest.should.have.property('req');
    });
}); /**
     * Unit test for spyrr front loader
     */