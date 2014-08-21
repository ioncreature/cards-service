/**
 * @author Alexander Marenin
 * @date August 2014
 */

var gulp = require( 'gulp' ),
    less = require( 'gulp-less' );

gulp.task( 'default', function(){
    gulp
        .src( './public/less/all.less' )
        .pipe( less() )
        .pipe( gulp.dest('./public/css') )
});