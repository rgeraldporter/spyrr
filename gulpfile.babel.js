import del      from 'del';
import gulp     from 'gulp';
import jasmine  from 'gulp-jasmine';
import run      from 'run-sequence';
import shell    from 'gulp-shell';

const paths = {

    js:     [ './src/**/*.js' ],
    spec:   [ './src/**/*.spec.js' ],
    dist:   './app',
    src:    './src'
};

gulp.task( 'default', cb => {

    run( 'test', 'build', cb );
});

gulp.task( 'build', cb => {

    run( 'clean', 'babel', cb );
});

gulp.task( 'clean', cb => {

    return del( [ paths.dist ] );
});

gulp.task( 'babel', shell.task([

    'babel src --out-dir app'
]));

gulp.task( 'test', () => {

    gulp.src( paths.spec )
        .pipe( jasmine( { verbose: true } ) )
    ;
});
