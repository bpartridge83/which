// which.io api

var app = function (app, express, argv, io) {
	
	var _ = require('underscore'),
		app = _.extend(app, { '_': _ }),
		mongo = require('mongoskin');
			
	app = _.extend(app, {
		conf: require('../common/configuration')(app),
		bcrypt: require('bcrypt-nodejs'),
		md5: require('MD5'),
		io: require('../common/io')(io, 'api')
	});
		
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
		app.use(express.static(__dirname + '/../public'));
		app.use(express.compress());
		app.use(express.bodyParser());
	});
	
	app.get('/test/create', function (req, res) {
		
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
	
	app.get('/socket/trigger', function (req, res) {
	
		app.io.emit('test', 'sending test from the API!');
		
		res.send('sent!');
		
	});
	
	setInterval(function () {		
		console.log(app.io.count());
	}, 1000);
	
	io.sockets.on('connection', function (socket) {
		
		socket.on('user', function(token) {
			app.io.addUser(token, socket);
		});
		
		socket.on('api', function (data) {
			console.log(data);
		});

	});
	
	return app;
	
}

module.exports = app;