var db = require("../../config/database_psql.js");
var Appoggio = {};

Appoggio.insert = function insert(cage, idOrd, callback) {
    if (cage === '' || !(cage) || !(idOrd) || idOrd === ''){
        callback("parametri non valorizzati", null);
        return;
    }
    db.query("INSERT INTO appoggio cage, idord VALUES ("
        + cage + ", " + idOrd + ")"
        , function (queryErr, queryRes) {
            if (queryErr) {
                callback("errore inserimento appoggio", null);
            }
            else {
                callback(null, "record inserito correttamente");
            }
        });
};

Appoggio.find = function find(cage, idOrd, callback) {
    db.query("SELECT * FROM appoggio WHERE " + (cage && cage !== '' ? "cage = " + cage + " " : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = " + idOrd + " " : "AND 1<>1")
        , function (queryErr, queryRes) {
            if (queryErr) {
                callback("errore lettura appoggio", null);
            }
            else {
                callback(null, 1);
            }
        });
};

Appoggio.delApp = function delApp(cage, idOrd, callback) {
    db.query("DELETE FROM appoggio WHERE " + (cage && cage !== '' ? "cage = " + cage + " " : "1<>1 ")
        + (idOrd && idOrd !== '' ? "AND idOrd = " + idOrd + " " : "AND 1<>1")
        , function (queryErr, queryRes) {
            if (queryErr) {
                callback("errore pulizia appoggio", null);
            }
            else {
                callback(null, 1);
            }
        });
};

module.exports = Appoggio;
