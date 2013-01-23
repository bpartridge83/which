// which.io web

var app = function (app, express, argv) {
	
	var conf = require('../common/configuration'),
		cons = require('consolidate'),
		swig = require('swig'),
		bcrypt = require('bcrypt-nodejs'),
		mongo = require('mongoskin'),
		db = mongo.db(conf.db),
		model = require('../common/models')(db),
		repo = require('../common/repositories')(db, model),
		MemStore = express.session.MemoryStore;
		
	var auth = function (req, res, next) {
		console.log('auth!');
		next();
	}
	
	function csrf(req, res, next) {
		res.locals.token = req.session._csrf;
		next();
	}
		
	var routes = [];
	
	var path = {
		render: function (routes) {
			console.log('in path!');
		}
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
	
	/*
	extensions: {
		path: path
	}
	
	*/
	
	app.configure(function () {

		app.use(express.compress());

		app.use(express.cookieParser());
		app.use(express.session({ secret: 'which.io' }));
		app.use(express.bodyParser());
		app.use(express.csrf());
		
		app.use(express.session({
			secret: 'secret_key',
			store: MemStore({
				reapInterval: 60000 * 10
			})
		}));
				
		app.engine('.html.twig', cons.swig);
		app.set('view engine', 'html.twig');
		app.set('views', __dirname + '/../views');
	    app.set("view options", { layout: false });
	
		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));

	});
	
	app.get('/', function (req, res) {	
		
		req.session.user = 12356;
		
		console.log(req.session.user);
		
		res.render('index');
	});
	
	app.get('/signup', csrf, function (req, res) {
		
		console.log(req.session.user);
		
		res.render('signup');
	});
		
	app.post('/signup', csrf, function (req, res) {
		
		var user = new model.User({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password)
		});
		
		user.save(function () {
			return res.redirect('/login');
		});
		
	});
	
	app.get('/login', csrf, function (req, res) {
		res.render('login');
	});
		
	app.post('/login', csrf, function (req, res) {
		
		var user = repo.user.findOne({ username: req.body.username }, function (user) {
			
			if (!user) {
				return res.redirect('/login');
			}
			
			bcrypt.compare(req.body.password, user.get('password'), function(err, match) {
			    
				if (match) {
					return res.redirect('/');
				} else {
					return res.redirect('/login');
				}
			
			});
			
		});
		
	});
	
	app.get('/swig', function (req, res) {

		return res.render('swig', {
			name: {
				first: 'Brian',
				last: 'Partridge'
			}
		});
		
	});

	return app;
	
}

module.exports = app;