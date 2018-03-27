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
                if (queryRes.rows.length === 0) {
                    callback("Nessun cliente trovato!", null);
                } else {
                    queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                    console.log("record: " + queryRes.length);
                    callback(null, queryRes[0]);
                }
            }
        });
};

Client.insert = function insert(ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, callback) {
    Client.find(ccod, function (findErr, findRes) {
        if (findErr) {
            db.query("INSERT INTO portale.clienti (ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcomm, czona, cage)" +
                " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)"
                , [ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage]
                , (queryErr, queryRes) => {
                    if (queryErr) {
                        console.log("error: " + queryErr);
                        callback(queryErr, null);
                    }
                    else {
                        queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                        callback(null, queryRes[0]);
                    }
                });
        } else {
            console.log("Cliente già censito");
            callback("Cliente già censito!", null);
        }
    });
};
Client.list = function list(ccod, xragsoc, callback) {
    console.log("ricerca lista clienti");
    console.log("ccod " + ccod);
    console.log("xragsoc " + xragsoc);
    xragsoc = "%" + (xragsoc && xragsoc !== '' ? xragsoc : "") + "%";
    var query = "SELECT * FROM portale.clienti WHERE " + (ccod && ccod !== '' ? "ccod = " + ccod + " AND " : "") + "xragsoc ILIKE " + mysql.escape(xragsoc);
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
                console.log("record: " + queryRes.length);
            }
        });
};

module.exports = Client;
