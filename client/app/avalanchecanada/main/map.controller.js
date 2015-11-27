/* js-hint hacks. */
/* jshint unused:false  */
'use strict';

angular.module('avalancheCanadaApp')
    .controller('MapCtrl', function ($rootScope, $scope, $timeout, $state, Prismic, acForecast, acObservation, obs, auth, $location, acConfig) {

        Prismic.ctx().then(function(ctx){

            $scope.ctx = ctx;

            var query  = '[[:d = at(document.type, "sponsor")] [:d = any(document.tags, ["forecast-sponsor"])]]';
            ctx.api.form('everything').query(query)
                    .ref(ctx.ref).submit(function(err, documents){
                if (err) {
                    $log.error('error getting sponsor from prismic');
                }
                else {
                    $scope.sponsor = documents.results[0];
                }
            });

            Prismic.bookmark('forecast-danger-rating').then(function(doc){
                    $scope.dangerRating = doc;
            });

            Prismic.bookmark('forecast-disclaimer').then(function(doc){
                    $scope.disclaimer = doc;
            });

        });

        var displayedMinFilters = ['all min'];

        angular.extend($scope, {
            current: {},
            drawer: {
                left: {
                    visible: false
                },
                right:{
                    visible: false,
                    enabled: true
                }
            },
            filters: {
                obsPeriod: '7-days',
                minFilters: acConfig.minFilters
            },
            regionsVisible: true,
            expandedDate: false,
            dateFilters :  acConfig.dateFilters,
            minFilters : displayedMinFilters.concat(acConfig.minFilters)
        });

        if($state.current.data && $state.current.data.isLogin) {
            if(!auth.isAuthenticated) {
                auth.signin({authParams: {scope: 'openid profile'}});

                auth.config.auth0lib.on('hidden', function () {
                    if(!auth.isAuthenticated) {
                        $state.go('ac.map');
                    }
                });
            } else {
                $state.go('ac.map');
            }
        }

        if($state.current.data && $state.current.data.isShare) {
            $timeout(function () {
                $scope.current.report = obs;
                $scope.drawer.left.visible = true;
            }, 500);
        } else {
            $scope.obs = obs;
        }

        $scope.showMore = function () {
            $rootScope.pageClass = 'page-down';
            $state.go('ac.more');
        };

        acForecast.fetch().then(function (forecasts) {
            $scope.regions = forecasts;
        });

        $scope.$watch('current.report', function(newValue, oldValue){
            if(newValue && newValue.latlng) {
                $scope.drawer.left.visible = true;
            } else {
                $scope.drawer.left.visible = false;
            }
        });

        $scope.$watch('current.region', function (newRegion, oldRegion) {
            if(newRegion && newRegion !== oldRegion) {
                $scope.drawer.right.visible = false;
                $scope.imageLoaded = false;

                if(!newRegion.feature.properties.forecast) {
                    acForecast.getOne(newRegion.feature.id).then(function (forecast) {
                        newRegion.feature.properties.forecast = forecast;
                    });
                }

                $timeout(function () {
                    $scope.drawer.right.visible = true;
                }, 800);
            }
        });

        $scope.getMinFilters = function(type){
            if(_.indexOf(displayedMinFilters, type) !== -1){
                return true;
            } else {
                return false;
            }
        };

        $scope.toggleFilter = function (filter) {
            if(filter){
                var filterType = filter.split(':')[0];
                var filterValue = filter.split(':')[1];

                if(filterType === 'obsPeriod' && $scope.filters[filterType] !== filterValue) {
                    $scope.filters[filterType] = filterValue;
                    var period = filterValue.replace('-', ':');

                    acObservation.byPeriod(period).then(function (obs) {
                        $scope.obs = obs;
                    });

                    $timeout(function () {
                        //keep behaviour as on MIN Filters
                        //var i = $scope.dateFilters.indexOf(filterValue);
                        //$scope.dateFilters.splice(i, 1);
                        //$scope.dateFilters.unshift(filterValue);
                        $scope.toggleDateFilters();
                    }, 300);
                }

                if (filterType === 'minFilter' && $scope.filters[filterType] !== filterValue){
                   toggleMinFilters(filterValue);
                }

            } else {
                if($scope.filters.obsPeriod === '') {
                    $scope.toggleFilter('obsPeriod:' + $scope.dateFilters[0]);
                } else {
                    $scope.obs = [];
                    $scope.filters.obsPeriod = '';
                }
            }
        };

        $scope.goToSubmitReport = function(){
            $location.path('/submit');
        };

        $scope.toggleForecast = function (){
            $scope.drawer.right.enabled = !$scope.drawer.right.enabled;
            $scope.regionsVisible = !$scope.regionsVisible;
        };

        function toggleMinFilters(filterValue){

            function cleanMinFilters(){
                displayedMinFilters = [];
                $scope.filters.minFilters = [];
            }

            function setAllMinFilters(){
                displayedMinFilters = ['all min'];
                $scope.filters.minFilters = acConfig.minFilters;
            }

            var previousMinFilter = displayedMinFilters[0];

            if( previousMinFilter === 'all min'){
                cleanMinFilters();
            }

            if (filterValue === 'all min'){
                if (previousMinFilter === 'all min'){
                    cleanMinFilters();
                } else{
                    setAllMinFilters();
                }

            } else {
                if(_.indexOf($scope.filters.minFilters, filterValue) !== -1){
                    $scope.filters.minFilters = _.without($scope.filters.minFilters, filterValue);
                } else {
                    $scope.filters.minFilters.push(filterValue);
                }
                displayedMinFilters = $scope.filters.minFilters;
            }
        }

        $scope.toggleDateFilters = function (){
            $scope.expandedDate = !$scope.expandedDate;
        };
    });
