var express = require('express'),
	app = express(),
	argv = require('optimist').argv,
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);
	
switch (true) {
	case argv.web:
		console.log('Launching Web Application');
		app.set('site', 'web');
		app = require('./web/app.js')(app, express, argv, io);
		var port_range = [5000, 5009];
		break;
	case argv.api:
	default:
		console.log('Launching API Application');
		app.set('site', 'api');
		app = require('./api/app.js')(app, express, argv, io);
		var port_range = [5010, 5019];
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

portscanner.findAPortNotInUse(port_range[0], port_range[1], 'localhost', function(error, _port) {

	var port = argv.port || process.env.PORT || _port;

	server.listen(port, function () {
		
		console.log('Listening on Port ' + port);
		
	});

});