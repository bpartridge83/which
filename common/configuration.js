var conf = {};

conf.env = (process.env.NODE_ENV == 'development') ? 'development' : 'production';

conf.db = require('./conf/db');
	
module.exports = conf;