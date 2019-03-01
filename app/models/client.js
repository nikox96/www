var db = require("../../config/database_psql.js");
var mysql = require('mysql');

var Client = {};

Client.find = function find(ccod, callback) {
    console.log("ricerca cliente codice " + ccod);
    var query = "SELECT *, (case when (select 1 from portale.contratti where ccli = ccod) = 1 then true else false end) as contrattista FROM portale.clienti WHERE ccod = " + ccod;
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback(queryErr, null);
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

Client.delClient = function delClient(ccod, callback) {
    console.log("cancellazione cliente codice " + ccod);
    var query = "DELETE FROM portale.clienti WHERE ccod = " + ccod;
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
                callback(queryErr, null);
            }
            else {
                callback(null, "Cliente eliminato correttamente");
            }
        });
};

Client.insert = function insert(ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel, psco, callback) {
    Client.find(ccod, function (findErr, findRes) {
        if (findErr) {
            db.query("INSERT INTO portale.clienti (ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcomm, czona, cage, cabi, ccab, ncont, ntel, psco)" +
                " VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)"
                , [ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel, (psco == "" ? 0 : psco), (csdi ? (csdi == "" ? '0000000' : csdi) : '0000000')]
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

Client.update = function update(ccod, cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel, psco, csdi, callback) {
    Client.find(ccod, function (findErr, findRes) {
        if (findErr) {
            console.log("Cliente non censito");
            callback("Cliente non censito!", null);
        } else {
            db.query("UPDATE portale.clienti set cpiva = $1, xragsoc=$2, cfis=$3, xcli1=$4, xind=$5, xcom=$6, cprv=$7, ccap=$8, xnaz=$9, xmail=$10, ccat=$11, ctipcomm=$12, czona=$13, cage=$14, cabi=$15, ccab=$16, ncont=$17, ntel=$18, psco=$19, csdi=$21 where ccod = $20"
                , [cpiva, xragsoc, cfis, xcli1, xind, xcom, cprv, ccap, xnaz, xmail, ccat, ctipcom, czona, cage, cabi, ccab, ncont, ntel, (psco == "" ? 0 : psco), ccod, (csdi ? (csdi == "" ? '0000000' : csdi) : '0000000')]
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
        }
    });
};

Client.list = function list(ccod, xragsoc, cage, callback) {
    console.log("ricerca lista clienti");
    console.log("ccod " + ccod);
    console.log("xragsoc " + xragsoc);
    console.log("cage " + cage);
    xragsoc = "%" + (xragsoc && xragsoc !== '' ? xragsoc : "") + "%";
    var query = "SELECT * FROM portale.clienti WHERE " + (ccod && ccod !== '' ? "ccod = " + ccod + " AND " : "") + (cage && cage !== '' && cage !== 9999 ? "cage = " + cage + " AND " : "") + "xragsoc ILIKE " + mysql.escape(xragsoc) + " ORDER BY ccod";
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

Client.getNewCod = function getNewCod(callback) {
    var query = "SELECT MAX(ccod) as newcod FROM portale.clienti";
    //Per i clienti Selvert censiti da piattaforma portale sono dedicati gli ID da 3000 a 3999
    var newCod = 3000;

    db.query(query, (queryErr, queryRes) => {
        if (queryErr) {
            callback(queryErr, null);
            console.log("error: " + queryErr);
        }
        else {
            console.log('newcod: ' + queryRes.rows[0].newcod);
            queryRes.rows[0].newcod = parseInt(queryRes.rows[0].newcod);
            if (queryRes.rows[0].newcod >= 3000 && queryRes.rows[0].newcod < 3999) {
                newCod = queryRes.rows[0].newcod + 1;
                console.log('newCod: ' + newCod);
            } else if (queryRes.rows[0].newcod >= 3999){
                callback("ID clienti Selvert terminati, aumentare il range di ID dedicati!", null);
                return;
            }
            callback(null, newCod);
        }
    });
};

Client.getContr = function getContr(ccod, callback) {
    if (ccod == null || ccod == 0 || ccod == ''){
        callback(null, [{iimp: 0}]);
        return;
    }
    var query = "SELECT iimp FROM portale.contratti WHERE ccli = $1 AND CANNRIF = date_part('year', CURRENT_DATE)";
    db.query(query, [ccod], (queryErr, queryRes) => {
        if (queryErr) {
            callback(queryErr, null);
            console.log("get contratto: " + queryErr);
        }
        else {
            queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
            console.log('risultato getContr: %j', queryRes);
            callback(null, queryRes);
        }
    });
};

module.exports = Client;
