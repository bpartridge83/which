var express = require('express'),
	app = express(),
	argv = require('optimist').argv,
	conf = require('./common/configuration');

switch (true) {
	case argv.web:
		console.log('Launching Web Application');
		app.set('site', 'web');
		app = require('./web/app.js')(app, express, argv);
		break;
	case argv.api:
	default:
		console.log('Launching API Application');
		app.set('site', 'api');
		app = require('./api/app.js')(app, express, argv);
		break;
}
	
var port = argv.port || process.env.PORT || 5000;

app.get('/env', function (req, res) {
	console.log(conf);
	res.send(conf.env);
});

app.listen(port, function () {
	console.log('Listening on Port ' + port);
});