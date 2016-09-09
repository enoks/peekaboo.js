var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),

    source = ['src/**/*.js'],
    destination = './build/';

gulp.task('js', function () {
    gulp.src(source)
        .pipe(gulp.dest(destination));

    gulp.src(source)
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({preserveComments: 'license'}))
        .pipe(gulp.dest(destination));
});

gulp.task('default', function () {
    gulp.watch(source, ['js']);
});
