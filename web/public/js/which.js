window.cookies={set:function(name,value,days){var expires;if(name){if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toGMTString();}else{expires="";}document.cookie=name+"="+escape(value)+expires+"; path=/";}},setJSON:function(name,value,days){this.set(name,JSON.stringify(value),days);},get:function(name){if(name){var match=document.cookie.match(new RegExp(name+"=(.*?)(?:;|$)"));if(match){return unescape(match[1].replace(/\+/g,"%20"));}}},getJSON:function(name){var value=this.get(name);if(value){return JSON.parse(value);}},list:function(){var pairs=document.cookie.split(new RegExp("; "));if(pairs.length>0&&pairs[0]!==""){var keys=new Array(pairs.length);for(var i=0;i<pairs.length;i++){keys[i]=pairs[i].match(/(.+?)=/)[1];}return keys;}return[];},delete_:function(name){this.set(name,"",-1);}};

var which = (function () {

	var _v = 1,
		_d = 'http://127.0.0.1:8126'
	_url = function (opts) {

		var url = _d + '/' + opts.key + '/' + opts.method;

		if (opts.val) {
			url += '/' + opts.val;
		}

		return url;

	}

	this.init = function (token) {
		this.token = token;
	}

	/**
	 * @constructor
	 */
	var Request = function (config) {

		var xhr = null,
			opts = {
				url: '',
				method: 'GET',
				success: function (data) {},
				failure: function (data) {}
			}

		for (var attrname in config) {
			opts[attrname] = config[attrname];
		}

		if (typeof XMLHttpRequest !== 'undefined') {

			xhr = new XMLHttpRequest();

		} else {

			var versions = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];

			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					xhr = new ActiveXObject(versions[i]);
					break;
				} catch(e) {}
			}

		}

		var onreadystatechange = function () {

			if (xhr.readyState < 4) {
				return;
			}

			if (xhr.status !== 200) {
				return;
			}

			// all is well
			if (xhr.readyState === 4) {

				var response = JSON.parse(xhr.responseText);

				if (xhr.status == 200) {
					opts.success(response);
				} else {
					opts.failure(response);
				}

			}
		}

		//cookixhr.withCredentials = true;

		xhr.onreadystatechange = onreadystatechange;

		var async = (document.readyState == 'complete') ? true : false;

		xhr.open(opts.method, opts.url, async);

		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.setRequestHeader("Authorization", opts.token);

		//if (_cookie.has(key)) {
		//	xhr.setRequestHeader("X-Session", _cookie.get());
		//}

		this.send = function () {
			xhr.send();
		}

		return this;

	}

	this.decide = function (key, success, failure) {

		//_cookie.set(key);

		var request = new Request({
			url : _url({
				key: key,
				method: 'decide',
				val: null
			}),
			account: this.account,
			token: this.token,
			success: success,
			failure: failure
		});

		return request.send();

	}

	this.reward = function (key, val) {

		var request = new Request({
			method: 'POST',
			url : _url({
				key: key,
				method: 'reward',
				val: val
			}),
			account: this.account,
			token: this.token
		});

		return request.send();

	}

	return this;

})();