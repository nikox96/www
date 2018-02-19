var db = require("../../config/database_psql.js");
var mysql = require('mysql');

var Client = {};

Client.find = function find(ccod, callback) {
    console.log("ricerca cliente codice " + ccod);
    var query = "SELECT * FROM portale.clienti WHERE ccod = " + ccod;
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                callback(null, queryRes[0]);
                console.log("record: " + queryRes.length);
            }
        });
};

Client.list = function list(ccod, xragsoc, callback) {
    console.log("ricerca lista clienti");
    console.log("ccod " + ccod);
    console.log("xragsoc " + xragsoc);
    xragsoc = "%" + (xragsoc && xragsoc !== '' ? xragsoc : "") + "%";
    var query = "SELECT * FROM portale.clienti WHERE " + (ccod && ccod !== '' ? "ccod = " + ccod + " AND " : "") + "xragsoc LIKE " + mysql.escape(xragsoc);
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                callback(null, queryRes);
                console.log("record: " + queryRes.length);
            }
        });
};

module.exports = Client;
