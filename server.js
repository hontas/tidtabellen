var express = require('express');
var request = require('request');
var key = require('./key');

var app = express(),
	headers = { accept: 'application/json' };

app.get('/realtid/:query', function(req, res) {
	request({
		uri: 'https://api.trafiklab.se/sl/realtid/GetSite.json?key=' + key.getKey('realtid') + '&stationSearch=' + req.params.query,
		headers: headers
	}, function(error, response, body) {
		res.send(body);
	});
});

app.get('/departures/:id', function(req, res) {
	var keySiteId = '&key=' + key.getKey('realtid') + '&siteId=' + req.params.id,
		urlBus = 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?' + keySiteId,
		urlMetro = 'https://api.trafiklab.se/sl/realtid/GetDepartures?' + keySiteId,
		data = {};

	request({ uri: urlBus, headers: headers }, function(error, response, body) {
		data = JSON.parse(body).DPS;
		request({ uri: urlMetro, headers: headers }, function(error, response, body) {
			data.Metros = JSON.parse(body).Departure.Metros;
			res.send(JSON.stringify(data));
		});
	});
});

app.get('/sitesInZone/:lat/:long', function(req, res) {
	request({
		uri: 'https://api.trafiklab.se/sl/reseplanerare.json?key=' + key.getKey('reseplanerare') + '&SID=@Y=' + req.params.lat + '@X=' + req.params.long,
		headers: headers
	}, function(error, response, body) {
		res.send(body);
	});
});

app.use(express.static(__dirname + '/public'));

app.listen(3000);
console.log('Listening on port 3000');