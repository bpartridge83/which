// which.io api

var app = function (app, express, argv) {
	
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