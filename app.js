var express = require('express'),
	app = express(),
	argv = require('optimist').argv;
	
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
	
app.get('/status', function (req, res) {
	return res.send({
		status: 'running',
		environment: process.env.NODE_ENV
	});
});
	
var port = argv.port || process.env.PORT || 5000;

app.listen(port, function () {
	console.log('Listening on Port ' + port);
});