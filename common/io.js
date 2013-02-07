module.exports = function (io, realm) {
	
	this.sockets = [];
	
	this.socket = io.sockets;
	
	this.addUser = function (token, socket) {
		this.sockets[token+realm] = socket;
	}
	
	this.removeSocket = function (socketId) {
		for (var socket in this.sockets) {
			if (this.sockets[socket] == socketId) {
				this.sockets.splice(socket, 1);
			}
		}
	}
	
	this.count = function () {
		return this.socket.clients().length;
	}
	
	this.emit = function (user, channel, data) {
		
		try {
			
			if (!data) {
				data = channel;
				channel = user;
				this.socket.emit(channel, data);
			} else {
				console.log(user+realm);
				this.sockets[user+realm].emit(channel, data);
			}
			
		} catch (e) {
			
			console.log('Error in sending socket.emit');
			console.log(e);
			
		}
				
	}
	
	return this;
	
}