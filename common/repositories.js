var Backbone = require('backbone');

module.exports = function (db, model) {

	this.user = {
		
		collection: 'user',
		
		findAll: function (callback) {
			
			db.collection(this.collection).find().toArray(callback);
			
		},
		
		findOne: function (params, callback) {
			
			db.collection(this.collection).find(params).toArray(function (error, data) {
				var user = new model.User(data[0]);
				callback(user);
			});
			
		}
		
	}

	return this;
	
};