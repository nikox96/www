var db = require("../../config/database_psql.js");
var Camp = {};

Camp.getTotal = function getTotal(ccod, callback) {
    //ricerca ordine per codice
    db.query("SELECT SUM(iimp) as itot FROM portale.righe_ordini WHERE ccod = "
        + ccod + " group by ccod"
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes[0].itot);
                    return;
                } else if (queryRes.length == 0) {
                    callback(null, 0);
                    return;
                }
            }
            callback("Errore calcolo totale ordine", null);
        });
};

Camp.getCtvCamp = function getCtvCamp(ccod, callback) {
    //ricerca ordine per codice
    db.query("select sum(t1.iqta*t2.iprz) as itot from portale.camp_ordini as t1 JOIN portale.campioncini as t2 on t1.ccamp = t2.ccod where t1.ccod = $1 group by t1.ccod"
        , [ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes[0].itot);
                    return;
                } else if (queryRes.length == 0) {
                    callback(null, 0);
                    return;
                }
            }
            callback("Errore calcolo controvalore campioncini", null);
        });
};

module.exports = Camp;