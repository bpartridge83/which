// which.io api

var app = function (app, express, argv) {
	
	var _ = require('underscore'),
		app = _.extend(app, { '_': _ });
	
	app = _.extend(app, {
		conf: require('../common/configuration')(app),
		bcrypt: require('bcrypt-nodejs'),
		md5: require('MD5')
	});
		
	var cons = require('consolidate'),
		swig = require('swig'),
		mongo = require('mongoskin'),
		MemStore = express.session.MemoryStore;
		
	app = _.extend(app, {
		db: mongo.db(app.conf.db)
	});
	
	app = _.extend(app, {
		model: require('../common/models')(app)
	});

	app = _.extend(app, {
		repo: require('../common/repositories')(app)
	});
		
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