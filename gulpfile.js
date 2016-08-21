const gulp = require('gulp');

const eslint = require('gulp-eslint');
const wiredep = require('wiredep');
const plugins = require('gulp-load-plugins')();
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
    return gulp.src('nomanskycraft/static/js/*.js')
        .pipe(gulp.dest('build/public/js/'))
});

gulp.task('images', function() {
    return gulp.src('nomanskycraft/static/images/**')
        .pipe(gulp.dest('build/public/images/'))
});

gulp.task('css', function() {
    return gulp.src('nomanskycraft/static/css/*.css')
        .pipe(gulp.dest('build/public/css/'))
});

// Concatenate & Minify JS
// gulp.task('scripts', function() {
    // return gulp.src('js/*.js')
        // .pipe(concat('all.js'))
        // .pipe(gulp.dest('dist'))
        // .pipe(rename('all.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest('dist/js'));
// });

gulp.task('watch', function() {
    gulp.watch('nomanskycraft/static/css/*.css', ['css'])
    gulp.watch('nomanskycraft/static/js/*.js', ['scripts'])
    gulp.watch('nomanskycraft/templates/*.html', ['bower'])
});

gulp.task('vendor-scripts', function() {
  return gulp.src(wiredep().js)
    .pipe(gulp.dest('build/public/vendor'));
});

gulp.task('bower', ['vendor-scripts', 'scripts', 'css', 'images'], function () {
  gulp.src('nomanskycraft/templates/*.html')
    .pipe(wiredep.stream({
      fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              return '<script src="' + 'vendor/' + filePath.split('/').pop() + '"></script>';
            },
            css: function(filePath) {
              return '<link rel="stylesheet" href="' + 'vendor/' + filePath.split('/').pop() + '"/>';
            }
          }
        }
      }
    }))
    .pipe(plugins.inject(
      gulp.src(['nomanskycraft/static/css/*.css'], { read: false }), {
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<link rel="stylesheet" href="' + filePath.replace('nomanskycraft/static/', '') + '" type="text/css" media="screen" title="no title" charset="utf-8">';
        }
      }))
    .pipe(plugins.inject(
      gulp.src(['nomanskycraft/static/js/*.js'], { read: false }), {
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<script type="text/babel" src="' + filePath.replace('nomanskycraft/static/', '') + '"></script>';
        }
      }))
    .pipe(gulp.dest('build/templates'));
});

gulp.task('lint', () => {
    return gulp.src(['nomanskycraft/static/**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('default', ['bower', 'watch']);
