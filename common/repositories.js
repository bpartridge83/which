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
			
			var query = new app.Deferred(),
				_assign = this._assign();
			
			app.db.collection(this.collection).find().toArray(function (error, data) {
				
				var response = [];
				
				app._.each(data, function (doc) {
					response.push(_assign(doc));
				});
				
				query.resolve(response);
				
			});
			
			return query.promise;
			
		},
		
		find: function (params) {
		
			var query = new app.Deferred(),
				_assign = this._assign();
			
			if (typeof(params._id) == 'number' || typeof(params._id) == 'string') {
				params._id = app.ObjectId(params_.id);
			}
			
			app.db.collection(this.collection).find(params).toArray(function (err, data) {
				
				var response = [];
				
				app._.each(data, function (doc) {
					response.push(_assign(doc));
				});
				
				query.resolve(response);
				
			});
			
			return query.promise;
			
		},
		
		findOne: function (params, callback) {
			
			var query = new app.Deferred(),
				_assign = this._assign();
			
			if (typeof(params._id) == 'number' || typeof(params._id) == 'string') {
				params._id = app.ObjectId(params._id);
			}
			
			app.db.collection(this.collection).findOne(params, function (err, doc) {
				
				var object = _assign(doc);
				
				query.resolve(object);
				
			});
			
			return query.promise;
			
		}
		
	}

	this.user = {};

	app._.extend(this.user, _default, {
		collection: 'user',
		model: 'User'
	});
	
	this.project = {};
	
	app._.extend(this.project, _default, {
		collection: 'project',
		model: 'Project'
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