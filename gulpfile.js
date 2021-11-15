var gulp = require( 'gulp' ),
    beautify = require( 'gulp-beautify' ),
    rename = require( 'gulp-rename' ),
    uglify = require( 'gulp-uglify' ),

    source = ['peekaboo.js'],
    destination = './dist/';

gulp.task( 'js', ( done ) => {
    gulp.src( source )
        // https://github.com/beautify-web/js-beautify#options
        .pipe( beautify({
            end_with_newline: true,
            max_preserve_newlines: 2,
            space_in_paren: true
        } ) )
        .pipe( gulp.dest( destination ) );

    gulp.src( source )
        .pipe( rename({ suffix: '.min' } ) )
        .pipe( uglify({
            mangle: true,
            output: {
                comments: '@license'
            } } ) )
        .pipe( gulp.dest( destination ) );

    done();
} );

gulp.task( 'default', gulp.series( 'js', function () {
    gulp.watch( source, gulp.series( 'js' ) );
} ) );
