// on load we want to find out what day it is, if it is friday, display .container
// if it is not friday we could display a countdown to friday. along with the button for past winners
function onSignInCallback(authResult) {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        document.getElementById('signinButton').setAttribute('style', 'display: none');
        gapi.client.plus.people.get({
            userId: 'me'
        }).execute(handleEmailResponse);
    }
    else {
        console.log('Sign-in state: ' + authResult['error']);
    }
}

function apiClientLoaded() {
    gapi.client.load('plus', 'v1');
}

function handleEmailResponse(resp) {
    angular.element('[ng-controller=LunchController]').scope().user=resp.displayName;
    angular.element('[ng-controller=LunchController]').scope().$apply();
}

//Script to find out what day it is
function dayFinder() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
    //d = 5;
    if (d !== 5) {
        document.getElementById("day").innerHTML = (n + " Lunch?");
        document.getElementById("message").innerHTML = ("Um... today is " + n + ", you are on your own today.");
        var form = document.getElementById("form");
        form.style.display = 'none';
    }
    else {
        var int1 = setInterval(function() {
                var currentHour = new Date().getHours();
                var currentMin = new Date().getMinutes();
                var currentSec = new Date().getSeconds();
                if (currentMin < 10)
                    currentMin = ("0" + currentMin);
                if (currentSec < 10)
                    currentSec = ("0" + currentSec);
                $('#cd').html(currentHour + ":" + currentMin + ":" + currentSec);
                document.getElementById("day").innerHTML = (n + " Lunch!");
                document.getElementById("message").innerHTML = ("Each person may input ONE suggestion for a Friday Lunch location. Suggestions may be changed, but all suggestions must be submitted BEFORE the specified time or they will not be counted. Once all suggestions are in, a random suggestion will automatically be drawn at 10:55 AM.");
                var pastWinnerButton = document.getElementById("nonFriday");
                pastWinnerButton.style.display = 'none';
            }, 500); //check time on 1s
    }
}

var lunchApp = angular.module('lunchApp', []);

lunchApp.controller('LunchController', ['$scope', '$timeout',
    function($scope, $timeout) {
        $scope.winner = null;
        $scope.location = '';
        $scope.messages = [];
        $scope.roster = [];
        $scope.submissions = [];
        $scope.name = localStorage["chat.name"] || "";
        $scope.text = '';
        var socket = io.connect();
        $scope.locations = [];
        $scope.winners = [{
            location: "Goodwood",
            name: "Elissa",
            participants: "21",
            date: new Date("January 23, 2015")
        },{
            location: "Cafe Rio",
            name: "",
            participants: "",
            date: new Date("January 16, 2015")
        },{
            location: "JCW's",
            name: "",
            participants: "",
            date: new Date("January 9, 2015")
        },{
            location: "California Pizza Kitchen",
            name: "Elyse",
            participants: "",
            date: new Date("January 2, 2015")
        },{
            location: "Cafe Rio",
            name: "",
            participants: "12",
            date: new Date("December 19, 2014")
        }, {
            location: "Olive Garden",
            name: "Melissa",
            participants: "10",
            date: new Date("December 12, 2014")
        }, {
            location: "iHop",
            name: "Elissa",
            participants: "11",
            date: new Date("December 05, 2014")
        }, {
            location: "Zupas",
            name: "Katie",
            participants: "13",
            date: new Date("November 21, 2014")
        }, {
            location: "Goodwood",
            name: "Jacob",
            participants: "14",
            date: new Date("November 14, 2014")
        }, {
            location: "Mi Ranchito",
            name: "Elyse",
            participants: "12",
            date: new Date("November 07, 2014")
        }, {
            location: "Texas Roadhouse",
            name: "Jason",
            participants: "15",
            date: new Date("October 31, 2014")
        }, {
            location: "Applebees",
            name: "Melissa",
            participants: "12",
            date: new Date("October 24, 2014")
        }, {
            location: "5 Guys Burgers and Fries",
            name: "Justin",
            participants: "14",
            date: new Date("October 17, 2014")
        }, {
            location: "Olive Garden",
            name: "Melissa",
            participants: "12",
            date: new Date("October 10, 2014")
        }, {
            location: "Wild Mustang",
            name: "Jordan",
            participants: "13",
            date: new Date("October 03, 2014")
        }, {
            location: "Texas Roadhouse",
            name: "Summer",
            participants: "14",
            date: new Date("September 26, 2014")
        }, {
            location: "Golden Corral",
            name: "Brad",
            participants: "18",
            date: new Date("September 19, 2014")
        }, {
            location: "California Pizza Kitchen",
            name: "Josh",
            participants: "9",
            date: new Date("September 12, 2014")
        }, {
            location: "iHop",
            name: "Elissa",
            participants: "11",
            date: new Date("September 05, 2014")
        }, {
            location: "Red Robin",
            name: "Ben",
            participants: "15",
            date: new Date("August 29, 2014")
        }, {
            location: "Noodles and Company",
            name: "Danny",
            participants: "18",
            date: new Date("August 22, 2014")
        }, {
            location: "Smash Burger",
            name: "Danny",
            participants: "15",
            date: new Date("August 15, 2014")
        }, {
            location: "otihcnaR iM",
            name: "Danny",
            participants: "16",
            date: new Date("August 08, 2014")
        }, {
            location: "Chilis",
            name: "Katie",
            participants: "10",
            date: new Date("August 01, 2014")
        }, {
            location: "Red Lobster",
            name: "Melissa",
            participants: "9",
            date: new Date("July 25, 2014")
        }, {
            location: "Ruby River",
            name: "Ben",
            participants: "16",
            date: new Date("July 18, 2014")
        }, {
            location: "Goodwood",
            name: "Alison",
            participants: "15",
            date: new Date("July 11, 2014")
        }, {
            location: "sizzlers",
            name: "Melissa",
            participants: "7",
            date: new Date("July 03, 2014")
        }, {
            location: "5 Guys Burgers and Fries",
            name: "Ben",
            participants: "11",
            date: new Date("June 27, 2014")
        }, {
            location: "Olive Garden",
            name: "Tim",
            participants: "9",
            date: new Date("June 20, 2014")
        }, {
            location: "Wallabys",
            name: "Austin",
            participants: "10",
            date: new Date("June 13, 2014")
        }, {
            location: "Red Robin",
            name: "Ben",
            participants: "13",
            date: new Date("June 06, 2014")
        }, {
            location: "Texas Road House",
            name: "Danny",
            participants: "8",
            date: new Date("May 30, 2014")
        }, {
            location: "Mi Ranchito",
            name: "Elissa",
            participants: "12",
            date: new Date("May 23, 2014")
        }, {
            location: "Wild Mustang",
            name: "Summer",
            participants: "9",
            date: new Date("May 16, 2014")
        }, {
            location: "Red Robin",
            name: "Andy",
            participants: "12",
            date: new Date("May 09, 2014")
        }, {
            location: "Goodwood",
            name: "Jacob",
            participants: "10",
            date: new Date("May 02, 2014")
        }, {
            location: "Noodles and Co",
            name: "Melissa",
            participants: "16",
            date: new Date("April 25, 2014")
        }, {
            location: "Texas Road House",
            name: "Elyse",
            participants: "10",
            date: new Date("April 18, 2014")
        }, {
            location: "Red Robin",
            name: "Jordan",
            participants: "14",
            date: new Date("April 11, 2014")
        }, {
            location: "5 Guys Burgers and Fries",
            name: "Jacob",
            participants: "14",
            date: new Date("April 04, 2014")
        }, {
            location: "Goodwood",
            name: "Austin",
            participants: "13",
            date: new Date("March 28, 2014")
        }, {
            location: "Mi Ranchito",
            name: "Dan",
            participants: "12",
            date: new Date("March 21, 2014")
        }, {
            location: "Jasmine Thai",
            name: "Danielle",
            participants: "11",
            date: new Date("March 14, 2014")
        }, {
            location: "Texas Road House",
            name: "Melissa",
            participants: "11",
            date: new Date("March 07, 2014")
        }, {
            location: "Chilis",
            name: "Ben",
            participants: "8",
            date: new Date("February 28, 2014")
        }, {
            location: "Olive Garden",
            name: "Dan",
            participants: "7",
            date: new Date("February 21, 2014")
        }, {
            location: "Firehouse Subs",
            name: "Austin",
            participants: "8",
            date: new Date("February 14, 2014")
        }, {
            location: "Texas Road House",
            name: "Elyse",
            participants: "2",
            date: new Date("February 07, 2014")
        }, {
            location: "Pizza Pie Cafe",
            name: "Michael",
            participants: "10",
            date: new Date("January 31, 2014")
        }, {
            location: "Red Robin",
            name: "Jordan",
            participants: "9",
            date: new Date("January 24, 2014")
        }, {
            location: "Mi Ranchito",
            name: "Dan",
            participants: "6",
            date: new Date("January 17, 2014")
        }, {
            location: "Zupas",
            name: "Melissa",
            participants: "8",
            date: new Date("January 10, 2014")
        }, {
            location: "Mimis Cafe",
            name: "Brett Hansen",
            participants: "7",
            date: new Date("January 03, 2014")
        }, {
            location: "Texas Road House",
            name: "Danny",
            participants: "6",
            date: new Date("December 27, 2013")
        }, {
            location: "Noodles and Co",
            name: "Jason",
            participants: "9",
            date: new Date("December 20, 2013")
        }];
        // Socket event handlers
        socket.on('connect', function() {
            $scope.setName();
        });
        socket.on('locations', function(locationsArray) {
            $scope.locations = locationsArray;
            $scope.$apply();
            $timeout(function() {
                $('.combobox').combobox();
            });
        });
        socket.on('message', function(msg) {
            $scope.messages.push(msg);
            $scope.$apply();
            $('#chatWindow').animate({
                scrollTop: $('#chatWindow')[0].scrollHeight
            });
        });
        socket.on('roster', function(names) {
            $scope.roster = names;
            $scope.$apply();
        });
        socket.on('submissions', function(sub) {
            $scope.submissions = sub;
            $scope.$apply();
        });
        socket.on('winner', function(winner) {
            $scope.winner = winner;
            console.log(winner);
            $scope.$apply();
        });
        // Scope actions
        $scope.submitLocation = function() {
            var sub = {
                name: $scope.name,
                location: $scope.location
            };
            socket.emit('submission', sub);
            console.log("Submission sent: " + sub.location);
        };
        $scope.send = function send() {
            console.log('Sending message:', $scope.text);
            socket.emit('message', $scope.text);
            $scope.text = '';
            $('#chatWindow').animate({
                scrollTop: $('#chatWindow')[0].scrollHeight
            });
        };
        $scope.setName = function setName() {
            localStorage["chat.name"] = $scope.user;
            $scope.name = $scope.user;
            socket.emit('identify', $scope.user);
        };
        $scope.signOut = function signOut() {
          gapi.auth.signOut();
          $scope.user = null;
          document.getElementById('signinButton').setAttribute('style', 'display: default');
          console.log("Sign Out Button Clicked");
        };
        $scope.$watch('user', function(newVal, oldVal){
            localStorage["chat.name"] = $scope.user;
            socket.emit('identify', $scope.user);
            console.log(newVal, oldVal);
        });
    }
]);