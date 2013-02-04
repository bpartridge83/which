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
	
	var pjson = require('./package.json');
	
	return res.send({
		status: 'running',
		environment: app.get('site'),
		version: pjson.version
	});
	
});
	
var portscanner = require('portscanner');

portscanner.findAPortNotInUse(5000, 5020, 'localhost', function(error, _port) {

	var port = argv.port || process.env.PORT || _port;

	app.listen(port, function () {
		console.log('Listening on Port ' + port);
	});

});