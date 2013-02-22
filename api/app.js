// which.io api

var app = function (app, express, argv, io) {
	
	var _ = require('underscore'),
		app = _.extend(app, { '_': _ }),
		mongo = require('mongoskin'),
		perfTime = require('perf-time'),
		perftime = new perfTime();
			
	app = _.extend(app, {
		conf: require('../common/configuration')(app),
		bcrypt: require('bcrypt-nodejs'),
		md5: require('MD5'),
		io: require('../common/io')(io, 'api'),
		random: require('randy').randInt,
		Deferred: require('Deferred'),
		Async: require('async')
	});
		
	app = _.extend(app, {
		db: mongo.db(app.conf.db.string)
	});
	
	app = _.extend(app, {
		model: require('../common/models')(app)
	});

	app = _.extend(app, {
		repo: require('../common/repositories')(app),
		ObjectId: app.db.ObjectID.createFromHexString,
	});
		
	var allowCrossDomain = function(req, res, next) {

		if (req.headers['referer']) {

			var splitted = req.headers['referer'].split('/'),
				referer = splitted[0] + '//' + splitted[2];

			res.header('Access-Control-Allow-Origin', referer);
			res.header('Access-Control-Allow-Credentials', true);
			res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Session, X-Requested-With');

		}

		if ('OPTIONS' == req.method) {
			res.send(200);
		} else {
			next();
		}

	};
		
	app.configure(function () {
		app.use(express.static(__dirname + '/../public'));
		app.use(allowCrossDomain);
		app.use(express.compress());
		app.use(express.bodyParser());
	});
	
	app.get('/test/:slug/choose', function (req, res) {
				
		app.repo.test.findOne({
			slug: req.params.slug
		})
		.then(function (test) {
			
			test.choose().then(function (option) {
				return res.send(option);
			});
			
		});
				
	});
	
	app.post('/test/:slug/reward', function (req, res) {
	
		app.repo.option.findOne({
			_id: req.body._id
		}).then(function (option) {
			
			app.repo.test.findOne({
				_id: option.get('test')
			}).then(function (test) {
				test.updateOption(option, req.body.reward).then(function (_option) {
					return res.send('yay!');
				});
			});
			
		});
		
	});
	
	app.get('/socket/trigger', function (req, res) {
	
		app.io.emit('test', 'sending test from the API!');
		
		res.send('sent!');
		
	});
	
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