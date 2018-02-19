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
                , function (queryErr, queryRes) {
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
    db.query("SELECT * FROM portale.users WHERE cage = "
        + cage
        , function (queryErr, queryRes) {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback('Nessun utente trovato', null);
            }
            else {
                if (queryRes.length > 0) {
                    console.log('sql password: ' + queryRes[0].xpwd);
                    console.log('html passord: ' + xpwd);
                    bcrypt.compare(xpwd.toString(), mysql.escape(queryRes[0].xpwd), function (bcryptErr, bcryptRes) {
                        console.log('compare result: ' + bcryptRes);
                        console.log('compare error: ' + bcryptErr);
                        if (bcryptErr) {
                            console.log("Username and/or password are wrong!" + bcryptErr);
                            callback("Username and/or password are wrong", null);
                        } else {
                            console.log("Welcome " + queryRes[0].xnome + " " + queryRes[0].xcogn);
                            callback(null, queryRes[0]);
                        }
                    });
                } else {
                    console.log("Username and/or password are wrong!");
                    callback("Username and/or password are wrong", null);
                }
            }
        });
};

User.findOne = function findOne(cage, callback) {
    bd.query("SELECT 1 FROM portale.users WHERE cage = "
        + cage
        , function (queryErr, queryRes) {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
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
