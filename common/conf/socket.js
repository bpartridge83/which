module.exports = (function () {

	switch (process.env.NODE_ENV) {
		
		case 'development':
			this.js = 'http://localhost:5000';
			this.server = 'http://localhost:5010';
			break;
			
		default: 
			this.js = 'http://which.io';
			this.server = 'http://api.which.io';
			break;
		
	}
	
	return this;
	
})();