// which.io api

var app = function (app, express, argv) {
	
	var conf = require('../common/configuration'),
		bcrypt = require('bcrypt-nodejs'),
		mongo = require('mongoskin'),
		db = mongo.db(conf.db),
		md5 = require('MD5'),
		model = require('../common/models')(db),
		repo = require('../common/repositories')(db, model);
	
	app.configure(function () {	
		app.use(express.compress());
		app.use(express.bodyParser());
		app.use(express.static(__dirname + '/../public'));
	});
	
	app.get('/user/create', function (req, res) {
	
		var time = new Date().getTime();
	
		var user = new model.User({
			username: req.query.username,
			password: bcrypt.hashSync(req.query.password),
			token: md5(req.query.username + time)
		});
		
		console.log(req.query.username);
		console.log(req.query.password);
		
		user.save(function () {
			return res.send(user.toJSON());
		});
		
	});
	
	return app;
	
}

module.exports = app;