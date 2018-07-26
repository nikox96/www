var db = require("../../config/database_psql.js");
var mysql = require('mysql');
var bcrypt = require("bcryptjs");

var User = {};

User.createUser = function createUser(newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.xpwd, salt, function (err, hash) {
            console.log(hash);
            newUser.xpwd = hash;
            var query = "INSERT INTO portale.users (cage, cuser, xnome, xcogn, xpwd) VALUES ("
                + newUser.cage + ", "
                + mysql.escape(newUser.cuser) + ", "
                + mysql.escape(newUser.xnome) + ", "
                + mysql.escape(newUser.xcogn) + ", "
                + mysql.escape(newUser.xpwd) + ")";
            console.log(query);
            db.query(query
//                , function (queryErr, queryRes) {
                , (queryErr, queryRes) => {
                    if (queryErr) {
                        callback(queryErr, null);
                        console.log("error: " + queryErr);
                    }
                    else {
                        callback(null, mysql.escape(newUser.xpwd));
                        console.log("record ins: " + queryRes);
                    }
                });
        });
    });
};

User.login = function login(cage, xpwd, callback) {
    if (cage < 0 && cage > 10000) {
        callback('Codice agente non numerico o maggiore di 9999', null);
        return;
    }
    var query = "SELECT * FROM portale.users WHERE cage = "
        + cage;
    console.log("se non bestemmio guarda: "+ query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback('Nessun utente trovato', null);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    bcrypt.compare(xpwd.toString(), queryRes[0].xpwd.toString(), function (bcryptErr, bcryptRes) {
                        if (bcryptErr || !(bcryptRes)) {
                            console.log("Username and/or password are wrong!" + bcryptErr);
                            callback("Username and/or password are wrong", null);
                        } else {
                            console.log("Welcome " + queryRes[0].xnome + " " + queryRes[0].xcogn);
                            callback(null, queryRes[0]);
                        }
                    });
                } else {
                    console.log("length: " + queryRes.length);
                    for(const j = 0; j< queryRes.length;j++){
                        console.log("cage: " + queryRes[j].cage);
                        console.log("cuser: " + queryRes[j].cuser);
                    }
                    console.log("Username and/or password are wrong!");
                    callback("Username and/or password are wrong", null);
                }
            }
        });
};

User.findOne = function findOne(cage, callback) {
    db.query("SELECT 1 FROM portale.users WHERE cage = "
        + cage
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    console.log("catà");
                    callback(queryErr, queryRes[0]);
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback(queryErr, null);
        });
};

module.exports = User;
