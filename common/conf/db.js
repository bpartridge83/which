module.exports = (function () {

	switch (process.env.NODE_ENV) {
		
		case 'development':
			
			this.port = 27017;
			this.database = 'which_dev';
			this.host = 'localhost';
			this.username = null;
			this.password = null;
			
			break;
			
		default: 
			
			this.port = 43927;
			this.database = 'nodejitsu_which_nodejitsudb9237950302';
			this.host = 'ds043927.mongolab.com';
			this.username = 'nodejitsu_which';
			this.password = 'hrm4632serm93k5n59ag987scs';
			
			break;
		
	}
	
	var string = '';
	
	if (this.username && this.password) {
		string += this.username + ':' + this.password + '@';
	}
	
	string += this.host;
	
	if (this.port) {
		string += ':' + this.port;
	}
	
	if (this.database) {
		string += '/' + this.database;
	}
	
	return string;
	
})();