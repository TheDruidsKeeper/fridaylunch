module.exports = {
    reset : reset
};

var _mysql = require('mysql');
var _DB_NAME = "FridayLunch";
var _consts = {
    DB_NAME: "FridayLunch",
    TABLE_WIN_HISTORY: "WinHistory",
    TABLE_IP_ADDRESSES: "IPAddresses"
}

var _client = _mysql.createClient({
    hostname    : process.env.IP,
    user        : process.env.C9_USER,
    database    : "c9"
});

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
    })
}

function init(){
    console.log("Dao initiating");
    // Make sure DB & tables exist
    _client.query("USE " + _consts.DB_NAME, function(useError){
        if (useError === null) return;
        console.log("Creating DB " + _consts.DB_NAME);
       _client.query("CREATE DATABASE " + _consts.DB_NAME, function (createError) {
           if (createError === null) return;
           console.log("Unable to create DB, Dao failed init (" + createError + ")");
           throw createError;
       });
    });
}

init();