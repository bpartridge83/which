var conf = {};

conf.env = (process.env.NODE_ENV == 'development') ? 'development' : 'production';

conf.twitter = require('./conf/twitter');
	
module.exports = conf;