/**
 * Unit test for spyrr front loader
 */

import { Test } from './Test.class';
import should   from 'should';

describe( 'the Test class', () => {

    function mockControllerStatusSend( req, res ) {
        
        res.status( 200 ).send({

            success:        true
        });
    }

    function mockControllerStatusError( req, res ) {

        res.status( 500 );
    }

    function mockControllerQuery( req, res ) {

        if ( req.query.test ) {

            mockControllerStatusSend( req, res );
        }
        else {

            mockControllerStatusError( req, res );
        }
    }

    function mockControllerQueryBodyChain( req, res ) {

        if ( req.query.queryTest && req.body.bodyTest ) {

            mockControllerStatusSend( req, res );
        }
        else {

            mockControllerStatusError( req, res );
        }
    }

    it( 'should handle response status if it is not matching', () => {

        let myTest = new Test( mockControllerStatusSend );

        myTest.expect( 201 )
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should handle response status if it is matching', () => {

        let myTest = new Test( mockControllerStatusSend );

        myTest.expect( 200 )
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should handle a JSON response sent to the client with the correct properties', () => {

        let myTest = new Test( mockControllerStatusSend );

        myTest.expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should handle a JSON response sent to the client without the correct properties', () => {

        let myTest = new Test( mockControllerStatusSend );

        myTest.expect( res => {

                res.body.should.have.property( 'failure' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should pass query parameters along correctly, and handle chained expect calls', () => {

        let myTest = new Test( mockControllerQuery );

        myTest.query( { test: true } )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should pass query parameters along correctly, and handle chained expect calls with failures when appropriate', () => {

        let myTest = new Test( mockControllerQuery );

        myTest.query( { test: true } )
            .expect( 400 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                // we expect a thrown error here...
                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should pass query and body parameters chained together', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });
});
