$(function () {

	Highcharts.Chart.prototype.test = function (text) {
		alert(text);
	}
    
	$(document).ready(function() {
        window.chart = new Highcharts.Chart({
            chart: {
                renderTo: 'container',
                type: 'spline',
				height: 200
            },
			colors: [
				'#5879c4',
				'#f36b6b',
				'#0bc49b',
				'#eb9855',
				'#1f9eec',
				'#e571c8',
				'#ffc14b',
				'#8479ef'
			],
			/*
			colors: [
				'#3498DB',
				'#2ECC71',
				'#C0392B',
				'#1ABC9C',
				'#9B59B6',
				'#E74C3C',
				'#34495E',
				'#F39C12',
			],
			*/
			credits : {
				enabled : false
			},
			navigation: false,
            title: false,
            subtitle: false,
			legend: false,
			tooltip: false,
            xAxis: {
				type: 'datetime',
				labels: false,
				tickWidth: 0,
				minPadding: 0,
				maxPadding: 0
				/*
				plotBands: [{ // visualize the weekend
					from: 1350007500,
					to: 1350010000,
					color: 'rgba(125, 190, 165, .4)'
				}]
				*/
            },
            yAxis: {
                title: false,
				labels: false,
                min: 0,
                minorGridLineWidth: 0,
                gridLineWidth: 0,
                alternateGridColor: null
            },
            plotOptions: {
                spline: {
					animation: false,
                    lineWidth: 4,
                    marker: {
                        enabled: false,
                    }
                }
            },
			series: [
				{
					data: [
						[1350000000, 0],
						[1350003000, 2],
						[1350005000, 5],
						[1350010000, 0]
					]
				},
				{
					data: [
						[1350000000, 4],
						[1350002000, 3],
						[1350004000, 4],
						[1350008000, 2],
						[1350010000, 4]
					]
				},
				{
					data: [
						[1350000000, 8],
						[1350003000, 6],
						[1350005000, 3],
						[1350010000, 8]
					]
				},
				{
					data: [
						[1350000000, 12],
						[1350003000, 2],
						[1350005000, 8],
						[1350010000, 12]
					]
				},
				{
					data: [
						[1350000000, 16],
						[1350003000, 10],
						[1350005000, 5],
						[1350010000, 16]
					]
				},
				{
					data: [
						[1350000000, 20],
						[1350003000, 2],
						[1350005000, 10],
						[1350010000, 20]
					]
				},
				{
					data: [
						[1350000000, 24],
						[1350003000, 16],
						[1350005000, 6],
						[1350010000, 24]
					]
				},
				{
					data: [
						[1350000000, 28],
						[1350003000, 12],
						[1350005000, 6],
						[1350010000, 28]
					]
				}
			]
			/*
            series: [{
                name: 'Hestavollane',
                data: [4.3, 5.1, 4.3, 5.2, 5.4, 4.7, 3.5, 4.1, 5.6, 7.4, 6.9, 7.1,
                    7.9, 7.9, 7.5, 6.7, 7.7, 7.7, 7.4, 7.0, 7.1, 5.8, 5.9, 7.4,
                    8.2, 8.5, 9.4, 8.1, 10.9, 10.4, 10.9, 12.4, 12.1, 9.5, 7.5,
                    7.1, 7.5, 8.1, 6.8, 3.4, 2.1, 1.9, 2.8, 2.9, 1.3, 4.4, 4.2,
                    3.0, 3.0]
    
            }, {
                name: 'Voll',
                data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.3, 0.0,
                    0.0, 0.4, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.6, 1.2, 1.7, 0.7, 2.9, 4.1, 2.6, 3.7, 3.9, 1.7, 2.3,
                    3.0, 3.3, 4.8, 5.0, 4.8, 5.0, 3.2, 2.0, 0.9, 0.4, 0.3, 0.5, 0.4]
            }]
			*/
        });
		
		window.chart = _.extend(window.chart, {
			addPoint: function (series, point) {
				
				for (var i = 0; i < this.series.length; i++) {
					
					if (i != series) {
						var last_value = _.last(this.series[i].data).y;
						this.series[i].addPoint([point[0], last_value]);
					}
					
				}
				
				this.series[series].addPoint(point);
								
			}
		})
		
    });
	
});