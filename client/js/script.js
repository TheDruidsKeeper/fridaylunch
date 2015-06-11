function onSignInCallback(authResult) {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        document.getElementById('signinButton').setAttribute('style', 'display: none');
        gapi.client.plus.people.get({
            userId: 'me'
        }).execute(handleEmailResponse);
        angular.element('[ng-controller=LunchController]').scope().signInState = true;
    }
    else {
        console.log('Sign-in state: ' + authResult['error']);
    }
}

function apiClientLoaded() {
    gapi.client.load('plus', 'v1');
}

$('.color-black, .color-red, .color-green').click(function() {
    this.className = {
        black: 'color-red',
        red: 'color-green',
        green: 'color-black'
    }[this.className];
});

function handleEmailResponse(resp) {
    //set the user ID, user Token, User FirstName, and User lastName
    var scope = angular.element('[ng-controller=LunchController]').scope();
    scope.$broadcast("userAuth", {
        first_name: resp.name.givenName,
        last_name: resp.name.familyName,
        token: resp.etag,
        display_name: resp.displayName
    });
    scope.$apply();
}
var lunchApp = angular.module('lunchApp', []);

lunchApp.controller('LunchController', ['$scope', '$interval', '$timeout', '$http', function($scope, $interval, $timeout, $http) {
    $scope.IsFriday = true; //(new Date()).getDay() == 5;
    $scope.edit = false;
    $scope.AdminSection = 'Winners';
    $scope.winner = null;
    $scope.location = '';
    $scope.messages = [];
    $scope.roster = [];
    $scope.submissions = [];
    $scope.name = "";
    $scope.user = {};
    $scope.countD = "";
    $scope.text = '';
    $scope.signInState = false;
    var socket = io.connect();
    $scope.locations = null;
    $scope.$on("userAuth", function(event, args) {
        $scope.user.display_name = args.display_name;
        $scope.user.last_name = args.last_name;
        $scope.user.first_name = args.first_name;
        $scope.user.token = args.token;
        $http.post("/users", $scope.user)
            .then(function(response) {
                    // success
                },
                function(response) { // optional
                    // failed
                    console.log(response + "failed");
                }
            );
    });
    $http.get("../winners.json")
        .then(function(response) {
            var winnerData = response.data;
            $.each(winnerData, function(index, value) {
                value.date = new Date(value.date);
            });
            $scope.winners = winnerData;
        });

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
    $scope.getImageNbr = function() {
        var num = Math.floor((Math.random() * 7)); //img dimensions 1300 x 866ish
        var img = "img/pic" + num + ".jpg";
        $('#backgrnd').attr('src', img);
    };
    $scope.submitLocation = function() {
        var sub = {
            name: $scope.user.display_name,
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
        //change this function
        socket.emit('identify', $scope.user.display_name);
    };
    $scope.signOut = function signOut() {
        gapi.auth.signOut();
        $scope.user = null;
        $scope.signInState = false;
        document.getElementById('signinButton').setAttribute('style', 'float: right');
        console.log("Sign Out Button Clicked");
    };
    $scope.$watch('user.display_name', function(newVal, oldVal) {
        localStorage["chat.name"] = $scope.user.display_name;
        socket.emit('identify', $scope.user.first_name);
    });
    if ($scope.IsFriday) {
        window.setInterval(function() {
            $('#cd').html((new Date()).toLocaleTimeString());
        }, 1000);
    }
    $scope.getDayName = function() {
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        return weekday[(new Date()).getDay()];
    };
    $scope.countDown = function() {
        var dayOfWeek = 5;
        var hour = 10;
        var minutes = 55;
        var seconds = 0;
        var daysLeft = dayOfWeek - (new Date().getDay());
        var hoursLeft = hour - (new Date().getHours());
        var minutesLeft = minutes - (new Date().getMinutes());
        var secondsLeft = seconds - (new Date().getSeconds());
        if (secondsLeft < 0) {
            secondsLeft += 60;
            minutesLeft--;
        }
        if (minutesLeft < 0) {
            minutesLeft += 60;
            hoursLeft--;
        }
        if (hoursLeft < 0) {
            hoursLeft += 24;
            daysLeft--;
        }
        if (daysLeft < 0) {
            daysLeft += 7;
        }
        return {
            days: daysLeft,
            hours: hoursLeft,
            minutes: minutesLeft,
            seconds: secondsLeft
        };
    };
    $interval(function() {
        var cd = $scope.countDown();
        $scope.countD = "";
        if (cd.days !== 0) {
            if (cd.days === 1)
                $scope.countD = cd.days + " day and ";
            else
                $scope.countD = cd.days + " days and ";
        }
        if (cd.hours !== 0) {
            if (cd.hours === 1)
                $scope.countD += cd.hours + " hour";
            else
                $scope.countD += cd.hours + " hours";
        }
        if (cd.minutes !== 0) {
            if (cd.minutes === 1)
                $scope.countD += " and " + cd.minutes + " minute";
            else
                $scope.countD += " and " + cd.minutes + " minutes";
        }
        if (cd.seconds !== 0) {
            if (cd.seconds === 1)
                $scope.countD += " and " + cd.seconds + " second";
            else
                $scope.countD += " and " + cd.seconds + " seconds";
        }
    }, 1000);
    $scope.checkAdmin = function() {
        if ($scope.user.display_name == "Michael Malone" || $scope.user.display_name == "Chad Rasmussen") {
            return true;
        }
        else {
            return false;
        }
    };
    $scope.flagItem = function(sub) {
        console.log(sub);
        if (sub.color == undefined) {
            sub.color = "black";
        }
        if (sub.color == "black") {
            $(this).addClass('text-warning');
            sub.color = "red";
        }
        else if (sub.color == "red") {
            $(this).addClass('text-success');
            sub.color = "green";
        }
        else if (sub.color == "green") {
            $(this).removeClass('text-success');
            sub.color = "black";
        }
    };
    $scope.newLocation = function() {
        var n = document.getElementById("newLocationName").innerHTML;
        var p = document.getElementById("newLocationPhone").innerHTML;
        if (n === "" | p === "") {
            alert("Please fill out both Name and Phone spaces");
        }
        var location = {
            "name": n,
            "phone": p
        };
        //console.log(location);
        socket.emit('addLocation', location);
        //addLocation(location);
    };
    $scope.deleteLocation = function() {
        console.log("deleteLocation called");
    };
    $scope.updateLocation = function() {
        console.log("updateLocation called");
    };
    $scope.addToolTip = function() {
        $('[data-toggle="tooltip"]').tooltip();
    };
    $scope.getImageNbr();
}]);