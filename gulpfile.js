var bower = require('gulp-bower'),
	coveralls = require('gulp-coveralls'),
	del = require('del'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	vui = require('vui-helpers');

gulp.task( 'clean', function( cb ) {
	del( [ 'collapsibleSection.css' ], cb );
} );

gulp.task( 'lib', function() {
	return bower('lib/');
} );

gulp.task( 'css', function () {
	return vui.makeCss(
		'collapsibleSection.css.less',
		'collapsibleSection.css',
		{ 'lintOpts' : '.csslintrc' }
	);
} );

gulp.task( 'jshint', function() {
	return gulp.src( ['gulpfile.js', 'collapsibleSection.js', 'test/*.js'] )
		.pipe( jshint() )
		.pipe( jshint.reporter('default') );
} );

gulp.task( 'coverage', function() {
	return gulp.src( 'test/output/coverage/**/lcov.info' )
		.pipe( coveralls() );
} );

gulp.task( 'test', [ 'lib' ], function () {
	return vui.test( {
		files: [
			'lib/jquery/jquery.min.js',
			'lib/jquery.ui/ui/jquery.ui.core.js',
			'lib/jquery.ui/ui/jquery.ui.widget.js',
			'collapsibleSection.js',
			'test/**/*Spec.js',
			'collapsibleSection.css'
		],
		preprocessors: {
			'collapsibleSection.js': ['coverage']
		}
	} ) ;
} );

gulp.task( 'default', [ 'clean' ], function() {
	gulp.start( 'css', 'jshint' );
} );
