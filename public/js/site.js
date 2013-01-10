$(function () {

	which.init('testing123');

	which.decide('awesome', function (data) {

		var $h2 = $('[data-which]');

		switch (data.choice) {

			case 1:
				$h2.text('1st');
				break;

			case 2:
				$h2.text('2nd');
				break;

			case 3:
				$h2.text('3rd');
				break;

		}

	});
	
	setTimeout(function () {
		which.decide('awesome', function (data) {
			console.log(data);
		}, 5000);
	})
	
});
