//database.js

var mysql = require('mysql');

var db = {};

db.user = "portale";
db.password = "portale";
db.database = "portale";
db.host = "localhost";

var sql = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
});

sql.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = sql;
