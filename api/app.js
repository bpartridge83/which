// which.io api

var app = function (app, express, argv) {
	
	app.configure(function () {	
		app.use(express.compress());
		app.use(express.static(__dirname + '/../public'));
	});
	
	app.get('/status', function (req, res) {
		return res.send({
			status: 'running',
			environment: 'api',
			version: '0.0.1-3'
		});
	});
	
	return app;
	
}

module.exports = app;