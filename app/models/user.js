var db = require("../../config/database_psql.js");
var mysql = require('mysql');
var bcrypt = require("bcryptjs");

var User = {};

User.createUser = function createUser(newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.xpwd, salt, function (err, hash) {
            console.log(hash);
            newUser.xpwd = hash;
            var query = "INSERT INTO portale.users (cage, cuser, xnome, xcogn, xpwd) VALUES ($1, $2, $3, $4, $5)";
            
            db.query(query
                , [newUser.cage, newUser.cuser, newUser.xnome, newUser.xcogn, newUser.xpwd]
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
    var query = "SELECT * FROM portale.users WHERE cage = $1";
    
    db.query(query
        , [cage]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback('Nessun utente trovato', null);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    bcrypt.compare(xpwd.toString(), mysql.escape(queryRes[0].xpwd), function (bcryptErr, bcryptRes) {
                        if (bcryptErr) {
                            callback("Username and/or password are wrong", null);
                        } else {
                            callback(null, queryRes[0]);
                        }
                    });
                } else {
                    callback("Username and/or password are wrong", null);
                }
            }
        });
};

User.findOne = function findOne(cage, callback) {
    db.query("SELECT 1 FROM portale.users WHERE cage = $1"
        , [cage]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
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
