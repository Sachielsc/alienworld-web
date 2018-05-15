var gulp = require('gulp');
// (sass feature removed in version 3.0)
// var sass = require('gulp-sass');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');



//Process sass to css (feature removed in version 3.0)
// gulp.task('sass', function () {
//     return gulp.src('public/assets/scss/**/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('public/assets/css'))
// });

//Move all html views files to dist folder
gulp.task('views', function() {
	return gulp.src(['public/app/**/*.html'])
		.pipe(gulp.dest('dist/app'))
});

// Css and JS optmization
gulp.task('useref', function() {
	return gulp.src(['public/index.html'])
	    .pipe(useref())
	    .pipe(gulpIf('*.js', uglify()))
	    .pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'))
});

// Image optmization
gulp.task('images', function() {
	return gulp.src('public/assets/images/**/*')
	    .pipe(imagemin({
	    	interlaced: true
	    }))
	    .pipe(gulp.dest('dist/assets/images'));
});

//Fonts
gulp.task('fonts', function() {
	return gulp.src(['public/assets/lib/fonts/**'])
		.pipe(gulp.dest('dist/assets/fonts'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

// (feature removed in version 3.0)
// gulp.task('build', function (callback){
//   runSequence(['clean:dist','sass', 'useref', 'views','images','fonts'],
//     callback
//   )
// });

gulp.task('build', function (callback){
    runSequence(['clean:dist', 'useref', 'views','images','fonts'],
        callback
    )
});
