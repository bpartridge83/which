var Backbone = require('backbone');

module.exports = function (app) {

	Backbone.Model.prototype.idAttribute = "_id";
	
	Backbone.Model.prototype.save = function () {
		
		var save = app.Deferred();
		
		this.set({
			'updatedAt': new Date().getTime()
		});
		
		Backbone.sync('save', this, {
			success: save.resolve,
			error: save.reject
		});
		
		return save.promise;
		
	};

	Backbone.sync = function (method, model, options) {
		
		if (model.id) {
			
			app.db.collection(model.collection).update({ _id: model.id }, model.toJSON(true), {}, function (error, data) {
				options.success(model.toJSON(true));
			});
			
		} else {
				
			app.db.collection(model.collection).insert(model.toJSON(true), function (error, data) {
				model.set('_id', data[0]['_id']);
				options.success(model);
			});
			
		}

	};

	this.User = Backbone.Model.extend({
		
        initialize: function () {            
			this.collection = 'user';
			this.set({
				'createdAt': new Date().getTime(),
				'updatedAt': new Date().getTime()
			})
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
			this.set({
				'createdAt': new Date().getTime(),
				'updatedAt': new Date().getTime()
			})
        }

    });

	this.Test = Backbone.Model.extend({
		
		initialize: function () {
			this.collection = 'test';
			this.set({
				'tempurature': 0.5,
				'useBest': 90,
				'createdAt': new Date().getTime(),
				'updatedAt': new Date().getTime()
			});
		},
		
		draw: function (probs) {
		
			var response = new app.Deferred(),
				rand = app.random(1000) / 1000,
				cum_prob = 0.0,
				chosen = null;
				
			for (var i = 0; i < probs.length; i++) {
				cum_prob += probs[i];
				if (cum_prob > rand) {
					return i;
				}
			}
			
			return probs.length - 1;
			
		},
		
		/**
		 * return Option
		 */
		choose: function () {
			
			var _this = this,
				response = app.Deferred(),
				options = this.get('options'),
				count_sum = app._.reduce(options, function (memo, option) {
					return memo + option.count;
				}, 0),
				tempurature = 1 / Math.log((count_sum * 1) + 0.0000001),				
				value_sum = app._.reduce(options, function (memo, option) {
					return memo + Math.exp(option.value / tempurature);
				}, 0),
				probs = [];
				
			app._.each(options, function (option) {
				var v = Math.exp(option.value / tempurature) / value_sum;
				probs.push(v);
			});
			
			var choice = options[this.draw(probs)];

			app.repo.test.update({
				'_id': this.id,
				'options': {
					$elemMatch: {
						'slug': choice.slug
					}
				}
			}, {
				$inc: {
					'options.$.count': 1,
				},
				$set: {
					'options.$.value': _this.calculateValue(choice)
				}
			}).then(function (test) {

				var Option = new app.model.Option({
					slug: choice.slug,
					test: _this.id,
					project: _this.get('project'),
					user: _this.get('user')
				})
			
				Option.save().then(function (option) {
					return response.resolve(option);
				});
				
			});
			
			return response.promise;
			
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
		
		getOption: function (slug) {
		
			var options = this.get('options');
			
			for (var i = 0; i < options.length; i++) {
				
				if (options[i].slug == slug) {
					return options[i];
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
		
		scaleReward: function (reward) {
		
			var maxReward = this.get('maxReward');
				//response = new app.Deferred();
			
			if (!maxReward || reward > maxReward) {
				
				console.log('updating maxReward');
				
				var options = this.get('options');
				
				for (var i = 0; i < options.length; i++) {
					
					options[i].value = (options[i].value * maxReward) / reward;
					
				}
				
				this.set('maxReward', reward);
				
			} else {
				
				reward = reward / maxReward;
				
			}
			
			return reward;
			
		},
		
		calculateValue: function (option, reward) {
		
			reward = reward || 0;
			
			if (!option.count) {
				return 0;
			}
		
			return ((option.count - 1) / option.count) * option.value + (1 / option.count) * reward;
			
		},
		
		updateOption: function (_option, reward) {
						
			var response = new app.Deferred(),
				reward = parseInt(reward, 10) || 1,
				time = new Date().getTime();
				
			var oldMaxReward = this.get('maxReward'),
				scaledReward = this.scaleReward(reward),
				maxReward = this.get('maxReward');
				
			var options = this.get('options'),
				slug = _option.get('slug'),
				option = this.getOption(slug),
				test = this,
				
				value = this.calculateValue(option, scaledReward),
				totalCount = app._.reduce(options, function (memo, option) {
					return memo + option.count;
				}, 0),
				totalScaledReward = (option.reward / maxReward) + scaledReward,
				percentage = 100 * (option.count / totalCount),
				conversion = totalScaledReward / option.count,
				error = Math.sqrt(conversion * ((1 - conversion) / option.count)),
				conv_from = (conversion - (1.65 * error) < 0) ? 0 : conversion - (1.65 * error),
				conv_to = (conversion + (1.65 * error) > 1) ? 1 : conversion + (1.65 * error);
			
			app.Async.parallel([
				function (callback) {
					app.repo.test.update({
						'_id': test.id,
						'options': {
							$elemMatch: {
								'slug': slug
							}
						}
					}, {
						$inc: {
							'options.$.reward': reward
						},
						$set: {
							'maxReward': maxReward,
							'options.$.value': value,
							'options.$.percentage': percentage,
							'options.$.conversion': conversion,
							'options.$.error': error,
							'options.$.conv_from': conv_from,
							'options.$.conv_to': conv_to
						}
					}).then(function () {
						callback(null);
					});
				},
				function (callback) {
					_option.set({
						'reward': reward,
						'value': value,
						'percentage': percentage,
						'conversion': conversion,
						'error': error,
						'conv_from': conv_from,
						'conv_to': conv_to
					}).save().then(function () {
						callback(null);
					})
				}
			], function () {
				response.resolve();
			});
			
			return response.promise;
						
		},
		
		bestOption: function () {
			
			var options = this.get('options'),
				best = 0,
				key = null;
				
			for (var i = 0; i < options.length; i++) {
				if (options[i].value > 0 && options[i].value > best) {
					best = options[i].value;
					key = i;
				}
			}
				
			return (key) ? options[key] : this.randomOption();
			
		},
		
		randomOption: function () {
			
			var options = this.get('options'),
				rand = app.random(options.length);
			
			return options[rand];
			
		},
		
		toJSON: function (original) {
			
			var json = Backbone.Model.prototype.toJSON.call(this);
			
			if (original) {
				return json;
			}
			
			var options = this.get('options'),
				total = {
					count: 0,
					reward: 0
				};
				
				/*
				
			for (var i = 0; i < options.length; i++) {
				total.count += options[i].count;
				total.reward += options[i].reward;
			}
				
			for (var i = 0; i < options.length; i++) {
				options[i].percentage = 100 * (options[i].count / total.count);
				options[i].conversion = options[i].reward / options[i].count;
				options[i].error = Math.sqrt(options[i].conversion * ((1 - options[i].conversion) / options[i].count));
				options[i].conv_from = (options[i].conversion - (1.65 * options[i].error) < 0) ? 0 : options[i].conversion - (1.65 * options[i].error);
				options[i].conv_to = (options[i].conversion + (1.65 * options[i].error) > 1) ? 1 : options[i].conversion + (1.65 * options[i].error);
			}
			*/
			
			return json;
			
			return app._.extend(json, {
				
			});
			
		}
		
	});

	this.Option = Backbone.Model.extend({
		
		initialize: function () {
			this.collection = 'option';
			this.set({
				'createdAt': new Date().getTime(),
				'updatedAt': new Date().getTime()
			})
		}
		
	});

	return this;
	
}
