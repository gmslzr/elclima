(function($) {
	"use strict";
	var forecastURL = 'https://api.forecast.io/forecast/';
	var clima = {};
  	var cardinalNotation, day, month, year, hour, minutes, months_array;
	$.fn.elClima = function ( options ){
		var settings = $.extend({
			lat:'25.791992',
			lng:'-80.1337957',
			localTime: false,
			beaufort: false,
			metricUnits: false,
			api_key:'',
			success: function(clima){},
			error: function(clima){}
		},options);

		function convertCelsius(temp){
			return Math.round((5.0/9.0)*(temp-32.0));
		}

		function convertWindDirection(degrees){
			cardinalNotation = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE","S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW","N"];
			return cardinalNotation[parseInt(Math.floor(((degrees + 11.25) % 360) / 22.5))];
		}

		function convertHumanDate(timestamp, format){
			var date = new Date(timestamp*1000);
			var append;
			if(format === 'basic'){
				// Minutes part from the timestamp
				if(date.getHours() >= 12 ){
					append = 'PM';
				}
				else{
					append = 'AM';
				}
				hour = date.getHours() > 12 ? (date.getHours() - 12): date.getHours();
				minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();
				return hour + ':' + minutes + ' ' +append;
			}
			if(format === 'full'){
				months_array = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
				year = date.getFullYear();
				month = months_array[date.getMonth()];
  			day = date.getDate();
  			hour = date.getHours() > 12 ? (date.getHours() - 12) : date.getHours();
  			if(date.getHours() >= 12 ){
					append = 'PM';
				}
				else{
					append = 'AM';
				}
  			minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();
  			return month + '. ' + day + ', ' + year + ' ' + hour + ':' + minutes + ' '+ append;
			}
		}
		function milesToKm(miles){
			return Math.round(miles * 1.609);
		}
		function beaufortDetails(windspeed){
			var beaufort = [];
			if(windspeed < 1){
				beaufort.scale = 0;
				beaufort.description = 'Calm';
			}
			if(windspeed >= 1 && windspeed <= 3){
				beaufort.scale = 1;
				beaufort.description = 'Light Air';
			}
			if(windspeed >= 4 && windspeed <= 7){
				beaufort.scale = 2;
				beaufort.description = 'Light Breeze';
			}
			if(windspeed >= 8 && windspeed <= 12){
				beaufort.scale = 3;
				beaufort.description = 'Gentle Breeze';
			}
			if(windspeed >= 13 && windspeed <= 18){
				beaufort.scale = 4;
				beaufort.description = 'Moderate Breeze';
			}
			if(windspeed >= 19 && windspeed <= 24){
				beaufort.scale = 5;
				beaufort.description = 'Fresh Breeze';
			}
			if(windspeed >= 25 && windspeed <= 31){
				beaufort.scale = 6;
				beaufort.description = 'Strong Breeze';
			}
			if(windspeed >= 32 && windspeed <= 38){
				beaufort.scale = 7;
				beaufort.description = 'High Wind';
			}
			if(windspeed >= 39 && windspeed <= 46){
				beaufort.scale = 8;
				beaufort.description = 'Gale';
			}
			if(windspeed >= 47 && windspeed <= 54){
				beaufort.scale = 9;
				beaufort.description = 'Strong Gale';
			}
			if(windspeed >= 55 && windspeed <= 63){
				beaufort.scale = 10;
				beaufort.description = 'Storm';
			}
			if(windspeed >= 64 && windspeed <= 72){
				beaufort.scale = 11;
				beaufort.description = 'Violent Storm';
			}
			if(windspeed >= 73){
				beaufort.scale = 12;
				beaufort.description = 'Hurricane Force';
			}
			return beaufort;
		}
		
		$.ajax({
			dataType: "jsonp",
			url: encodeURI(forecastURL+settings.api_key+'/'+settings.lat+','+settings.lng),
			contentType:'application/json',
		})
		.done(function(data, status, jqXHR){
			if(data !== null){
				//settings.success({success: data});
				clima.sunrise = convertHumanDate(data.daily.data[0].sunriseTime, 'basic');
				clima.sunset = convertHumanDate(data.daily.data[0].sunsetTime, 'basic');
				clima.temperature = data.currently.temperature;
				clima.summary = data.currently.summary;
				clima.timezone = data.timezone;
				clima.humidity = data.currently.humidity;
				clima.windspeed = data.currently.windSpeed;
				clima.windDirection = convertWindDirection(data.currently.windBearing);
				clima.windBearing = data.currently.windBearing;
				clima.precipitationProbability = data.currently.precipProbability;
				clima.pressure = data.currently.pressure;
				clima.icon = data.currently.icon;
				if(settings.localTime === true){
					clima.localTime = [];
					clima.localTime.time = data.currently.time;
					clima.localTime.humanTime = convertHumanDate(data.currently.time, 'basic');
					clima.localTime.fullHumanTime = convertHumanDate(data.currently.time, 'full');
				}
				if(settings.metricUnits === true){
					clima.metricUnits = [];
					clima.metricUnits.temperature = convertCelsius(data.currently.temperature);
					clima.metricUnits.windspeed = milesToKm(data.currently.windSpeed);
				}
				if(settings.beaufort === true){
					clima.beaufort = beaufortDetails(data.currently.windSpeed);
				}
				settings.success({clima});
			}
		})
		.fail(function(jqXHR, status){
			settings.error({msg:'[El Clima]: There\'s been an error getting the weather information. HTTP status: '+jqXHR.status+'. Status string: '+status});
		});

		return this;
	};
})(jQuery);