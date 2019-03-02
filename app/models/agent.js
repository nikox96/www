var db = require("../../config/database_psql.js");
var Agente = {};

Agente.find = function find(cage, callback) {
    console.log("ricerca agente");
    if (!(cage) || cage === 'undefined' || cage === null) {
        callback('Codice agente non valorizzato!', null);
        return;
    }

    db.query("SELECT * FROM portale.agenti WHERE cage = $1"
        , [cage]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback(queryErr, null);
                return;
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes[0]);
                    return;
                }
            }
            callback('Nessun agente trovato!', null);
        });
};

Agente.findSub = function findSub(cage, callback) {
    console.log("ricerca subordinati agente");
    if (!(cage) || cage === 'undefined' || cage === null) {
        callback('Codice agente non valorizzato!', null);
        return;
    }

    db.query("SELECT * FROM portale.agenti WHERE capoarea = $1"
        , [cage]
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback(queryErr, null);
                return;
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes);
                    return;
                }
            }
            callback('Nessun subordinato trovato!', null);
        });
};

module.exports = Agente;
