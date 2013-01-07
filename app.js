var express = require('express'),
	app = express(),
	twig = require('twig');

app.configure(function () {
	app.use(express.favicon(__dirname + '/public/favicon.ico', {maxAge: 86400000}));
    app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html.twig');
	app.engine('html.twig', twig.__express);
    // We don't need express to use a parent "page" layout
    // Twig.js has support for this using the {% extends parent %} tag
    app.set("view options", { layout: false });
});

app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null ) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();     
  }
});

app.get('/', function(req, res) {
  res.render('index', {
	message: 'testing 123'
  });
});

var port = process.env.PORT || 5000;
app.listen(port);