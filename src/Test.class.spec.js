/**
 * Unit test for spyrr front loader
 */

import { Test } from './Test.class';
import should   from 'should';

describe( 'the Test class', () => {

    function mockControllerStatusSend( req, res ) {
        
        res.status( 200 ).headers( { 'Content-Type': 'application/json' } ).send({

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

    function mockControllerExtendReq( req, res ) {

        res.status( 200 ).headers( { 'Content-Type': 'application/json' } ).send({

            success:        true,
            test:           req.test
        });
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

    it( 'should pass query and body parameters chained together with headers', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .expect( 'Content-Type', /json/ )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should fail if headers are not correct using regular expression matching', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .expect( 'Content-Type', /sandwich/ )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should fail if headers are not correct using string matching', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .expect( 'Content-Type', 'application/javascript' )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBeTruthy();
            })
        ;
    });

    it( 'should pass if headers are correct using string matching, even if the case does not line up in the key', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .expect( 'conTenT-TyPe', 'application/json' )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should allow the extension of the response', () => {

        let myTest = new Test( mockControllerQueryBodyChain );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .extendRes( { test: 'test' } )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
                res.should.have.property( 'test' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should allow the extension of the request', () => {

        let myTest = new Test( mockControllerExtendReq );

        myTest.query( { queryTest: true } )
            .body( { bodyTest: true })
            .headers( { 'Content-Type': 'application/json' } )
            .extendReq( { test: 'test' } )
            .expect( 200 )
            .expect( res => {

                res.body.should.have.property( 'success' );
                res.body.should.have.property( 'test' );
                res.body.test.should.equal( 'test' );
            })
            .end( ( err, res ) => {

                expect( !! err ).toBe( false );
            })
        ;
    });

    it( 'should add the next callback as a paramter', () => {

        let myTest      = new Test( mockControllerExtendReq ),
            fn          = ( req, res ) => {}
        ;

        myTest.next( fn );

        expect( myTest.nextFn ).not.toBeUndefined();
    });

    it( 'should send next() as a parameter to the controller', () => {

        let myTest      = new Test( mockControllerExtendReq ),
            fn          = ( req, res ) => {}
        ;


        myTest.action = ( req, res, next ) => {

            expect( next ).not.toBeUndefined();
        };

        myTest.next( fn )
            .end();
    });

    it( 'should call next() with correct params', () => {

        let myTest      = new Test( mockControllerExtendReq );

        myTest.action = ( req, res, next ) => {

            next();
        };

        myTest.next( ( req, res ) => {

                expect( req ).not.toBeUndefined();
                expect( res ).not.toBeUndefined();
                expect( req ).toBe( myTest.req );
                expect( res ).toBe( myTest.res );
            })
            .end()
        ;
    });
});
