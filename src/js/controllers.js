var tidtabellen = angular.module('tidtabellen', []);


tidtabellen.controller('SiteListCtrl', function($scope, $http) {
		$scope.sites = [];
});


tidtabellen.controller('DepartureListCtrl', function($scope, $http) {
	$http.get('/departures/9506').success(function(data) {
		if (data.Buses.DpsBus instanceof Array) {
			$scope.departures = data.Buses.DpsBus;
		} else {
			$scope.departures = [data.Buses.DpsBus];
		}
	});
});