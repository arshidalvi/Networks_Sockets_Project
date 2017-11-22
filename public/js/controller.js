var app = angular.module('StudentTimer', ['ngResource', 'ngMaterial', 'ngAnimate',
    'ngAria', 'ngMessages', 'ui.router', 'circle.countdown'
]);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue');
});

app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('default', {
                url: "/",
                templateUrl: "/public/partials/main.html",
                controller: "Studentctrl"
            })
            .state('grid', {
                url: "/grid",
                templateUrl: "/public/partials/grid.html",
                controller: "Studentctrl"
            })
            .state('studlogin', {
                url: "/studlogin",
                templateUrl: "/public/partials/studlogin.html",
                controller: function ($scope, $stateParams) {
                    $scope.digits = [1, 0, 0, 0];
                }
            })
            .state('teachlogin', {
                url: "/teachlogin",
                templateUrl: "/public/partials/teachlogin.html",
                controller: function ($scope, $stateParams) {
                    $scope.digits = [2, 0, 0, 0];
                }
            })
            .state('signup', {
                url: "/signup",
                templateUrl: "/public/partials/signup.html",
                controller: "Studentctrl"
            })
            .state('studenthome', {
                url: "/studenthome",
                templateUrl: "/public/partials/studenthome.html",
                controller: "Studentctrl"
            })
            .state('teacherhome', {
                url: "/teacherhome",
                templateUrl: "/public/partials/teacherhome.html",
                controller: function ($scope, $stateParams) {
		    $scope.teachlogin = $stateParams.teachlogin;
                    var socket = io.connect('/');
                    socket.emit('teachlogin');
                    socket.emit('liststudents', {
                        teachlogin: $stateParams.teachlogin
                    });
                    $scope.curr = [];
                    $scope.studonline = [];
                    $scope.curr[0] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[1] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[2] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[3] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[4] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[5] = parseInt(Math.floor(Math.random() * 10));
                    $scope.curr[6] = parseInt(Math.floor(Math.random() * 10));
                    currdigits = $scope.curr.join("");
                    socket.emit('teachid', {
                        teachid: currdigits,
                        teachlogin: $stateParams.teachlogin
                    });
                    socket.on('studonline', function (msg) {
                        var blob = msg.list;
                        if (blob) {
                            a = blob.split('%');
                            a = a.filter(function (item, pos) {
                                return a.indexOf(item) == pos;
                            })

                            for (i = 0; i < a.length; i++) {
                                b = a[i].split(',');
                                id = b[0];
                                checkin = b[1];
                                $scope.studonline.push({
                                    id: id,
                                    checkin: checkin
                                });
                            }
                        }
                    });
                },
                params: {
                    teachlogin: null
                }
            })
            .state('studentsuccess', {
                url: "/studentsuccess",
                templateUrl: "/public/partials/studentsuccess.html",
                controller: function ($scope, $stateParams) {
                    var quotes = [
                        "Hey",
                        "Howdy",
                        "Hello There",
                        "Wotcha",
                        "Alright "
                    ];

                    var pics = [
                        "/public/images/moon.jpg",
                        "/public/images/sun.jpg",
                        "/public/images/jupiter.jpg",
                        "/public/images/earth.jpg"
                    ];
                    $scope.randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    $scope.randomPic = pics[Math.floor(Math.random() * pics.length)];

                }

            })
            .state('studentfailure', {
                url: "/studentfailure",
                templateUrl: "/public/partials/studentfailure.html",
                controller: "Studentctrl"
            });

    })
    .controller('Studentctrl', function ($window, $scope, $http, $state) {
        $scope.verf = [];
        $scope.signdigits = [];
        var socket = io.connect('/');


        $scope.Signup = function () {
            digits = $scope.signdigits.join("");
            pass = $scope.userpass;
            $window.localStorage.setItem(digits, pass);
            $state.go("default");
        };

        $scope.Logout = function () {
		$state.go("default");
	};

        $scope.Login = function () {
            id = $scope.id;
            pass = $scope.userpass;
            if ($window.localStorage.getItem(id) == pass && $window.localStorage.getItem(id) !== null) {
                socket.emit('studlogin');

                if (id.match(/^1000/)) {
                    $state.go("studenthome");
                    socket.emit('studid', {
                        studid: id
                    });
                } else {
                    $state.go("teacherhome", {
                        teachlogin: id
                    });
                }
            } else {
                alert("Login details are incorrect!");
            }
        };

        $scope.finished = function () {
            $scope.curr = [];
            $scope.curr[0] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[1] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[2] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[3] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[4] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[5] = parseInt(Math.floor(Math.random() * 10));
            $scope.curr[6] = parseInt(Math.floor(Math.random() * 10));
	    $state.go($state.current, { 
                teachlogin: $scope.teachlogin
	    }, { reload: true});
        };

        $scope.verifyMatch = function () {
            socket.emit('studverify');
            socket.on('teachid', function (msg) {
                $scope.currdigits = msg.teachid;
                var studlogin = msg.studid;
                var teachlogin = msg.teachlogin;

                studdigits = $scope.verf.join("");
                if (studdigits == $scope.currdigits) {
                    socket.emit('studonline', {
                        id: studlogin,
                        teachlogin: teachlogin,
                        checkin: Date()
                    });
                    $state.go("studentsuccess");
                } else {
                    alert("Sorry your code is incorrect, please try again");
                }
            });
        };


    })
    .directive('moveNextOnMaxlength',
        function () {
            return {
                restrict: "A",
                link: function (scope, elem, attrs) {
                    elem.on('input', function (e) {
                        var partsId = attrs.id.match(/focus(\d+)/);
                        var currentId = parseInt(partsId[1]);

                        if (currentId == 7) {
                            return;
                        }
                        var l = elem.val()
                            .length;
                        if (l == elem.attr("maxlength")) {
                            nextElement = document.querySelector('#focus' + (currentId +
                                1));
                            nextElement.focus();
                        }
                    });
                }
            }
        }
    );
