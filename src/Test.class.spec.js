/**
 * Unit test for spyrr front loader
 */

import { Test } from './Test.class';
import should   from 'should';

describe( 'the Test class', () => {

    function mockController( req, res ) {
        
        res.status( 200 ).send({

            success:        true
        });
    }

    it( 'should handle response status if it is not matching', () => {

        let myTest = new Test( mockController );

        myTest.expect( 201 )
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should handle response status if it is matching', () => {

        let myTest = new Test( mockController );

        myTest.expect( 200 )
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should handle a JSON response sent to the client with the correct properties', () => {

        let myTest = new Test( mockController );

        myTest.expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should handle a JSON response sent to the client without the correct properties', () => {

        let myTest = new Test( mockController );

        myTest.expect( res => {

                res.body.should.have.property( 'failure' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });
});
