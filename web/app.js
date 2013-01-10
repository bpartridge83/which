// which.io web

var app = function (app, express, argv) {
	
	var twig = require('twig');
	
	app.configure(function () {

		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));
		app.use(express.bodyParser());
	    app.set('views', __dirname + '/../views');
	    app.set('view engine', 'html.twig');
		app.engine('html.twig', twig.__express);
		app.set('twig options', {
			cache: false,
			auto_reload: true
		});
	    app.set("view options", { layout: false });

	});
	
	app.get('/', function (req, res) {	
		res.render('index');
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