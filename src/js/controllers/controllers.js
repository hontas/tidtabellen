/* globals _, moment */
(function() {

    function getArray(obj) {
        return Array.isArray(obj) ? obj : [obj];
    }

    function getSiteId(site) {
        return site.Number;
    }

    var TT = window.TT || {};

    var tidtabellen = angular.module('tidtabellen', []);


    tidtabellen.controller('SiteListCtrl', function($scope, $rootScope, $http) {
        var savedSites = JSON.parse(localStorage.getItem('sites')) || [],
            departures = JSON.parse(localStorage.getItem('departures')) || [],
            trips = JSON.parse(localStorage.getItem('trips')) || [];

        function gotLocation(pos) {
            $rootScope.gettingGeoLocation = false;
            $rootScope.$apply();
            $scope.lat = parseInt(pos.coords.latitude * 1000000, 10);
            $scope.long = parseInt(pos.coords.longitude * 1000000, 10);
        }

        function getLocation() {
            if ("geolocation" in navigator) {
                $rootScope.gettingGeoLocation = true;
                navigator.geolocation.getCurrentPosition(gotLocation);
            } else {
                window.alert('GeoLocation not avalaible');
            }
        }

        function displayAlert(data, status) {
            $scope.alertHeading = status;
            $scope.alertMessage = data;
        }

        $scope.closeAlert = function() {
            $scope.alertMessage = undefined;
        };

        $scope.searchSites = function() {
            $scope.isSearching = true;
            $http.get('/getSite/' + $scope.siteSearchQuery).success(function(data) {
                var favoriteSiteIds = $scope.savedSites.map(getSiteId);

                $scope.sites = getArray(data.Hafas.Sites.Site)
                    .map(function(site) {
                        site.favorite = _.contains(favoriteSiteIds, getSiteId(site));
                        return site;
                    });

                $scope.sitesSelection = $scope.sites[0].Number;
                $scope.isSearching = false;
            });
        };

        $scope.cleanSites = function() {
            $scope.sites = [];
            $scope.siteSearchQuery = '';
        };

        $scope.saveFavoriteStation = function(site) {
            var sites = JSON.parse(localStorage.getItem('sites')) || [];
            sites.push(site);

            $scope.savedSites = sites;
            localStorage.setItem('sites', JSON.stringify(sites));
        };

        $scope.removeFavoriteStation = function(number) {
            var sites = JSON.parse(localStorage.getItem('sites'));

            function remove(idx) {
                sites.splice(idx, 1);
                $scope.savedSites = sites;
                localStorage.setItem('sites', JSON.stringify(sites));
            }

            sites.some(function(site, idx) {
                if (site.Number === number) {
                    remove(idx);
                    return true;
                }
            });
        };

        $scope.getDeparturesForSite = function(siteName) {
            var re = new RegExp(siteName),
                site = $scope.savedSites.filter(function(site) {
                return re.test(site.Name);
            })[0];

            function getSites() {
                if (site) {
                    $scope.getDepartures(site.Number, siteName);
                }
            }

            if (!site) {
                $http.get('/getSite/' + siteName).success(function(data) {
                    site = getArray(data.Hafas.Sites.Site)[0];
                    getSites();
                });
            }
            getSites();
        };

        $scope.getDepartures = function(siteId, siteName) {
            if (!siteId) { displayAlert('Ingen site ID angavs'); return; }
            function massageData(data) {
                var buses = data.Buses.DpsBus,
                    metros = data.Metros.Metro,
                    trains = data.Trains.DpsTrain,
                    trams = data.Trams.DpsTram,
                    dps = _.compact([buses, trams, trains]),
                    resp,
                    letterHash = { BUS: 'Buss', METRO: 'Tunnelbana', TRAIN: 'Tåg', TRAM: 'Spårvagn' },
                    classHash = { BUS: 'tt-icon-bus', METRO: 'tt-icon-metro', TRAIN: 'tt-icon-train', TRAM: 'tt-icon-tram' };

                function getIconClass(key) {
                    return classHash[key];
                }

                function getLetter(key) {
                    return letterHash[key];
                }

                function transformDps(dps) {
                    return {
                        station: dps.StopAreaName,
                        destination: dps.Destination,
                        line: dps.LineNumber,
                        when: dps.DisplayTime,
                        iconClass: getIconClass(dps.TransportMode),
                        transport: getLetter(dps.TransportMode)
                    };
                }


                function transformMetro(metro) {
                    if ("string" !== typeof metro.DisplayRow1 || metro.DisplayRow1 === 'INGEN PÅSTIGNING') { return; }
                    var infoString = TT.Util.getMetroDataFromString(metro.DisplayRow1);
                    return {
                        station: metro.StationName,
                        destination: infoString[2],
                        line: infoString[1],
                        when: infoString[3],
                        iconClass: getIconClass(metro.TransportMode),
                        transport: getLetter(metro.TransportMode)
                    };
                }

                resp = _.flatten(dps.map(getArray)).map(transformDps);

                if (metros) {
                    resp = resp.concat(_.compact(getArray(metros).map(transformMetro)));
                }

                return resp.sort(function(a, b) {
                    function getInt(str) {
                        if ("string" !== typeof str) {
                            return 0;
                        } else if (/^\d+:\d+/.test(str)) { // time has fmt 21:38
                            var time = str.split(':'),
                                hoursDiff = parseInt(time[0], 10) - new Date().getHours(),
                                minutesLeft = parseInt(time[1], 10) + (hoursDiff * 60),
                                minLeftInHour = (hoursDiff * 60) - new Date().getMinutes();
                            return minLeftInHour + minutesLeft;
                        } else {
                            return parseInt(str, 10);
                        }
                    }

                    return getInt(a.when) - getInt(b.when);
                });
            }

            $http.get('/departures/' + siteId)
                .success(function(data) {
                    console.log(data);
                    var timestamp = new Date().getTime();
                    $scope.departureSideId = siteId;
                    $scope.departureStation = siteName;
                    $scope.departures = massageData(data);
                    $scope.departureSearchTimeAgo = moment(timestamp).fromNow();
                    localStorage.setItem('departures', JSON.stringify({
                        station: siteName,
                        siteId: siteId,
                        departures: $scope.departures,
                        timeAgo: timestamp
                    }));
                })
                .error(displayAlert);
        };

        $scope.refreshDepartures = function() {
            $scope.getDepartures($scope.departureSideId, $scope.departureStation);
        };

        $scope.clearDepartures = function() {
            $scope.departures = [];
            $scope.departureStation = undefined;
            localStorage.setItem('departures', JSON.stringify({ station: '', departures: [], timeAgo: 0 }));
        };

        $scope.getTrips = function(to) {
            to = to || $scope.lastTripToId;
            if (!to) { return; }
            $scope.loading = true;

            function getSubTripDestinations(memo, subTrip, idx, arr) {
                if (subTrip.Transport.Type !== "Walk" && idx < (arr.length - 1)) {
                    memo.push(subTrip.Destination["#text"]);
                }
                return memo;
            }

            function getTrip(trip) {
                return {
                    from: trip.Summary.Origin["#text"],
                    to: trip.Summary.Destination["#text"],
                    toId: to,
                    departureTime: trip.Summary.DepartureTime["#text"],
                    arrivalTime: trip.Summary.ArrivalTime["#text"],
                    duration: trip.Summary.Duration,
                    changes: trip.Summary.Changes,
                    via: trip.SubTrip.reduce(getSubTripDestinations, []).join(", ")
                };
            }

            function getQuery() {
                return ['SID=@Y=', $scope.lat,'@X=', $scope.long, '&Z=',to].join('');
            }

            function handleSuccess(data) {
                var resp = data.HafasResponse;
                if (resp.Error) {
                    displayAlert(resp.Error.Description, resp.Error.Number);
                } else {
                    $scope.closeAlert();
                    $scope.trips = resp.Trip.map(getTrip);
                    $scope.lastTripToId = to;
                    localStorage.setItem('trips', JSON.stringify({ trips: $scope.trips, lastTripToId: to }));
                }
                $scope.loading = false;
            }

            if ($scope.lat && $scope.long) {
                $http.get('/reseplanerare/' + getQuery())
                    .success(handleSuccess)
                    .error(displayAlert);
            } else {
                displayAlert('Saknar gps data, ange din position');
                $scope.loading = false;
            }
        };

        $scope.refreshTrips = function() {
            $scope.getTrips();
        };

        $scope.clearTrips = function() {
            $scope.trips = [];
        };

        getLocation();

        $scope.trips = trips.trips;
        $scope.lastTripToId = trips.lastTripToId;
        $scope.savedSites = savedSites;
        $scope.sitesSelection = savedSites[0] && savedSites[0].Number;
        $scope.departureSideId = departures.siteId;
        $scope.departureStation = departures.station;
        $scope.departureSearchTimeAgo = moment(departures.timeAgo).fromNow();
        $scope.departures = departures.departures;
    });
})();