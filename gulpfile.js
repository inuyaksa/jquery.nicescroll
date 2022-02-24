//thanks to https://goede.site/transpile-and-minify-javascript-html-and-css-using-gulp-4
//https://github.com/gulp-community/gulp-header

const gulp = require("gulp");
const browserify = require("browserify");	
const babelify = require("babelify");	
var babel = require('gulp-babel');
const source = require("vinyl-source-stream");	
const buffer = require("vinyl-buffer");	
const uglify = require("gulp-uglify");
const header = require('gulp-header');
const rename = require('gulp-rename');
const del = require("del");
	
const pkg = require('./package.json');

const banner = [
  '/** <%= pkg.name %> - <%= pkg.version %> - <%= pkg.homepage %> - license <%= pkg.license %> **/',
  ''
].join('\n');

const paths = {
  source: "src",
  build: "dist",
};
	
function buildMain() {
    return (	
        // browserify({	
        //     entries: [`${paths.source}/jquery.nicescroll.js`],
        //     transform: [babelify.configure({ 
        //       presets: ["@babel/preset-env"],
        //       // plugins: ['@babel/transform-runtime'],
        //     })]	
        // })	
        // .bundle()	
        // .pipe(source("jquery.nicescroll.min.js"))	
        // .pipe(buffer())
        gulp.src([`${paths.source}/jquery.nicescroll.js`])
        .pipe(rename('jquery.nicescroll.min.js'))
        .pipe(uglify())
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest(`${paths.build}`))	
    );	
}

function buildDebug() {
    return (	
        gulp.src([`${paths.source}/jquery.nicescroll.js`],{ sourcemaps: true })
        .pipe(babel({presets: ["@babel/preset-env"]}) )
        .pipe(rename('jquery.nicescroll.min.js'))
        .pipe(uglify())
        .on('error', function(err) {
          gutil.log(gutil.colors.red('[Error]'), err.toString());
          this.emit('end');
        })
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest(`${paths.build}`, { sourcemaps: '.' }))	
    );	
}

function buildUtils() {
    return (	
        browserify({	
            entries: [`${paths.source}/jquery.nicescroll.iframehelper.js`],
            transform: [babelify.configure({ 
              presets: ["@babel/preset-env"],
              // plugins: ['@babel/transform-runtime'],
            })]	
        })	
        .bundle()	
        .pipe(source("jquery.nicescroll.iframehelper.min.js"))	
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(`${paths.build}`))	
    );	
}

function cpICO() {
  return ( 
    gulp
      .src([`${paths.source}/*.png`])
      .pipe(gulp.dest(`${paths.build}`))
  );
}
	
function cleanup() {
  return del(`${paths.build}/**`, {force:true});
}

exports.compile = gulp.series( buildDebug );
	
exports.build = gulp.series( cleanup, gulp.parallel(buildMain,buildUtils,cpICO) );
exports.clean = gulp.series( cleanup );