var db = require("../../config/database_psql.js");
var Appoggio = {};

Appoggio.insert = function insert(cage, idOrd, callback) {
    if (cage === '' || !(cage) || !(idOrd) || idOrd === '') {
        callback("parametri non valorizzati", null);
        return;
    }
    db.query("INSERT INTO portale.appoggio (cage, idOrd) VALUES (($1), ($2))"
        , [cage, idOrd]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
            }
            else {
                callback(null, "record inserito correttamente");
            }
        });
};

Appoggio.find = function find(cage, idOrd, callback) {
    db.query("SELECT * FROM portale.appoggio WHERE " + (cage && cage !== '' ? "cage = ($1)" : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = ($2)" : "")
        , [cage, idOrd]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        });
};

Appoggio.delApp = function delApp(cage, idOrd, callback) {
    db.query("DELETE FROM portale.appoggio WHERE " + (cage && cage !== '' ? "cage = ($1)" : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = ($2)" : "")
        , [cage, idOrd]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log(queryErr);
                callback("errore pulizia appoggio", null);
            }
            else {
                callback(null, queryRes);
            }
        });
};

Appoggio.update = function update(cage, idOrd, xdata, callback) {

    db.query("UPDATE portale.appoggio SET xdata = $1 WHERE " + (cage && cage !== '' ? "cage = ($2)" : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = ($3)" : "AND 1<>1")
        , [xdata, cage, idOrd]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log(queryErr);
                callback("errore pulizia appoggio", null);
            }
            else {
                callback(null, queryRes);
            }
        });
};

module.exports = Appoggio;
