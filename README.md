# SPY R/R

Spy on your inner controller processes, create and test actions against server request/response without spinning up a live instance, using the supertest API.should reject an invalid auth token
, function() {
    
}
# Usage

## Import

You can import either via CommonJS or ES6, depending on what you're using.

`var mockRequest = require( 'spyrr' );`

or 

`import mockRequest from 'spyrr';`

## Test a request/response, and spy on inner methods

```
describe( 'POST /endpoint', function() {

    var someTestObject = { test: true };

    beforeEach( function() {

        spyOn( controller.endpoint, 'checkAuthorization' ).and.callFake( function() => {

            return false;
        });
    });

    it( 'should reject requests with an invalid auth token', function( done ) {

        mockRequest( controller.endpoint )
            .params( { path: 'testpath', id: 'my-test' } )
            .query( { authToken: 'someInvalidToken' } )
            .body( { someObject: someTestObject } )
            .expect( 'Content-Type', /json/ )
            .expect( 401, {

                    error: true
                }, done 
            )
        ;
    });
});

```

# Build

**Note: there are no tests yet. These are forthcoming.**

You can build easily with `gulp`, which will test then build. To just test, run `gulp test`.

# Contribute

Please fork the project, then use a pull request to make improvements and fixes. This is very new so there is likely to be many unknown issues.

# Authors

Written by [Rob Porter](https://github.com/rgeraldporter).

Based on code from both [supertest](https://github.com/visionmedia/supertest) and [dupertest](https://github.com/TGOlson/dupertest). Thanks to [TJ Holowaychuk](https://github.com/tj) and [Tyler Olson](https://github.com/TGOlson) for these.

# License

MIT