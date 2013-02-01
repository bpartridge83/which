var Backbone = require('backbone');

module.exports = function (app) {

	Backbone.Model.prototype.idAttribute = "_id";
	
	Backbone.Model.prototype.save = function (success, failure) {
		
		Backbone.sync('save', this, {
			success: success,
			error: failure
		});
		
	};

	Backbone.sync = function (method, model, options) {
		
		if (model.id) {
			
			app.db.collection(model.collection).update({ _id: model.id }, model.toJSON(), {}, function (error, data) {
				options.success(model.toJSON());
			});
			
		} else {
			
			var save = function (model) {
				
				console.log(model);
				
				console.log(model.collection);
				console.log(model.toJSON());
				
				app.db.collection(model.collection).insert(model.toJSON(), function (error, data) {
					
					console.log(data);
					
					model.set('_id', data[0]['_id']);
					
					console.log(model);
					
					console.log(data[0]['_id']);
					
					console.log('trying the options.success here');
					console.log(options.success);
					console.log(model.id);
										
					options.success(model);
				});
			}
			 
			if (model.unique) {
				
				var query = {};
				query[model.unique] = model.get(model.unique);
				
				app.repo.user.findOne(query, function (user) {
					return (user) ? options.error() : save(model);
				});
				
			} else {
				
				return save(model);
				
			}
			
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

    });
	
	this.Account = Backbone.Model.extend({
		
        initialize: function () {
            
			this.collection = 'account';

        }

    });

	this.Test = Backbone.Model.extend({
		
		initialize: function () {
			this.collection = 'test';
		},
		
		get: function (attr, opts) {
			if (typeof this[attr] == 'function')
			{
				return this[attr](opts);
			}

			return Backbone.Model.prototype.get.call(this, attr);
		},
		
		choose: function (session) {

			if (session) {
				
				app.repo.option.findOne(session, function (option) {
					return option;
				});
				
			} else {
				
				var percentage = Math.floor(Math.random() * 101),
					bestOption = this.bestOption(),
					nextBest = this.nextBest(bestOption),
					choice = null,
					totalViews = this.totalViews(),
					gapNeeded = this.gapNeeded(totalViews);

				if (bestOption.pScore && nextBest.pScore && (bestOption.pScore - nextBest.pScore) > gapNeeded) {
					choice = bestOption;
					console.log('decided best option at '+totalViews);
				} else {
					if (this.get('useBest') && percentage > this.get('useBest')) {
						choice = this.random();
					} else {
						choice = this.bestOption();
					}
				}
				
				var option = new app.model.Option({
					choice: choice.slug
				});
				
				option.save(function (option) {
					return option;
				});
				
			}

		},
		
		bestOption: function () {

			var options = this.get('options'),
				maxPScore = 0;

			for (var i = 0; i < options.length; i++) {
				var pScore = new app.model.Option(options[i]).pScore(this);
				if (pScore > maxPScore) {
					maxPScore = pScore;
					var bestOption = i;
				}
			}

			if (typeof(bestOption) == 'undefined') {
				return this.random(true);
			}

			return options[bestOption];

		},
		
		nextBest: function (option) {

			var options = this.without(option.slug),
				maxPScore = 0,
				bestOption = 0;

			for (var i = 0; i < options.length; i++) {
				var pScore = new app.model.Option(options[i]).pScore(this);
				if (pScore > maxPScore) {
					maxPScore = pScore;
					bestOption = i;
				}
			}

			return options[bestOption];

		},
		
		random: function (force) {

			if (!force) {
				var best = this.bestOption(),
					options = this.without(best.slug);
			} else {
				var options = this.get('options');
			}

			var index = Math.floor(Math.random() * options.length)

			return options[index];

		},
		
		option: function (slug) {

			var options = this.get('options');

			for (var i = 0; i < options.length; i++) {

				if (options[i].slug == slug) {
					return new app.model.Option(options[i]);
				}
			}

			return false;
		},
		
		without: function (slug) {

			var response = [],
				options = this.get('options');

			return app._.reject(options, function(option){
				if (option.slug == slug) {
					return option;
				}
			});

		},

		update: function (option) {

			var slug = option.get('slug'),
				options = this.get('options');

			for (var i = 0; i < options.length; i++) {
				if (options[i].slug == slug) {
					options[i] = option.attributes;
				}
			}

			return this;

		},

		totalViews: function () {

			var total = 0,
				options = this.get('options');

			for (var i = 0; i < options.length; i++) {
				total += options[i].views;
			}

			return total;

		},

		gapNeeded: function (views) {

			console.log(100 - (1 * Math.floor(views/100)));

			return 100 - (1 * Math.floor(views/100));

		},

		confidence: function() {

		}
		
	});
	
	this.Option = Backbone.Model.extend({

		initialize: function() {
			this.collection = 'option';
		},

		reward: function() {

			this.set('success', this.get('success') + 1);

		},

		viewed: function () {

			this.set('views', this.get('views') + 1);

		},

		rate: function (format) {

			var rate = 0;

			if (this.get('views') != 0) {
				rate = this.get('success') / this.get('views');
			}

			if (format) {
				return numeral(rate).format('0.000%');
			}

			return rate;

		},

		error: function (format) {

			var error = 0;

			if (this.get('views') != 0) {

				var rate = this.rate(),
					views = this.get('views');

				error = Math.sqrt((rate*(1-rate))/views);

			}

			if (format) {
				return numeral(error).format('0.000%');
			}

			return error;

		},

		zScore: function (test) {

			if (!test) {
				return false;
			}

			var sum = 0,
				alternatives = test.without(this.get('slug'));

			for (var i = 0; i < alternatives.length; i++) {
				option = new app.model.Option(alternatives[i]);
				var _zScore = (this.rate() - option.rate()) / Math.sqrt(Math.pow(this.error(), 2) + Math.pow(option.error(), 2));
				sum += _zScore;
			}

			return sum * 100;

		},

		pScore: function (test) {

			var zScore = this.zScore(test);

			var cumnormdist = function (z)
			{
				z = z / 100;

				var b1 =  0.319381530,
					b2 = -0.356563782,
					b3 =  1.781477937,
					b4 = -1.821255978,
					b5 =  1.330274429,
					p  =  0.2316419,
					c  =  0.39894228;

				if (z >= 0.0) {
					t = 1.0 / ( 1.0 + p * z );
					return (1.0 - c * Math.exp( -z * z / 2.0 ) * t *
						( t * ( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 )) * 100;
				} else {
					t = 1.0 / ( 1.0 - p * z );
					return ( c * Math.exp( -z * z / 2.0 ) * t *
						( t *( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 )) * 100;
				}
			}

			return cumnormdist(zScore);

		}

	});

	return this;
	
}
