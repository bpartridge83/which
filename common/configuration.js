module.exports = function (app) {
	
	this.env = (process.env.NODE_ENV == 'development') ? 'development' : 'production';

	this.db = require('./conf/db');
	this.winston = require('./conf/winston')(this.db);
	
	return this;
	
}


	
