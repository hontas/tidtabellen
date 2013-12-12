(function () {

	var _ = window._;
	// set up underscore to use mustaches for templating
	_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

	var siteSearch, siteSelection, departureSearch, resultTable,
		isLoading = false;

	function init () {
		siteSearch = $('#siteSearch');
		siteSelection = $('#siteSelection');
		departureSearch = $('#departureSearch');
		resultTable = $('#resultTable tbody');

		hookUpEventListeners();
		getSavedData();
		getGeoLocation();
	}

	function getSavedData() {
		var site = JSON.parse(localStorage.getItem('site'));
		if (site) {
			listSites({ Hafas: { Sites: { Site: [site] }}});
		}
	}

	function hookUpEventListeners() {
		siteSearch.on('keyup', function (e) {
			e.preventDefault();
			var site = $(this).val();
			if (e.keyCode === 13 && site) {
				getStations(site);
			}
		});

		departureSearch.on('submit', function (e) {
			e.preventDefault();
		});

		$('.js-save-favorite-station').on('click', function (e) {
			e.preventDefault();
			var number = siteSelection.val(),
				name = siteSelection.find(':selected').text();

			localStorage.setItem('site', JSON.stringify({ Name: name, Number: number }));
		});
	}

	function getGeoLocation() {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(function(position) {
				console.log(position.coords.latitude, position.coords.longitude);
				jsonRequest('/sitesInZone/' + position.coords.latitude + '/' + position.coords.longitude)
					.done(function(json) {
						console.log(json);
					});
			});
		} else {
			console.log('geolocation not avaliable');
		}
	}

	function jsonRequest(url) {
		isLoading = true;
		return $.getJSON(url)
			.always(function() {
				isLoading = false;
			});
	}

	function getStations(query) {
		jsonRequest('/realtid/' + query)
			.done(listSites);
	}

	function listSites(json) {
		console.log(json);
		var optionTemplate = _.template('<option value="{{ Number }}">{{ Name }}</option>'),
			sites = json.Hafas.Sites.Site,
			res;

		if (typeof sites === "object" && !Array.isArray(sites)) {
			sites = [sites];
		}

		res = sites.map(function(site) {
			return optionTemplate(site);
		});

		siteSelection
			.empty()
			.append(res.join('\n'))
			.focus();
	}


	window.addEventListener("DOMContentLoaded", init, false);
	
})();