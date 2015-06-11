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
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var dao = require("./server/dao");

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

//  User
// function User(){
//   var _token = "";
//   var _ID = null;
//   this.getToken = function() { return _token; };
//   this.findOrCreate = function(args, callback) {
//     forEach()
//     _token = args.token;
//     _ID = users.length;
//     return this;
//   };
// }

/*
var currentUser = new User().findOrCreate({name : "test user"});
console.log(currentUser.getName());
var otherUser = new User().findOrCreate({name : "other test user"});
console.log(otherUser.getName());
*/


//  Routes
router.use(express.static(path.resolve(__dirname, 'client')));
router.use(bodyParser.json());
router.post('/users', function (req, res) {
  console.log(req.body);
  res.json({success : true});
});
/*
//    Authentication
passport.use(new GoogleStrategy({
    returnURL: 'https://fridaylunch-thedruidskeeper.c9.io//auth/google/return',
    realm: 'hhttps://fridaylunch-thedruidskeeper.c9.io/'
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
var winners = [];
var messages = [];
var sockets = [];
var submissions = [];
var locations = [];
var users = [];
//when a user connects, chekc if their token exists in the user table, if not, add them
// if they do exist use the name associated with that user Token
dao.getLocations(function(args){
  locations = args.locations;
});

// dao.getWinners(function(args){
//   winners = args.winners;
// });

// locations.forEach(function(location) {
//   dao.addLocation(location);
// });

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
  socket.set('name', String('Undocumented' + sockets.length), function(err) {
    updateRoster();
    //use token not name
    //check database for user
  });
  socket.on('addLocation', function(location) {
    console.log("Adding Location: " + location);
    dao.addLocation({
      name : location.name,
      phone : location.phone
    });
    dao.getLocations(function(args){
      locations = args.locations;
      broadcast("locations", locations);
    });
  });
  socket.on("submission", function(submission) {
    console.log('New submission: ' + submission.location);
    var foundSumission = false;
    submissions.forEach(function(data) {
      if (data.name == submission.name) {
        console.log('updating existing submission');
        data.location = submission.location;
        foundSumission = true;
      }
      if(!submission.name || submission.name==''){
        submission.splice(this,1);
      }
    });
    if (!foundSumission) {
      submissions.push(submission);
      console.log('Added new submission');
    }
    submissions.clean = function(deleteValue){
      for(var i=0; i < this.length; i++){
        if(this[i].name == deleteValue || this[i].location == deleteValue){
          this.splice(i,1);
          i--;
        }
      }
    };
    submissions.clean(undefined);
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
      if (data.name == "Michael Malone" || data.name=="Chad") {
        console.log("Message from Admin: " + data.text);
        switch (data.text) {
          case '/resetdb':
            //dao.reset();
            return;
          case '/resetMessages':
            messages = [];
            messages.forEach(function(data) {
              socket.emit('message', data);
            });
            return;
          case '/resetWinner':
            ClearWinner();
            return;
          case '/selectWinner':
            SelectWinner();
            return;
        	case '/updateLocations':
        			socket.emit('locations', locations);
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
      console.log("User is changing name from " + oldName + " to " + name);
      if (name !== null && name !== "") {
        socket.set('name', name, function(err) {
          updateRoster();
        });
        submissions.forEach(function(submission) {
          if (submission.name === oldName) {
            submission.name = name;
            console.log("Updated existing submission's name.");
            return;
          }
        });
      }
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
    },
    LogWinner: {
      dayOfWeek: 5,
      hour: 10,
      minute: 56
    }
  },
  Jobs: {}
};

function SelectWinner(){
  submissions.clean = function(deleteValue){
      for(var i=0; i < this.length; i++){
        if(this[i].name == deleteValue || this[i].location == deleteValue){
          this.splice(i,1);
          i--;
        }
      }
    };
    submissions.clean(undefined);
  console.log((new Date()).toUTCString() + ': Winner job triggered');
  if (submissions.length === 0) {
    console.log("no submissions");
    return;
  }
  do {
    winner = submissions[Math.floor(Math.random() * submissions.length)];
  } while (!winner || winner === '' || winner.location === 'Not Voting, but attending');
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

function LogWinner() {
  console.log("Logging Winner Data");
  //put winner user_id  and location_id and participants and the_date into winner table
}

function ClearWinner() {
  console.log((new Date()).toUTCString() + ': clear job triggered');
  winner = null;
  broadcast("winner", winner);
}

jobScheduler.Jobs.Winner = schedule.scheduleJob(jobScheduler.Rules.Winner, SelectWinner);
jobScheduler.Jobs.ClearWinner = schedule.scheduleJob(jobScheduler.Rules.ClearWinner,ClearWinner);
jobScheduler.Jobs.LogWinner = schedule.scheduleJob(jobScheduler.Rules.LogWinner, LogWinner);

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
