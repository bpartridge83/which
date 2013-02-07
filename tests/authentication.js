casper.start(url('/logout'), function () {
	this.test.assertEquals(this.getCurrentUrl(), url('/login'), '/logout Redirect to /login');
});

casper.thenOpen(url('/dashboard'), function () {
	this.test.assertEquals(this.getCurrentUrl(), url('/login'), 'Unauthenticated /dashboard Redirect to /login');
});

casper.thenOpen(url('/signup'), function () {
	this.fill('form', {
		'email': 'testing+' + time,
		'password': 'testing'
	}, true);
});

casper.then(function () {
	this.test.assertEquals(this.getCurrentUrl(), url('/dashboard'), 'Sign Up action redirects to /dashboard');
});

casper.thenOpen(url('/logout'), function () {
	this.test.comment('Logging Out of New Account')
});

casper.thenOpen(url('/login'), function () {
	this.fill('form', {
		'email': 'testing',
		'password': 'testing'
	}, true);
});

casper.then(function () {
	this.test.assertEquals(this.getCurrentUrl(), url('/dashboard'), 'Log In action redirects to /dashboard');
});

casper.run(function() {
	this.test.done();
});