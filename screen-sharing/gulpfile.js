var gulp = require('gulp');
var watch = require('gulp-watch');
//var concat = require('gulp-concat');
var uglify = require('gulp-uglify');  
var pump = require('pump');
var rename = require('gulp-rename');  
//var filesize = require('gulp-filesize');  
//var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');
var debug = require('gulp-debug');
//var del = require('del');
var nodemon = require('gulp-nodemon');

var paths = {
  scripts: ['public/js/poker-ui.js', 'public/js/video-ui.js', 'public/js/screenshare-ui.js']
  //stylesheets: ['public/css/video.css', 'public/css/screenshare.css']
};

gulp.task('clean', function(cb) {
  //del(['build'], cb);
});

gulp.task('scripts', function() {
	return gulp.src(['public/js/ui/*'])
        .pipe(uglify())        
		.pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/js'));
});

gulp.task('scripts1', function (cb) {
  pump([
        gulp.src('public/js/ui/*.js'),
        uglify(),
        gulp.dest('public/js')
    ],
    cb
  );
});

/*
function() {
  return gulp.src(paths.scripts)
    .pipe(debug()) 
	//.pipe(concat('coffee.js'))
	.pipe(uglify()) 
	.pipe(rename(function(path) {
		path.dirname += '/public/js';
		path.basename += '.min';
		path.extname = '.js';
	}))
	.pipe(gulp.dest('public/js'))
});
/*
gulp.task('stylesheets', function() {
  return gulp.src(paths.stylesheets)
    .pipe(debug()) 
	//.pipe(concat('coffee.css'))
	.pipe(minifyCss({compatibility: 'ie11'}))
	//.pipe(rename('coffee.min.css'))
	//.pipe(gulp.dest('src/main/webapp/static/css'))
});
*/
/*
gulp.task('images', function() {
  return gulp.src(paths.images)
	.pipe(debug()) 
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('src/main/webapp/static/images2'));
});
*/

// Rerun the task when a file changes 
gulp.task('watch', function() {
	return watch('public/js/ui/*.js', function () {
		gulp.src('public/js/ui/*.js')
        .pipe(uglify())        
		.pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/js'));			
    });  
});

/*
gulp.task('combine-js', function () {
	return gulp.src([
		'src/main/webapp/static/js/common.js',
		'src/main/webapp/static/js/mailbox.js'
	])
	.pipe(debug()) 
	.pipe(concat('coffee.js'))
	.pipe(uglify()) 
	.pipe(rename('coffee.min.js'))
	.pipe(gulp.dest('src/main/webapp/static/js'))
	.pipe(filesize()) 
});
*/

gulp.task('start', function () {
  nodemon({
    script: 'app.js'
  , env: {}
  })
})

gulp.task('default', ['scripts', 'watch', 'start']);
//gulp.task('default', ['combine-js']);