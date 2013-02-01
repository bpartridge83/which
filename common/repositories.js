var Backbone = require('backbone');

module.exports = function (app) {

	var _default = {
		
		_assign: function () {
			
			var model = this.model;
			
			return function (doc) {
				return (doc) ? new app.model[model](doc) : null;
			}
			
		},
		
		findAll: function (callback) {
			
			var _assign = this._assign();
			
			app.db.collection(this.collection).find().toArray(function (error, data) {
				
				var response = [];
				
				app._.each(data, function (doc) {
					response.push(_assign(doc));
				});
				
				return callback(response);
				
			});
			
		},
		
		find: function (params, callback) {
		
			var _assign = this._assign();
			
			app.db.collection(this.collection).find(params).toArray(function (err, data) {
				
				var response = [];
				
				app._.each(data, function (doc) {
					response.push(_assign(doc));
				});
				
				return callback(response);
				
			});
			
		},
		
		findOne: function (params, callback) {
			
			var _assign = this._assign();
			
			app.db.collection(this.collection).findOne(params, function (err, doc) {
				
				var object = _assign(doc);
				return callback(object);
				
			});
			
		}
		
	}

	this.user = {};

	app._.extend(this.user, _default, {
		collection: 'user',
		model: 'User'
	});
	
	this.test = {};
	
	app._.extend(this.test, _default, {
		collection: 'test',
		model: 'Test'
	});
	
	this.option = {};
	
	app._.extend(this.option, _default, {
		collection: 'option',
		model: 'Option'
	});

	return this;
	
};