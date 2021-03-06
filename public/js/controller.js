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
                controller: function ($scope, $stateParams) {
                    animate();
                }
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
                    $scope.code = Math.floor(Math.random() * (10000000 - 1000000)) + 1000000;
                    $scope.studonline = [];
                    socket.emit('teachid', {
                        teachid: $scope.code,
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
//                $(#myModal).modal('show')
                controller: function ($scope, $stateParams) {
                    var quotes = [
                        "Hey",
                        "Howdy",
                        "Hello There",
                        "Wotcha",
                        "Alright "
                    ];

                    var pics = [
//                        "/public/images/timer_bomb.png",
                         "/public/images/1.jpg",
                         "/public/images/2.jpg",
                         "/public/images/3.jpg",
                         "/public/images/4.jpg",
                         "/public/images/5.jpg",
                         "/public/images/6.jpg",
                         "/public/images/7.jpg",
                         "/public/images/8.jpg",
                         "/public/images/9.jpg",
                         "/public/images/10.jpg",
                         "/public/images/11.jpg",
                         "/public/images/12.jpg",
                         "/public/images/13.jpg",
                         "/public/images/14.jpg",
                         "/public/images/15.jpg",

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
    .controller('Studentctrl', function ($window, $scope, $http, $state, $stateParams) {
        var socket = io.connect('/');

        $scope.Signup = function () {
            id = $scope.id;
            pass = $scope.userpass;
            
            idInput = document.querySelector("#id_input").value;
            if (!$scope.Form.$valid) {
                if (idInput.toString().length != 7) {
                    alert("Valid IDs must contain exactly 7 numbers!");
                } else {
                    alert("Password is required!")
                }
            } else {
                if ($window.localStorage.getItem(id) !== null) {
                    alert("User account has already been created!")
                } else {
                    $window.localStorage.setItem(id, pass);
                    $state.go("default");
                }
            }
        };

        $scope.Logout = function () {
            $state.go("default");
        };

        $scope.Login = function () {
            id = $scope.id;
            pass = $scope.userpass;
            if ($scope.Form.$valid && $window.localStorage.getItem(id) == pass && $window.localStorage.getItem(id) !== null) {
                socket.emit('studlogin');
                if (id.toString().match(/^1000/)) {
                    if ($state.current.name == 'studlogin') {
                        $state.go("studenthome");
                        socket.emit('studid', {
                            studid: id
                        });
                    } else {
                        alert("Students should use the student login portal!");
                    }
                } else {
                    if ($state.current.name == 'teachlogin') {
                        $state.go("teacherhome", {
                            teachlogin: id
                        });
                    } else {
                        alert("Teachers should use the teacher login portal!");
                    }
                }
            } else {
                idInput = document.querySelector("#id_input").value;
                if (idInput.toString().length != 7) {
                    alert("Valid IDs must contain exactly 7 numbers!")
                } else {
                    alert("Login details are incorrect!");
                }
            }
        };

        $scope.finished = function () {
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
                studdigits = document.querySelector("#code_input").value;
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
