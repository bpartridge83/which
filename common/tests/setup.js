var time = new Date().getTime();

var url = function (path, testing) {

	if (typeof(testing) == 'undefined') {
		testing = true;
	}

	if (path.indexOf('http') > -1) {
		return path;
	}

	var url = 'http://localhost:5000' + path;
	
	//if (testing) {
		url += '?_test=true';
	//}

	return url;

};