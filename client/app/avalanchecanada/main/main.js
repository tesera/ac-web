'use strict';

angular.module('avalancheCanadaApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('ac.map', {
                url: '',
                templateUrl: 'app/avalanchecanada/main/map.html',
                controller: 'MapCtrl',
                resolve: {
                  obs: function (acObservation) {
                    return acObservation.byPeriod('7:days');
                  }
                }
            })
            .state('ac.login', {
                url: 'login',
                templateUrl: 'app/avalanchecanada/main/map.html',
                controller: 'MapCtrl',
                resolve: {
                   obs: function (acObservation) {
                    return acObservation.byPeriod('7:days');
                  }
                },
                data: {
                  isLogin: true
                }
            })
            .state('ac.share', {
                url: '^/share/:title/:subid',
                templateUrl: 'app/avalanchecanada/main/map.html',
                controller: 'MapCtrl',
                resolve: {
                  obs: function ($stateParams, $http) {
                    var opt = {params: {client: 'web'}};
                    return $http.get('/api/min/submissions/' + $stateParams.subid, opt).then(function (res) {
                        return res.data;
                    });
                  }
                },
                data: {
                  isShare: true
                }
            })
            .state('ac.sled', {
                url: '^/sled',
                templateUrl: 'app/avalanchecanada/main/more.html',
                controller: 'MoreCtrl',
                resolve:{
                  sledPage: [function(){
                      return true;
                  }]
                }
            })
            .state('ac.more', {
                url: '^/more',
                templateUrl: 'app/avalanchecanada/main/more.html',
                controller: 'MoreCtrl',
                resolve:{
                  sledPage: [function(){
                      return false;
                  }]
                }
            });
    });

