window.socket = window.socket || {
	sockets: [],
	init: function (token, callback) {
		this.token = token;
		this.append(callback);
	},
	append: function (callback) {
		var oScript = document.createElement('script');
		oScript.type = 'text/javascript';
		oScript.src = '/socket.io/socket.io.js';
		oScript.onload = callback;
		document.body.appendChild(oScript);
	},
	add: function (port) {
		var i = this.sockets.length;
		this.sockets.push(io.connect(port));
		this.sockets[i].emit('user', this.token);
		this.sockets[i].on('disconnect', function () {
			socket.connect(i);
		});
	},
	connect: function (index) {
		var sockets = this.sockets,
			token = this.token;
		
		this.sockets[index].socket.connect();
		this.sockets[index].on('connect', function () {
			sockets[index].emit('user', token);
		})
	},
	on: function (event, callback) {
		for (var i = 0; i < this.sockets.length; i++) {
			this.sockets[i].on(event, callback);
		}
	},
	emit: function (event, data) {
		for (var i = 0; i < this.sockets.length; i++) {
			this.sockets[i].emit(event, data);
		}
	}
}

