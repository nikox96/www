var db = require("../../config/database_psql.js");
var Agente = {};

Agente.find = function find(cage, callback) {
    console.log("ricerca agente");
    db.query("SELECT * FROM portale.agenti WHERE cage = "
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

module.exports = Agente;
