//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var schedule = require('node-schedule');
//var dao = require("./server/dao");

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

/*
//  User
function User(){
  var _name = "";
  this.getName = function() { return _name; };
  this.findOrCreate = function(args, callback) {
    _name = args.name;
    return this;
  };
}

var currentUser = new User().findOrCreate({name : "test user"});
console.log(currentUser.getName());
var otherUser = new User().findOrCreate({name : "other test user"});
console.log(otherUser.getName());
*/


//  Routes
router.use(express.static(path.resolve(__dirname, 'client')));

/*
//    Authentication
passport.use(new GoogleStrategy({
    returnURL: 'https://fridaylunch-c9-thedruidskeeper.c9.io/auth/google/return',
    realm: 'https://fridaylunch-c9-thedruidskeeper.c9.io/'
  },
  function(identifier, profile, done) {
    User.findOrCreate({ openId: identifier }, function(err, user) {
      done(err, user);
    });
  }
));
router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/return', 
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));
*/

// Data
var winner = null;
var messages = [];
var sockets = [];
var submissions = [];
var locations = [{
  name: "5 Guys Burgers & Fries",
  phone: "(801) 765-7556"
}, {
  name: "AppleBees",
  phone: "(801) 223-0111"
}, {
  name: "Bam Bams BBQ",
  phone: "(801) 225-1324"
}, {
  name: "Bangkok Grill",
  phone: "(801) 434-8424"
}, {
  name: "Brick Oven",
  phone: "(801) 225-1324"
}, {
  name: "Cafe Rio",
  phone: "(801) 375-5133"
}, {
  name: "California Pizza Kitchen",
  phone: "(801) 765-1777"
}, {
  name: "Chili's",
  phone: "(801) 221-0884"
}, {
  name: "Costa Vida",
  phone: "(801) 225-5220"
}, {
  name: "Denny's",
  phone: "(801) 375-8362"
}, {
  name: "Firehouse Subs",
  phone: "(801) 705-8500"
}, {
  name: "Gandolfo's New York Deli",
  phone: "(801) 377-6442"
}, {
  name: "Great China",
  phone: "(801) 224-2238"
}, {
  name: "Golden Corral",
  phone: "(801) 225-6299"
}, {
  name: "Goodwood BBQ",
  phone: "(801) 224-1962"
}, {
  name: "Guru's",
  phone: "(801) 375-4878"
}, {
  name: "Iggy's",
  phone: "(801) 434-7800"
}, {
  name: "In & Out Burger",
  phone: "No need to call, it's fast food"
}, {
  name: "iHop",
  phone: "(801) 226-1771"
}, {
  name: "La Carreta Peruvian Restaurant",
  phone: "(801) 229-2696"
}, {
  name: "Maria Bonita",
  phone: "(801) 426-9328"
}, {
  name: "Mi Ranchito",
  phone: "(801) 225-9195"
}, {
  name: "Mimi's Cafe",
  phone: "(801) 756-1500"
}, {
  name: "Mountain West Burrito",
  phone: "(801) 805-1870"
}, {
  name: "Nicolitalia",
  phone: "(801) 356-7900"
}, {
  name: "Noodles & Company",
  phone: "(801) 226-0776"
}, {
  name: "Old Spaghetti Factory",
  phone: "(801) 224-6199"
}, {
  name: "Olive Garden",
  phone: "(801) 377-0062"
}, {
  name: "Pizza Pie Cafe",
  phone: "(801) 226-4755"
}, {
  name: "Red Robin",
  phone: "(801) 852-8093"
}, {
  name: "Red Lobster",
  phone: "(801) 724-3500"
}, {
  name: "Ruby River",
  phone: "(801) 371-0648"
}, {
  name: "Rumbi Island Grill",
  phone: "(801) 655-1164"
}, {
  name: "Sizzler",
  phone: "(801) 224-1615"
}, {
  name: "Terra Mia",
  phone: "(801) 226-4757"
}, {
  name: "Texas Roadhouse",
  phone: "(801) 226-2742"
}, {
  name: "Thai Evergreen",
  phone: "(801) 221-3765"
}, {
  name: "Wing Nutz",
  phone: "(801) 655-1433"
}, {
  name: "Zupas",
  phone: "(801) 377-7687"
}];
var loggedIn = null;

// Web Sockets
io.on('connection', function(socket) {
  messages.forEach(function(data) {
    socket.emit('message', data);
  });
  socket.emit('locations', locations);
  socket.emit('submissions', submissions);
  if (winner != null) {
    socket.emit("winner", winner);
  }
  sockets.push(socket);

  socket.on("submission", function(submission) {
    console.log('New submission: ' + submission.location);
    var foundSumission = false;
    submissions.forEach(function(data) {
      if (data.name == submission.name) {
        console.log('updating existing submission');
        data.location = submission.location;
        foundSumission = true;
      }
    });
    if (!foundSumission) {
      submissions.push(submission);
      console.log('Added new submission');
    }
    broadcast('submissions', submissions);
  });

  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
    updateRoster();
  });

  socket.on('message', function(msg) {
    var text = String(msg || '');

    if (!text)
      return;

    socket.get('name', function(err, name) {
      var data = {
        name: name,
        text: text
      };
      broadcast('message', data);
      if (data.name == "Michael Malone" || data.name=="Chad Rasmussen") {
        console.log("Message from Admin: " + data.text);
        switch (data.text) {
          case '/resetdb':
            //dao.reset();
            return;
          case '/resetMessages':
            messages = [];
            return;
          case '/resetWinner':
            ClearWinner();
            return;
          case '/selectWinner':
            SelectWinner();
            return;
          default:
            break;
        }
        if (data.text.indexOf("setVote") === 0) {
          var parts = data.text.split(".");
          console.log("Attempting to modify vote #" + parts[1]);
          if (parts.length > 2)
            submissions[parts[1]] = Function("return " + parts[2])();
          else
            submissions.splice(parts[1], 1);
          broadcast('submissions', submissions);
          return;
        }
      }
      messages.push(data);
    });
  });

  socket.on('identify', function(name) {
    socket.get('name', function(err, oldName) {
      console.log("User changed name from " + oldName + " to " + name);
      socket.set('name', String(name || 'Undocumented' + sockets.length), function(err) {
        updateRoster();
      });
      submissions.forEach(function(submission) {
        if (submission.name === oldName) {
          submission.name = name;
          console.log("Updated existing submission's name.");
          return;
        }
      });
    });
  });
});

function updateRoster() {
  async.map(
    sockets,
    function(socket, callback) {
      socket.get('name', callback);
    },
    function(err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function(socket) {
    socket.emit(event, data);
  });
}

// Scheduled job to auto-select the winner. Reference: https://www.npmjs.com/package/node-schedule
// ToDo: after testing, replace the rule with {dayOfWeek: 5, hour: 10, minute: 55}
// jobScheduler.Rules.Winner
// Testing schedule: "*/5 * * * *"
var jobScheduler = {
  Rules: {
    Winner: {
      dayOfWeek: 5,
      hour: 10,
      minute: 55
    },
    ClearWinner: {
      dayOfWeek: 5,
      hour: 15,
      minute: 0
    }
  },
  Jobs: {}
};

function SelectWinner(){
  console.log((new Date()).toUTCString() + ': Winner job triggered');
  if (submissions.length === 0) {
    console.log("no submissions");
    return;
  }
  do {
    winner = submissions[Math.floor(Math.random() * submissions.length)];
  } while (!winner || winner === '');
  console.log(winner);
  winner.participants = submissions.length;
  locations.forEach(function(data) {
    if (winner.location === data.name) {
      winner.phone = data.phone;
      return;
    }
  });
  submissions = [];
  broadcast("submissions", submissions);
  broadcast("winner", winner);
}

function ClearWinner() {
  console.log((new Date()).toUTCString() + ': clear job triggered');
  winner = null;
  broadcast("winner", winner);
}

jobScheduler.Jobs.Winner = schedule.scheduleJob(jobScheduler.Rules.Winner, SelectWinner);
jobScheduler.Jobs.ClearWinner = schedule.scheduleJob(jobScheduler.Rules.ClearWinner,ClearWinner);

process.on('uncaughtException', function(err) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('SIGTERM', function() {
  console.error("SIGTERM - shutting down.");
  server.close();
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
