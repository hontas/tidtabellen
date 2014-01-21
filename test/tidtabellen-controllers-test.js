/* globals TT, module, inject, localStorage */

describe('tidtabellen controllers', function() {

	beforeEach(module('tidtabellen'));

    describe("SiteListCtrl", function() {
        var $scope, $rootScope, $controller, $httpBackend,
            buses = [{ LineNumber: 135, Destination: "Hägersten", DisplayTime: "2 min" }];

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();

            $controller = $injector.get('$controller');
            $controller('SiteListCtrl', {'$scope' : $rootScope });
        }));

        describe("Sites", function() {
            xdescribe("#searchToSites", function() {
                it("should GET from correct address", function() {
                    $httpBackend.when('GET', '/realtid/OKAJ').respond(realtidSödertälje);
                    $rootScope.siteSearchQuery = "OKAJ";
                    $httpBackend.expectGET('/realtid/OKAJ');
                    $rootScope.searchToSites();
                    $httpBackend.flush();
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it("should populate savedSites with the result", function() {
                    var savedSites = [1,2,3],
                        response = { Hafas: { Sites:{ Site: savedSites } } };
                    $rootScope.siteSearchQuery = "OKAJ";
                    $httpBackend.when('GET', '/realtid/OKAJ').respond(response);
                    $rootScope.searchToSites();
                    $httpBackend.flush();
                    expect($rootScope.savedSites).to.equal(savedSites);
                });

                it("should update sitesSelection", function() {
                    var number = 200,
                        savedSites = [{ Number: number, Name: 'Top Site' }],
                        response = { Hafas: { Sites:{ Site: savedSites } } };
                    $rootScope.siteSearchQuery = "OKAJ";
                    $httpBackend.when('GET', '/realtid/OKAJ').respond(response);
                    $rootScope.searchToSites();
                    $httpBackend.flush();
                    expect($rootScope.sitesSelection).to.equal(number);
                });
            });

            xdescribe("#saveFavoriteStation", function() {

                var setItem, getItem;

                beforeEach(function() {
                    setItem = sinon.stub(localStorage, 'setItem');
                    getItem = sinon.stub(localStorage, 'getItem');
                });

                afterEach(function() {
                    setItem.restore();
                    getItem.restore();
                });

                it("should do nothing of sitesSelection is undefined", function() {
                    expect($rootScope.sitesSelection).to.be.undefined;
                    $rootScope.saveFavoriteStation();
                    expect(setItem.calledOnce).to.be.false;
                });

                it("should set value of sitesSelection to localStorage savedSites array", function() {
                    var savedSites = [{ Number: 1111, Name: 'site' }];
                    $rootScope.savedsavedSites = savedSites;
                    $rootScope.sitesSelection = 1111;
                    $rootScope.saveFavoriteStation();
                    expect(setItem.getCall(0).args[0]).to.equal('sites');
                    expect(setItem.getCall(0).args[1]).to.equal(JSON.stringify(savedSites));
                });

                it("should append to localStorage savedSites array", function() {
                    var localStorageSites = [{ Number: 1, Name: 'OldName' }],
                        savedSites = [{ Number: 1111, Name: 'site' }];

                    getItem.returns(JSON.stringify(localStorageSites));
                    $rootScope.savedsavedSites = savedSites;
                    $rootScope.sitesSelection = 1111;
                    $rootScope.saveFavoriteStation();
                    expect(setItem.getCall(0).args[0]).to.equal('sites');
                    expect(setItem.getCall(0).args[1]).to.equal(JSON.stringify(localStorageSites.concat(savedSites)));
                });
            });

            describe(".sites", function() {
                it("should be an array", function() {
                    expect($rootScope.savedSites).to.be.an("array");
                });

                it("should be set from localStorage", function() {
                    var savedSites = [{ Name: "Klubbacken", Number: 1658 }],
                        getItem = sinon.stub(localStorage, 'getItem').returns(JSON.stringify(savedSites)),
                        scope = {};
                    $controller('SiteListCtrl', {'$scope' : scope });
                    expect(scope.savedSites).to.eql(savedSites);
                    getItem.restore();
                });
            });

            describe(".sitesSelection", function() {
                it("should be undefined if savedSites is undefined", function() {
                    expect($rootScope.sitesSelection).to.be.undefined;
                });

                it("should initiate to the first objects Number-property in sites", function() {
                    var savedSites = [{ Number: 8765 }],
                        getItem = sinon.stub(localStorage, 'getItem').returns(JSON.stringify(savedSites)),
                        scope = {};
                    $controller('SiteListCtrl', {'$scope' : scope });
                    expect(scope.sitesSelection).to.equal(8765);
                    getItem.restore();
                });
            });
        });

        describe('Departures', function() {

            describe("#getDepartures", function() {
                it("should exist", function() {
                    expect($rootScope.getDepartures).to.exist;
                });

                xit("should get departures if sitesSelection is set", function() {
                    expect($rootScope.sitesSelection).to.be.undefined;
                    var stub = sinon.stub();
                    $rootScope.getDepartures();
                    expect().to.equal();
                });

                xit('should create "departures" model with one departure', function() {
                    $httpBackend.when('GET', '/departures/9506').respond({ Buses: { DpsBus: buses } });
                    $controller('SiteListCtrl', {'$scope' : $rootScope });
                    expect($rootScope.departures).to.be.undefined;
                    $httpBackend.flush();
                    expect($rootScope.departures).to.have.length(1);
                });

                xit("should set departures in localStorage", function() {
                    var setItem = sinon.stub(localStorage, 'setItem');
                    $controller('DepartureListCtrl', {'$scope' : $rootScope });
                    $httpBackend.flush();
                    expect(setItem.calledOnce).to.be.true;
                    expect(setItem.getCall(0).args[0]).to.equal('departures');
                    expect(setItem.getCall(0).args[1]).to.equal(JSON.stringify(buses));
                    setItem.restore();
                });
            });
        });
    });
});

describe("TT", function() {
    describe("Util", function() {
        describe("#getMetroDataFromString", function() {
            it("Should take a string and turn it into an array", function() {
                var str1 = TT.Util.getMetroDataFromString("17 Skarpnäck  3 min"),
                    str2 = TT.Util.getMetroDataFromString("18 Hässelby str.  6 min"),
                    str3 = TT.Util.getMetroDataFromString("13  Ropsten"),
                    str4 = TT.Util.getMetroDataFromString("11  Kungsträdg. 2 min"),
                    str5 = TT.Util.getMetroDataFromString("10  Kungsträdg. Kort tåg"),
                    str6 = TT.Util.getMetroDataFromString("11  Akalla 2 min."),
                    str7 = TT.Util.getMetroDataFromString("18 Hässelby str.  6 mi "),
                    str8 = TT.Util.getMetroDataFromString("14  Tekn högskolan * ");

                expect(str1).to.be.an('array');
                expect(str1[3]).to.equal("3 min");

                expect(str2).to.be.an('array');
                expect(str2[3]).to.equal("6 min");

                expect(str3).to.be.an('array');
                expect(str3[2]).to.equal("Ropsten");
                expect(str3[3]).to.be.undefined;

                expect(str4).to.be.an('array');
                expect(str4[3]).to.equal("2 min");

                expect(str5).to.be.an('array');
                expect(str5[2]).to.equal("Kungsträdg. Kort tåg");
                expect(str5[3]).to.be.undefined;

                expect(str6).to.be.an('array');
                expect(str6[3]).to.equal("2 min");

                expect(str7).to.be.an('array');
                expect(str7[3]).to.equal("6 mi");

                expect(str8).to.be.an('array');
                expect(str8[3]).to.be.undefined;

            });
        });
    });
});