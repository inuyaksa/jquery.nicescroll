//thanks to https://goede.site/transpile-and-minify-javascript-html-and-css-using-gulp-4

const gulp = require("gulp");
const browserify = require("browserify");	
const babelify = require("babelify");	
const source = require("vinyl-source-stream");	
const buffer = require("vinyl-buffer");	
const uglify = require("gulp-uglify");
const del = require("del");
	
const paths = {
  source: "src",
  build: "dist",
};
	
function buildMain() {
    return (	
        browserify({	
            entries: [`${paths.source}/jquery.nicescroll.js`],
            transform: [babelify.configure({ 
              presets: ["@babel/preset-env"],
              plugins: ['@babel/transform-runtime'],
            })]	
        })	
        .bundle()	
        .pipe(source("jquery.nicescroll.min.js"))	
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(`${paths.build}`))	
    );	
}

function buildUtils() {
    return (	
        browserify({	
            entries: [`${paths.source}/jquery.nicescroll.iframehelper.js`],
            transform: [babelify.configure({ 
              presets: ["@babel/preset-env"],
              plugins: ['@babel/transform-runtime'],
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
	
exports.build = gulp.series( cleanup, gulp.parallel(buildMain,buildUtils,cpICO) );
exports.clean = gulp.series( cleanup );