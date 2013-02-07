// which.io web

var app = function (app, express, argv, io) {
	
	var perfTime = require('perf-time'),
		perftime = new perfTime(),
		_ = require('underscore'),
		app = _.extend(app, { '_': _ }),
		winston = require('winston'),
		winston_db = require('winston-mongodb').MongoDB,
		iron_mq = require('iron_mq');
	
	app = _.extend(app, {
		conf: require('../common/configuration')(app),
		bcrypt: require('bcrypt-nodejs'),
		md5: require('MD5'),
		mq: new iron_mq.Client({
			token: 'fcylDPOXcdhAbDIGGhvLRcszcN0',
			project_id: '510f55658e7d141d5200001d'
		}),
		io: require('../common/io')(io, 'web')
	});
	
	winston.add(winston.transports.MongoDB, app.conf.winston);
			
	var cons = require('consolidate'),
		swig = require('swig'),
		mongo = require('mongoskin'),
		MongoStore = require('connect-mongo')(express),
		MemStore = express.session.MemoryStore,
		url = require('../common/url')(app);
		
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
		
	var auth = function (req, res, next) {
		
		if (!req.session.user) {
			return res.redirect(url('/login'));
		}
		
		next();
		
	}
	
	function csrf(req, res, next) {
		res.locals.token = req.session._csrf;
		next();
	}
	
	/*
	var routes = [];
	
	var path = {
		render: function (routes) {
			console.log('in path!');
		}
	}
	*/
	
	function name (req, res, next) {
		console.log('something');
		next();
	}

	
	function time_start (req, res, next) {
		app = _.extend(app, {
			time_start: perftime.get()
		});
		next();
	}
	
	function time_end (req, res, next) {
		
		if (req.route !== 'undefined' && !app.get('testing')) {
			res.on('finish', function () {
				if (!res.get('ignore')) {
					var time_end = perftime.get();
					winston.info('response', {
						time: (time_end - app.time_start),
						path: req.route.path
					});
				}
			});
		}
		
		next();
		
	}
	
	/*
	routes.push({
		name: 'awesomesauce',
		url: '/google/nice'
	});
	*/
	
	swig.init({
	    root: __dirname + '/../views',
	    allowErrors: true, // allows errors to be thrown and caught by express instead of suppressed by Swig,
		tags: require('../common/swig')
	});
	
	app.configure(function () {

		app.use('/socket.io', express.static(__dirname + "/../node_modules/socket.io/lib"));
		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));

		app.use(time_start);
		app.use(time_end);

		app.use(express.compress());

		app.use(express.bodyParser());
		app.use(express.cookieParser());

		app.use(function(req, res, next){
			if (req.param('_test')) {
				app.conf.db.collection = 'which_dev_12345';
				app.set('testing', true);
			}
			next();
		});
		
		app.use(function(req, res, next) {
			res.locals.socket_js = app.conf.socket_io.js;
			res.locals.socket_server = app.conf.socket_io.server;
			next();
		});

		app.use(express.session({
			secret: 'secret_key',
			store: new MongoStore({
				url: 'mongodb://' + app.conf.db.string + '/session',
			})
		}));
		
		app.use(express.csrf());
				
		app.engine('.html.twig', cons.swig);
		app.set('view engine', 'html.twig');
		app.set('views', __dirname + '/../views');
	    app.set("view options", { layout: false });

	});
	
	/**
	 * ROUTES
	 */
	
	app.get('/', name, function (req, res) {	
		res.render('index');
	});

	app.get('/signup', csrf, function (req, res) {
		res.render('signup');
	});

	app.post('/signup', csrf, function (req, res) {

		var user = new app.model.User({
			email: req.body.email,
			password: app.bcrypt.hashSync(req.body.password)
		});

		console.log(user);

		user.save(function (model) {
			req.session.user = model.id;
			return res.redirect(url('/dashboard'));
		}, function () {

			return res.send('failed: user already exists!');
		});

	});

	app.get('/login', csrf, function (req, res) {
		res.render('login');
	});

	app.post('/login', csrf, function (req, res) {

		var user = app.repo.user.findOne({ email: req.body.email }, function (user) {

			if (!user) {
				return res.redirect(url('/login'));
			}

			app.bcrypt.compare(req.body.password, user.get('password'), function(err, match) {

				if (match) {
					req.session.user = user.id;
					return res.redirect(url('/dashboard'));
				}

				return res.redirect(url('/login'));

			});

		});

	});

	app.get('/logout', function (req, res) {
		req.session.user = null;
		return res.redirect(url('/login'));
	});

	app.get('/dashboard', auth, csrf, function (req, res) {
		res.render('dashboard');
	});

	app.get('/tests', function (req, res) {

		app.repo.test.find({ user: app.ObjectId('510b5da5b01145a61d000001') }, function (tests) {

			console.log(tests.length);

			res.send(tests);

		});

	});

	app.get('/test/create', function (req, res) {

		console.log('');
		console.log('');

		var test = new app.model.Test({
			slug: 'test-agent-'+Math.floor(Math.random() + 1001),
			useBest: 90,
			user: app.ObjectId('510b5da5b01145a61d000003'),
			options: [
				{
					slug: 'a',
					views: 0,
					success: 0,
					pScore: null
				},
				{
					slug: 'b',
					views: 0,
					success: 0,
					pScore: null
				},
				{
					slug: 'c',
					views: 0,
					success: 0,
					pScore: null
				}
			]
		});

		test.save(function (test) {
			return res.redirect(url('/test/'+test.id));
		}, function () {
			return res.send('error...');
		});

	});

	app.get('/test/:id', function (req, res) {

		app.repo.test.findOne({ '_id': app.ObjectId(req.params.id) }, function (test) {

			res.render('test', {
				test: test.toJSON()
			});

		});

	});

	app.get('/test/:id/choose', function (req, res) {

		app.repo.test.findOne({ '_id': app.ObjectId(req.params.id) }, function (test) {

			res.send(test.choose());

		});

	});

	app.get('/option/:id/reward/:reward', function (req, res) {

		app.repo.option.findOne({ '_id': app.ObjectId(req.params.id) }, function (option) {

			option.set('reward', req.params.reward);
			option.save(function () {

				app.repo.option.findOne({ '_id': option.get('test') }, function (test) {

					app.db.collection('test').update({
						'_id': option.get('test')
					}, {
						$inc: { 'options.$.success' : 1 },
						$set: { 'options.$.pScore' : option.pScore(test) }
					}, {}, function (test) {

						res.send('updated option and test');

					})

				});

			});

		});

	});

	app.get('/ironmq/get', function (req, res) {

		app.mq.queue('options').get({}, function (error, body) {

			console.log(body);

			if (body && body.body !== '') {

				try {
					// handle JSON option here
					console.log(JSON.parse(body.body))
				} catch (e) {
					console.log('error in parsing body!');
				}

				app.mq.queue('options').del(body.id, function (error, body) {

					console.log(body);
					res.send('awesome, deleted message');

				});

			} else {

				res.send('no message found');

			}

		});

	});

	app.get('/ironmq/post', function (req, res) {

		var obj = {
			'testing-json': 5
		};

		app.mq.queue('options').post(JSON.stringify(obj), function (error, body) {

			console.log(body);
			res.send('awesome.');

		});

	});

	app.post('/_mq/option', function (req, res) {

		app.mq.queue('options').get({}, function (error, body) {

			console.log('handle message here!');
			console.log(body);
			console.log('finished handling message, time to delete.');

			app.mq.queue('options').del(req.get('iron-message-id'), function (error, body) {

				console.log('deleted!');
				res.send('deleted!');

			});

		});

	});

	app.get('/users', function (req, res) {

		app.repo.user.findAll(function (users) {
			res.send(users);
		});

	});

	app.get('/response', function (req, res) {

		res.set('ignore', true);

		var options = {
			from: new Date - 24 * 60 * 60 * 1000,
			until: new Date,
			limit: 1000000
		};

		winston.query(options, function (err, results) {

			if (err) {
				throw err;
			}

			console.log(results.mongodb.length);

			var count = 0,
				total = 0;

			app._.each(app._.pluck(results.mongodb, 'time'), function (time) {
				total += time;
				count += 1;
			});

			res.send((Math.round((total / count) * 100) / 100) + '');

		});

	});

	app.get('/response/hour', function (req, res) {

		res.set('ignore', true);

		var options = {
			from: new Date - 60 * 60 * 1000,
			until: new Date
		};

		winston.query(options, function (err, results) {

			if (err) {
				throw err;
			}

			var count = 0,
				total = 0;

			app._.each(app._.pluck(results.mongodb, 'time'), function (time) {
				total += time;
				count += 1;
			});

			res.send((Math.round((total / count) * 100) / 100) + '');

		});

	});

	app.get('/response/minute', function (req, res) {

		res.set('ignore', true);

		var options = {
			from: new Date - 60 * 1000,
			until: new Date
		};

		winston.query(options, function (err, results) {

			if (err) {
				throw err;
			}

			var count = 0,
				total = 0;

			app._.each(app._.pluck(results.mongodb, 'time'), function (time) {
				total += time;
				count += 1;
			});

			res.send((Math.round((total / count) * 100) / 100) + '');

		});

	});
		
	app.get('/response/route', function (req, res) {
	
		res.set('ignore', true);

		var options = {
			from: new Date - 30 * 24 * 60 * 60 * 1000,
			until: new Date,
			limit: 1000000
		};

		winston.query(options, function (err, results) {

			if (err) {
				throw err;
			}

			var tmp_routes = app._.uniq(app._.pluck(results.mongodb, 'path'));
			
			var _routes = {};
			
			app._.each(tmp_routes, function (route) {
			
				console.log(route);
			
				_routes[route] = {
					count: 0,
					total: 0
				}
				
			});
			
			app._.each(results.mongodb, function (result) {
				_routes[result.path].total += result.time;
				_routes[result.path].count += 1;
			});
			
			app._.each(app._.keys(_routes), function (path) {
				console.log(path);
				_routes[path].avg = _routes[path].total / _routes[path].count;
			});

			res.send(_routes);

		});
		
	});
	
	app.get('/exec', function (res, res) {
	
		var exec = require('exec');
	
		// open -a /Applications/Google\ Chrome.app/ http://twilio.com
	
		exec(['open', '-a', '/Applications/Google\ Chrome.app/', 'http://twilio.com'], function(err, out, code) {
			if (err) throw err;
		});
		
		res.send('nice');
		
	});
	
	/*
	setInterval(function () {
		
		console.log(app.io.count());
		
		app.io.emit('test', 'sending test signal to all users!');
		app.io.emit('d0W4K4VSclJVjI0FjitrYilq', 'test', 'sending just to the Chrome user');
		app.io.emit('/41x3v3C8gXh+FwSuSWwsIZW', 'test', 'sending just to the Firefox user');
		
	}, 20000);
	*/
	
	app.get('/socket/test', csrf, function (req, res) {
		
		console.log('APP SOCKET SETTINGS!');
		console.log(app.conf.socket_io.server);
		
		console.log(res.locals);
		
		res.render('socket');
		
	});
	
	/*
	
	io.sockets.on('connection', function (socket) {
		
		console.log('');
		console.log('');
		console.log('');
		console.log('reconnection here?');
		console.log('');
		console.log('');
		console.log('');
		
		socket.on('user', function(token) {
			console.log('trying to add user here...');
			console.log(token);
			app.io.addUser(token, socket);
		});
		
		socket.on('web', function (data) {
			console.log(data);
		});
		
		socket.on('disconnect', function(data){
			app.io.removeSocket(socket.id);
		});

	});
	
	*/
		
	return app;
	
}

module.exports = app;