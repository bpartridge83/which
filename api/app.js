// which.io api

var app = function (app, express, argv) {
	
	var conf = require('../common/configuration'),
		bcrypt = require('bcrypt-nodejs'),
		mongo = require('mongoskin'),
		db = mongo.db(conf.db),
		model = require('../common/models')(db),
		repo = require('../common/repositories')(db, model);
	
	app.configure(function () {	
		app.use(express.compress());
		app.use(express.static(__dirname + '/../public'));
	});
	
	api.get('/user/create', function (req, res) {
	
		var time = new Date().getTime();
	
		var user = new model.User({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password),
			token: MD5(username + time)
		});
		
		user.save(function () {
			return res.send(user.toJSON());
		});
		
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