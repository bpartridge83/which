// which.io api

var app = function (app) {
	
	app.get('/status', function (req, res) {
		return res.send({
			status: 'running',
			environment: 'api'
		});
	});
	
	return app;
	
}

module.exports = app;