(function($) {
	"use strict";
	var forecastURL = 'https://api.forecast.io/forecast/';
	var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
	var clima = {};
  	var googlexhr, forecastxhr, weatherdata, locationInfo, cardinalNotation, day, month, year, hour, minutes, months_array;
	$.fn.elClima = function ( options ){
		var settings = $.extend({
			lat:'25.791992',
			lng:'-80.1337957',
			localTime: false,
			beaufort: false,
			metricUnits: false,
			getLocationInfo: false,
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
		
		forecastxhr = $.ajax({ dataType: "jsonp",url: encodeURI(forecastURL+settings.api_key+'/'+settings.lat+','+settings.lng),contentType:'application/json'});
		
		if(settings.getLocationInfo === true){
			googlexhr = $.ajax({url: encodeURI(googleURL+settings.lat+','+settings.lng)});
		}

		$.when(googlexhr, forecastxhr)
			.done(function (googlerq, forecastrq){
				//console.log(googlerq);
				if(settings.getLocationInfo === true){
					if(googlerq[0].status === 'OK'){
						locationInfo = googlerq[0].results[0].address_components[3].short_name + ', '+ googlerq[0].results[0].address_components[5].short_name;
						//console.log(locationInfo);
					}
					else{
						settings.error({msg:'[El Clima]: There\'s been an error getting the geocoder information. Verify provided coordinates.'});	
					}
				}

				if(forecastxhr !== null){
					weatherdata = forecastrq[0];
					clima.sunrise = convertHumanDate(weatherdata.daily.data[0].sunriseTime, 'basic');
					clima.sunset = convertHumanDate(weatherdata.daily.data[0].sunsetTime, 'basic');
					clima.temperature = weatherdata.currently.temperature;
					clima.summary = weatherdata.currently.summary;
					clima.timezone = weatherdata.timezone;
					clima.humidity = (weatherdata.currently.humidity *100);
					clima.windspeed = weatherdata.currently.windSpeed;
					clima.windDirection = convertWindDirection(weatherdata.currently.windBearing);
					clima.windBearing = weatherdata.currently.windBearing;
					clima.precipitationProbability = weatherdata.currently.precipProbability;
					clima.pressure = Math.round(weatherdata.currently.pressure * 0.0295301).toFixed(2);
					clima.icon = weatherdata.currently.icon;
					if(settings.getLocationInfo === true){
						clima.locationInfo = locationInfo;
					}
					if(settings.localTime === true){
						clima.localTime = [];
						clima.localTime.time = weatherdata.currently.time;
						clima.localTime.humanTime = convertHumanDate(weatherdata.currently.time, 'basic');
						clima.localTime.fullHumanTime = convertHumanDate(weatherdata.currently.time, 'full');
					}
					if(settings.metricUnits === true){
						clima.metricUnits = [];
						clima.metricUnits.temperature = convertCelsius(weatherdata.currently.temperature);
						clima.metricUnits.windspeed = milesToKm(weatherdata.currently.windSpeed);
					}
					if(settings.beaufort === true){
						clima.beaufort = beaufortDetails(weatherdata.currently.windSpeed);
					}
					settings.success({elclima: clima});
				}
			})
			.fail(function(jqXHR, status){
				//console.log(googleErr);
				settings.error({msg:'[El Clima]: There\'s been an error retrieving information. HTTP status: '+jqXHR.status+'. Status string: '+status});	
			});
		return this;
	};
})(jQuery);