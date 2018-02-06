var gulp = require('gulp'),
    beautify = require('gulp-beautify'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),

    source = ['src/**/*.js'],
    destination = './build/';

gulp.task('js', function () {
    gulp.src(source)
        // https://github.com/beautify-web/js-beautify#options
        .pipe(beautify({
            end_with_newline: true,
            max_preserve_newlines: 2,
            space_in_paren: true
        }))
        .pipe(gulp.dest(destination));

    gulp.src(source)
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({preserveComments: 'license'}))
        .pipe(gulp.dest(destination));
});

gulp.task('default', ['js'], function () {
    gulp.watch(source, ['js']);
});
