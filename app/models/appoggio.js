var db = require("../../config/database_psql.js");
var Appoggio = {};

Appoggio.insert = function insert(cage, idOrd, callback) {
    if (cage === '' || !(cage) || !(idOrd) || idOrd === '') {
        callback("parametri non valorizzati", null);
        return;
    }
    db.query("INSERT INTO portale.appoggio cage, idOrd VALUES ("
        + cage + ", " + idOrd + ")"
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback("errore inserimento appoggio", null);
            }
            else {
                callback(null, "record inserito correttamente");
            }
        });
};

Appoggio.find = function find(cage, idOrd, callback) {
    db.query("SELECT * FROM portale.appoggio WHERE " + (cage && cage !== '' ? "cage = " + cage + " " : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = " + idOrd + " " : "")
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
    db.query("DELETE FROM portale.appoggio WHERE " + (cage && cage !== '' ? "cage = " + cage + " " : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = " + idOrd + " " : "AND 1<>1")
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback("errore pulizia appoggio", null);
            }
            else {
                callback(null, 1);
            }
        });
};

module.exports = Appoggio;
