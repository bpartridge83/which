// which.io web

var app = function (app) {
	
	app.get('/status', function (req, res) {
		return res.send({
			status: 'running',
			environment: 'web'
		});
	});
	
	return app;
	
}

module.exports = app;