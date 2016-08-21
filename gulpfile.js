// Include gulp
var gulp = require('gulp');

const eslint = require('gulp-eslint');
// const wiredep = require('wiredep');
// var plugins = require('gulp-load-plugins')();
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');

// gulp.task('scripts', function() {
//     return gulp.src('static/js/*.js')
//         .pipe(gulp.dest('public/js/'))
// });

// gulp.task('css', function() {
//     return gulp.src('src/css/*.css')
//         .pipe(gulp.dest('public/css/'))
// });

// Concatenate & Minify JS
// gulp.task('scripts', function() {
    // return gulp.src('js/*.js')
        // .pipe(concat('all.js'))
        // .pipe(gulp.dest('dist'))
        // .pipe(rename('all.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest('dist/js'));
// });

// gulp.task('watch', function() {
//     gulp.watch('src/js/*.js', ['lint', 'scripts']);
// });

// gulp.task('vendor-scripts', function() {
//   return gulp.src(wiredep().js)
//     .pipe(gulp.dest('public/vendor'));
// });

// gulp.task('bower', ['vendor-scripts', 'scripts', 'css'], function () {
//   gulp.src('./src/html/*.html')
//     .pipe(wiredep.stream({
//       fileTypes: {
//         html: {
//           replace: {
//             js: function(filePath) {
//               return '<script src="' + 'vendor/' + filePath.split('/').pop() + '"></script>';
//             },
//             css: function(filePath) {
//               return '<link rel="stylesheet" href="' + 'vendor/' + filePath.split('/').pop() + '"/>';
//             }
//           }
//         }
//       }
//     }))
//     .pipe(plugins.inject(
//       gulp.src(['src/js/*.js'], { read: false }), {
//         addRootSlash: false,
//         transform: function(filePath, file, i, length) {
//           return '<script type="text/babel" src="' + filePath.replace('src/', '') + '"></script>';
//         }
//       }))
//     .pipe(gulp.dest('./public'));
// });

gulp.task('lint', () => {
    return gulp.src(['nomanskycraft/**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Default Task
gulp.task('default', ['lint']);
