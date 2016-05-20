/**
 * Unit test for spyrr front loader
 */

import spyrr    from './spyrr';
import Test     from './Test.class';
import should   from 'should';

describe( 'the module', () => {

    let mockController  = ( req, res ) => { /*noop*/ },
        mockTest        = spyrr( mockController )
    ;

    it( 'should load the Test class instance', () => {

        mockTest.should.have.property( 'res' );
        mockTest.should.have.property( 'req' );
    });
});