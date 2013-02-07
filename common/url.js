module.exports = function (app) {
	
	return function (path) {
		
		if (app.get('testing')) {
			path += '?_test=true';
		}
		
		return path;
		
	}
	
}