var users = [];

casper.thenOpen('http://localhost:3000/which_dev/user?limit=1000', {
    headers: {
        'Content-Type': 'application/json'
    }
}, function () {
	this.getHTML();
});

casper.then(function () {
	this.test.comment('Cleaned Up Tests');
});

casper.run(function () {
	this.test.renderResults(true);
	this.test.done();
});

