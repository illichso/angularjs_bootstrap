(function(){
    var module = angular.module('demoApp', ['angularBetterPlaceholder', 'ngMockE2E', 'ngRoute'])
        .config(['$provide', '$routeProvider', '$locationProvider', function($provide, $routeProvider, $locationProvider){
            $provide.decorator('$httpBackend', function($delegate){
                var proxy = function(method, url, data, callback, headers){
                    var interceptor = function(){
                        var _this = this,
                            _arguments = arguments;
                        setTimeout(function(){
                            callback.apply(_this, _arguments);
                        }, 700);
                    };
                    return $delegate.call(this, method, url, data, interceptor, headers);
                };
                for(var key in $delegate){
                    proxy[key] = $delegate[key];
                }
                return proxy;
            });
            $routeProvider
                .when('/login', {
                    templateUrl: 'user.tpl.html',
                    controller: 'UserCtrl'
                })
                .when('/report', {
                    templateUrl: 'report.tpl.html',
                    controller: 'ReportCtrl',
                    resolve: {
                        reportdata: ['$http', function($http){
                            return $http.get('report.json').then(function(data){
                                return data.data;
                            });
                        }]
                    }
                })
                .otherwise({redirectTo: '/login'});
            $locationProvider.html5Mode([true]);
        }]).run(function($httpBackend){
            $httpBackend.whenPOST('/login').respond(function(method, url, data){
                var details = angular.fromJson(data);
                if(details.email && details.email === 'test@test.com' && details.password && details.password === "test"){
                    return [200, {loggedIn: true, userid: 'testid'}, {}];

                }else{
                    return [200, {loggedIn: false}, {}];
                }
            });
            $httpBackend.whenGET(/.*/i).passThrough();
        });

    module.factory('UserData', function() {
        var data = {
            email: '',
            password: ''
        };
        return data;
    });

    module.controller("MainCtrl", ['$scope', '$http', function($scope, $http) {}]);
    module.controller("UserCtrl", ['$scope', '$http', '$location', 'UserData',
        function($scope, $http, $location, UserData) {
            $scope.data = UserData;
            $scope.loading = false;
            $scope.postResult = 0;

            $scope.submit = function () {
                $scope.loading = true;
                $http.post('/login', $scope.data).success(function (data) {
                    console.log('Form success', data);
                    if (data.loggedIn) {
                        $scope.postResult = 1;
                        $location.url('/report');
                    } else {
                        $scope.postResult = 2;
                    }
                    $scope.loading = false;
                });
            };
        }]);
    module.controller('ReportCtrl', ['$scope', '$http', 'reportdata', 'UserData',
        function($scope, $http, reportdata, UserData){
            $scope.data = reportdata;
            $scope.userdata = UserData;
        }]);
})();