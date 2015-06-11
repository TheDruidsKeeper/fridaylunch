module.exports = {
    reset : reset,
    addLocation : addLocation,
    getLocations : getLocations
    // getWinners : getWinners
};

var _mysql = require('mysql'); // https://www.npmjs.com/package/mysql
var _consts = {
    DB_NAME: "FridayLunch",
    TABLE_LOCATIONS: "location",
    TABLE_TOKENS: "token",
    TABLE_USERS: "user",
    TABLE_WINNERS: "winner"
};
var _client;

function open(callback) {
    var start = new Date().getMilliseconds();
    _client.ping(function() {
        var tte = (new Date().getMilliseconds()) - start;
        console.log("Ping response in " + tte + "ms");
        callback();
    });
}

function reset(){
    _client.query("DROP DATABASE " + _consts.DB_NAME, function(dropError) {
        if (dropError !== null) {
            console.log("Dao reset failed (" + dropError + ")");
            throw dropError;
        }
        console.log("DB dropped");
        init();
    });
}

function addLocation (location){
    _client.query("INSERT INTO location (name, phone) VALUES (?, ?)", [location.name, location.phone], function(error, info){
        if (error != null) throw error;
        console.log("Location added: " + info.insertId);
        location.location_id = info.insertId;
    });
}
function getLocations(callback){
    _client.query("SELECT * FROM location order by name", [], function(error, results, info){
        if (error != null) throw error;
        var locations = [];
        results.forEach(function(row){
            locations.push({
                location_id: row.location_id,
                name: row.name,
                phone: row.phone
            });
        });
        callback({
            locations:locations
        });
    });
}

// function getWinners(callback){
//     _client.query("SELECT * FROM winner", [], function(error, results, info){
//         if (error != null) throw error;
//         var winners = [];
//         results.forEach(function(row){
//             winners.push({
//                 winner_id: row.winner_id,
//                 user_id: row.user_id,
//                 location_id: row.location_id,
//                 participants: row.participants,
//                 the_date: row.the_date
//             });
//         });
//         callback({
//             winners:winners
//         });
//     });
// }
// function addWinner(winner){
//     _client.query("INSERT INTO winner (/*ref to user id, location id/*) VALUES ()", [], function(error,info){
//       if (error != null) throw error;
//       console.log("winner Added: " + info.insertId);
//       winner.winner_id = info.insertId;
//     });
// }
// function addUser(user){
//     _client.query("INSERT INTO user (first_name, last_name) VALUES(?,?)", [user.first_name, user.last_name], function(error, info) {
//         if(error != null) throw error;
//         console.log("User added: " + info.insertId);
//         user.user_id = info.insertId;
//     });
// }
function init(){
    console.log("Dao initiating");
    _client = _mysql.createConnection({
        host        : process.env.IP,
        user        : process.env.C9_USER
    });
    // Make sure DB & tables exist
    _client.query("USE " + _consts.DB_NAME, function(useError){
        if (useError != null) throw useError;
    });
}
init();

//DB Create command line: \. /home/ubuntu/workspace/server/dbSetup.sql