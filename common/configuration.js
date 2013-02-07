module.exports = function (app) {
	
	this.env = (process.env.NODE_ENV == 'development') ? 'development' : 'production';

	this.db = require('./conf/db');
	this.socket_io = require('./conf/socket');
	this.winston = require('./conf/winston')(this.db);
	
	return this;
	
}