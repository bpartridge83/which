var express = require('express'),
	app = express(),
	twig = require('twig'),
	argv = require('optimist').argv;

app.configure(function () {
	
	app.use(express.favicon(__dirname + '/public/favicon.ico', {maxAge: 86400000}));
    app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html.twig');
	app.engine('html.twig', twig.__express);
	app.set('twig options', {
		cache: false,
		auto_reload: true
	});
    // We don't need express to use a parent "page" layout
    // Twig.js has support for this using the {% extends parent %} tag
    app.set("view options", { layout: false });

});

app.get('/*', function(req, res, next) {
	if (req.headers.host.match(/^www/) !== null ) {
		return res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
	} else {
		return next();     
 	}
});

app.get('/', function(req, res) {
	
	res.render('index', {
		environment: app.env
	});
	
});

app.get('/block', function(req, res) {
	
	console.log('in blocking!');
	
	res.render('blocking', {
		environment: 'test'
	});
	
});

app.get('/email', function (req, res) {

	res.render('email');
	
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log('Listening on port 5000');
});