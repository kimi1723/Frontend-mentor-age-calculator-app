const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const ts = require('gulp-typescript');

const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/*/*/*',
	ts: './src/ts/**/*.ts',
	dist: './dist',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
};

const sassCompiler = done => {
	return src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(
			rename({
				suffix: '.min',
			}),
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));
	done();
};

const javaScript = done => {
	return src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			}),
		)
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min',
			}),
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));
	done();
};

const tsToJs = done => {
	return src(paths.ts)
		.pipe(sourcemaps.init())
		.pipe(
			ts({
				noImplicitAny: true,
				outFile: 'app.js',
				target: 'ES6',
			}),
		)
		.pipe(
			babel({
				presets: ['@babel/env'],
			}),
		)
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min',
			}),
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));
	done();
};

const convertImages = done => {
	return src(paths.img).pipe(imagemin()).pipe(dest(paths.imgDest));
	done();
};

const handleKits = done => {
	return src(paths.html).pipe(kit()).pipe(dest('./'));
	done();
};

const cleanStuff = done => {
	return src(paths.dist, { read: false }).pipe(clean());
	done();
};

const startBrowserSync = done => {
	browserSync.init({
		server: {
			baseDir: './',
		},
		browser: 'firefox',
		notify: false,
	});

	done();
};

const watchForChanges = done => {
	watch('./*.html').on('change', reload);
	watch([paths.html, paths.sass, paths.ts], parallel(handleKits, sassCompiler, tsToJs)).on('change', reload);
	watch(paths.img, convertImages).on('change', reload);
	done();
};

const mainFunctions = parallel(handleKits, sassCompiler, tsToJs, convertImages);

exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
