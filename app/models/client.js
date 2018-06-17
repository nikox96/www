var db = require("../../config/database_psql.js");
var mysql = require('mysql');

var Client = {};

Client.find = function find(ccod, callback) {
    console.log("ricerca cliente codice " + ccod);
    var query = "SELECT * FROM portale.clienti WHERE ccod = $1";
    console.log(query);
    db.query(query
        , [ccod]
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

Client.insert = function insert(ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel, callback) {
    Client.find(ccod, function (findErr, findRes) {
        if (findErr) {
            db.query("INSERT INTO portale.clienti (ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcomm, czona, cage, cabi, ccab, ncont, ntel)" +
                " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)"
                , [ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel]
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
    var query = "SELECT * FROM portale.clienti WHERE " + (ccod && ccod !== '' ? "ccod = $1 AND " : "") + "xragsoc ILIKE $2";

    db.query(query
        , [ccod, xragsoc]

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

Client.getNewCod = function getNewCod(callback) {
    var query = "SELECT MAX(ccod) as newCod FROM portale.clienti";
    //Per i clienti Selvert censiti da piattaforma portale sono dedicati gli ID da 3000 a 3999
    var newCod = 3000;

    db.query(query, (queryErr, queryRes) => {
        if (queryErr) {
            callback(queryErr, null);
            console.log("error: " + queryErr);
        }
        else {
            if (queryRes.rows[0].newCod >= 3000 && queryRes.rows[0].newCod < 3999) {
                newCod = queryRes.rows[0].newCod++;
            } else if (queryRes.rows[0].newCod >= 3999){
                callback("ID clienti Selvert terminati, aumentare il range di ID dedicati!", null);
                return;
            }
            callback(null, newCod);
        }
    });
};

module.exports = Client;
