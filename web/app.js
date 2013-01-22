// which.io web

var app = function (app, express, argv) {
	
	var conf = require('../common/configuration'),
		cons = require('consolidate'),
		swig = require('swig'),
		mongo = require('mongoskin'),
		db = mongo.db(conf.db),
		model = require('../common/models')(db),
		repo = require('../common/repositories')(db, model);
		
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
		tags: require('../common/swig'),
		extensions: {
			path: path
		}
	});
	
	app.configure(function () {

		app.use(express.favicon(__dirname + '/../public/favicon.ico', {maxAge: 86400000}));
	    app.use(express.static(__dirname + '/../public'));
		app.use(express.bodyParser());
		
		app.engine('.html.twig', cons.swig);
		app.set('view engine', 'html.twig');
		app.set('views', __dirname + '/../views');
		
	    app.set("view options", { layout: false });

	});
	
	app.get('/', function (req, res) {	
		res.render('index');
	});
	
	app.get('/db', function (req, res) {
		
		//db.collection('user').drop(function () {
			
			var user = new model.User();

			user.set('firstName', 'Awesome');
			user.set('lastName', 'Partridge');

			user.save(function (data) {

				user.set('lastName', 'McNice');
				user.save(function (data) {

					repo.user.find({ 'firstName': 'Awesome' }, function (user) {

						user.set('address', '33 Rock Harbor Lane');

						user.save(function () {
							res.send(user.toJSON());
						});

					});

				});

			});
			
		//});
		
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