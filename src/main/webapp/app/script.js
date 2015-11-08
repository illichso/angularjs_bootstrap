var module = angular.module('demoApp', ['angularBetterPlaceholder', 'ngMockE2E', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap', 'mgcrea.ngStrap.helpers.dimensions'])
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
(function(){

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
            $scope.pageclass = "login";
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
    module.controller('ReportCtrl', ['$scope', '$http', 'reportdata', 'UserData', '$log',
        function($scope, $http, reportdata, UserData, $log){
            $scope.pageclass = "report";
            $scope.data = reportdata;
            $scope.userdata = UserData;

            $scope.predicate = 'name';
            $scope.reverse = false;

            $scope.orderBy = function(predicateName){
                if(predicateName === $scope.predicate){
                    $scope.reverse = !$scope.reverse;
                }else{
                    $scope.predicate = predicateName;
                    $scope.reverse = false  ;
                }
            };

            $scope.sendEmails = function(){
                var emails = [];
                for(var i=0; i<$scope.data.length; i++){
                    if($scope.data[i].selected){
                        $log.info($scope.data[i].email);
                        emails.push($scope.data[i].email);
                    }
                }
                if(emails.length>0){
                    alert('Emails sent to: ' + emails.join(', '));
                }
            };

            $scope.deleteRow = function(row){
                var i;
                for(i = 0; i<$scope.data.length; i++){
                    if($scope.data[i] == row){
                        break;
                    }
                }
                $scope.data.splice(i, 1);
            };
        }]);
})();