var Backbone = require('backbone');

module.exports = function (db) {

	Backbone.Model.prototype.idAttribute = "_id";

	Backbone.sync = function (method, model, options) {
		
		if (model.id) {
			
			db.collection(model.collection).update({ _id: model.id }, model.toJSON(), {}, function (error, data) {
				options.success(model.toJSON());
			});
			
		} else {
			
			db.collection(model.collection).insert(model.toJSON(), function (error, data) {
				model.set('_id', data[0]['_id']);
				options.success(data);
			});
			
		}

	};

	this.User = Backbone.Model.extend({
		
		save: function (success, failure) {
			
			Backbone.sync('save', this, {
				success: success,
				error: failure
			});
			
		},
		
        initialize: function () {            
			this.collection = 'user';
        },

		fullName: function () {
			return this.get('firstName') + ' ' + this.get('lastName');
		},

    });
	
	this.Account = Backbone.Model.extend({
		
        initialize: function () {
            
			this.collection = 'account';

        }

    });

	return this;
	
}
