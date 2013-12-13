/* globals module, inject */

describe('tidtabellen controllers', function() {

	beforeEach(module('tidtabellen'));

	describe('DepartureListCtrl', function() {
		var $httpBackend, $rootScope, $controller;

		beforeEach(inject(function($injector) {
			$httpBackend = $injector.get('$httpBackend');
			$httpBackend.when('GET', '/departures/9506')
				.respond({ Buses: { DpsBus: [{}] } });

			$rootScope = $injector.get('$rootScope');
			$controller = $injector.get('$controller');
		}));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('should create "departures" model with one departure', function() {
			var ctrl = $controller('DepartureListCtrl', {'$scope' : $rootScope });
			expect($rootScope.departures).to.be.undefined;
			$httpBackend.flush();
			expect($rootScope.departures).to.have.length(1);
		});
	});
});