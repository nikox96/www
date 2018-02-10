//database.js

var mysql = require('mysql');

var db = {};

db.user = "portale";
db.password = "portale";
db.database = "portale";
db.host = "localhost";
db.dateStrings = "date";

var sql = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    dateStrings: db.dateStrings
});

sql.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = sql;
