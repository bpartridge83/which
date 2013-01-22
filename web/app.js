// which.io web

var app = function (app, express, argv) {
	
	var cons = require('consolidate'),
		swig = require('swig');
		
	var routes = [];
	
	var path = {
		render: function (routes) {
			console.log('in path!');
		}
	}
	
	routes.push({
		name: 'awesomesauce',
		url: '/google/nice'
	});
	
	swig.init({
	    root: __dirname + '/../views',
	    allowErrors: true, // allows errors to be thrown and caught by express instead of suppressed by Swig,
		tags: require('../common/swig'),
		extensions: {
			path: path
		}
	});
	
	app.configure(function () {

		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));
		app.use(express.bodyParser());
		
		app.engine('.html.twig', cons.swig);
		app.set('view engine', 'html.twig');
		app.set('views', __dirname + '/../views');
		
	    app.set("view options", { layout: false });

	});
	
	app.get('/', function (req, res) {	
		res.render('index');
	});
	
	app.get('/swig', function (req, res) {

		return res.render('swig', {
			name: {
				first: 'Brian',
				last: 'Partridge'
			}
		});
		
	});
	
	app.get('/status', function (req, res) {
		return res.send({
			status: 'running',
			environment: 'web'
		});
	});
	
	return app;
	
}

module.exports = app;