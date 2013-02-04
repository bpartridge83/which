// which.io web

var app = function (app, express, argv) {
	
	var perfTime = require('perf-time'),
		perftime = new perfTime(),
		_ = require('underscore'),
		winston = require('winston'),
		app = _.extend(app, { '_': _ }),
		iron_mq = require('iron_mq');
		
	winston.add(winston.transports.File, { filename: 'response.log' });
	
	app = _.extend(app, {
		conf: require('../common/configuration'),
		bcrypt: require('bcrypt-nodejs'),
		md5: require('MD5'),
		mq: new iron_mq.Client({
			token: 'fcylDPOXcdhAbDIGGhvLRcszcN0',
			project_id: '510f55658e7d141d5200001d'
		})
	});
		
	var cons = require('consolidate'),
		swig = require('swig'),
		mongo = require('mongoskin'),
		MongoStore = require('connect-mongo')(express),
		MemStore = express.session.MemoryStore;
		
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
			return res.redirect('/login');
		}
		
		next();
		
	}
	
	function csrf(req, res, next) {
		app.use(express.csrf());
		res.locals.token = req.session._csrf;
		next();
	}
		
	var routes = [];
	
	var path = {
		render: function (routes) {
			console.log('in path!');
		}
	}
	
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
		
		if (req.route !== 'undefined') {
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
	
	routes.push({
		name: 'awesomesauce',
		url: '/google/nice'
	});
	
	swig.init({
	    root: __dirname + '/../views',
	    allowErrors: true, // allows errors to be thrown and caught by express instead of suppressed by Swig,
		tags: require('../common/swig')
	});
	
	app.configure(function () {

		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));

		app.use(time_start);
		app.use(time_end);

		app.use(express.compress());

		app.use(express.bodyParser());
		app.use(express.cookieParser());

		app.use(express.session({
			secret: 'secret_key',
			store: new MongoStore({
				url: 'mongodb://' + app.conf.db.string + '/session',
			})
		}));
				
		app.engine('.html.twig', cons.swig);
		app.set('view engine', 'html.twig');
		app.set('views', __dirname + '/../views');
	    app.set("view options", { layout: false });

	});
	
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
			return res.redirect('/dashboard');
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
				return res.redirect('/login');
			}
			
			app.bcrypt.compare(req.body.password, user.get('password'), function(err, match) {
				
				if (match) {
					req.session.user = user.id;
					return res.redirect('/dashboard');
				}
				
				return res.redirect('/login');
				
			});
			
		});
		
	});
	
	app.get('/logout', function (req, res) {
		req.session.user = null;
		return res.redirect('/login');
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
			return res.redirect('/test/'+test.id);
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
			until: new Date
		};

		winston.query(options, function (err, results) {

			if (err) {
				throw err;
			}

			var count = 0,
				total = 0;

			app._.each(app._.pluck(results.file, 'time'), function (time) {
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

			app._.each(app._.pluck(results.file, 'time'), function (time) {
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

			app._.each(app._.pluck(results.file, 'time'), function (time) {
				total += time;
				count += 1;
			});

			res.send((Math.round((total / count) * 100) / 100) + '');
			
		});
		
	});
	
	return app;
	
}

module.exports = app;