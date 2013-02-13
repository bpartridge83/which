var Backbone = require('backbone');

module.exports = function (app) {

	Backbone.Model.prototype.idAttribute = "_id";
	
	Backbone.Model.prototype.save = function (success, failure) {
		
		var save = app.Deferred();
		
		Backbone.sync('save', this, {
			success: save.resolve,
			error: save.reject
		});
		
		return save.promise;
		
	};

	Backbone.sync = function (method, model, options) {
		
		if (model.id) {
			
			app.db.collection(model.collection).update({ _id: model.id }, model.toJSON(), {}, function (error, data) {
				options.success(model.toJSON());
			});
			
		} else {
			
			//var save = function (model) {
				
				app.db.collection(model.collection).insert(model.toJSON(), function (error, data) {
					model.set('_id', data[0]['_id']);
					console.log('should be returning succees and resolving the save deferred');
					options.success(model);
				});
			//}
			 
			/*
			if (model.unique) {
				
				var query = {};
				query[model.unique] = model.get(model.unique);
				
				app.repo.user.findOne(query, function (user) {
					return (user) ? options.error() : save(model);
				});
				
			} else {
			*/
				
			//	console.log('');
			//	return save(model);
				
			//}
			
		}

	};

	this.User = Backbone.Model.extend({
		
        initialize: function () {            
			this.collection = 'user';
			//this.unique = 'email';
        },

		fullName: function () {
			return this.get('firstName') + ' ' + this.get('lastName');
		},
		
		setPassword: function (password) {
			return this.set('password', app.bcrypt.hashSync(password));
		}

    });
	
	this.Project = Backbone.Model.extend({
		
        initialize: function () {
            
			this.collection = 'project';

        }

    });

	this.Test = Backbone.Model.extend({
		
		initialize: function () {
			this.collection = 'test';
			this.set('useBest', 90);
			this.set('maxReward', 1);
		},
		
		/**
		 * return Option
		 */
		choose: function () {
			
			var option = this.randomOption(),
				options = this.get('options');
			
			var Option = new app.model.Option({
				slug: option.slug,
				test: this.id,
				project: this.get('project'),
				user: this.get('user')
			});
			
			Option.save(function (_option) {
				return _option;
			});
			
			for (var i = 0; i < options.length; i++) {
				if (option.slug == options[i].slug) {
					options[i].count += 1;
				}
			}
			
			this.set('options', options);
			
			return Option;
			
		},
		
		options: function () {
		
			var _options = this.get('options');
			
			if (typeof(_options) == 'undefined') {
				return [];
			} else {
				return _options;
			}
			
		},
		
		getOptionKey: function (slug) {
		
			var options = this.get('options');
			
			for (var i = 0; i < options.length; i++) {
				
				if (options[i].slug == slug) {
					return i;
				}
				
			}
			
			return null;
			
		},
		
		addOption: function (slug) {
			
			var options = this.options();

			options.push({
				slug: slug,
				count: 0,
				value: 0,
				reward: 0
			});

			this.set('options', options);
			
		},
		
		updateMaxReward: function (reward) {
		
			console.log(reward);
			console.log(this.get('maxReward'));
		
			if (reward > this.get('maxReward')) {
				
				var options = this.get('options');
				
				for (var i = 0; i < options.length; i++) {
					
					options[i].value = (options[i].value * this.get('maxReward')) / reward;
					
				}
				
				this.set('maxReward', reward);
				
			}
			
		},
		
		updateOption: function (slug, reward, callback) {
									
			reward = (typeof(reward) == 'undefined') ? reward : 1;
			
			var options = this.get('options'),
				key = this.getOptionKey(slug);
			
			options[key].count += 1;
			
			var n = options[key].count;
			
			//this.updateMaxReward(reward);
						
			var value = options[key].value,
				scaledReward = (!this.get('maxReward')) ? 0 : reward / this.get('maxReward'),
				new_value = ((n - 1) / n) * value + (1 / n) * scaledReward;
				
				console.log('trying to calculate the reward offered');
				console.log(reward);
				console.log(this.get('maxReward'));
				console.log(scaledReward);
				
			options[key].value = new_value;
			options[key].reward += reward;
			
			this.set('options', options);
			
			console.log(options[key]);
			
			callback(this);
			
		},
		
		bestOption: function () {
			
			var options = this.get('options'),
				best = 0;
			
		},
		
		randomOption: function () {
			
			var options = this.get('options'),
				rand = app.random(options.length);
			
			return options[rand];
			
		}
		
	});

	this.Option = Backbone.Model.extend({
		
		initialize: function () {
			this.collection = 'option';
		}
		
	});

	return this;
	
}
