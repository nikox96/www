var db = require("../../config/database_psql.js");
var mysql = require('mysql');
var Prodotto = require("./product.js");

var Ordine = {};

Ordine.find = function find(ccod, callback) {
    //ricerca ordine per codice
    db.query("SELECT * FROM portale.ordini WHERE ccod = $1"
        , [ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes[0]);
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback("Nessun ordine trovato", null);
        });
};

Ordine.delOrder = function delOrder(ccod, cstt, callback) {
    db.query("SELECT cstt FROM portale.ordini WHERE ccod = $1"
        , [ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0 && queryRes[0].cstt !== cstt) {
                    //ricerca ordine per codice
                    db.query("DELETE FROM portale.ordini WHERE ccod = $1"
                        , [ccod]
//                        , function (delErr, delRes) {
                        , (delErr, delRes) => {
                            if (delErr) {
                                console.log(delErr);
                            }
                            else {
                                delRes = (delRes.rows && delRes.rows.length > 0 ? delRes.rows : delRes);
                                db.query("DELETE FROM portale.righe_ordini WHERE ccod = $1"
                                    , [ccod]
//                                    , function (err2, res2) {
                                    , (err2, res2) => {
                                        if (err2) {
                                            console.log("errore canc righe ordini");
                                        } else {
                                            callback(null, "Cancellato sia ordine che dettaglio");
                                            return
                                        }
                                        callback("Errore cancellazione dettaglio: comunicare n° ordine all'amministratore: " + ccod, null);
                                    });
                                return;
                            }
                            callback("Errore cancellazione ordine", null);
                        });
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback("Ordine non revocabile", null);
        });
};

Ordine.findProduct = function findProduct(ccod, callback) {
    //ricerco i prodotti per un determinato ordine
    db.query("SELECT * FROM portale.righe_ordini WHERE ccod = $1"
        , [ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes);
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback("Errore ricerca prodotti dell'ordine", null);
        });
};

Ordine.updateCondPag = function updateCondPag(ccod, cond_pag, callback) {
    //aggiorno condizione di pagamento ordine
    var query = "UPDATE portale.ordini SET ccondpag = " + cond_pag + " WHERE ccod = "
        + ccod;

    db.query("UPDATE portale.ordini SET ccondpag = $1 WHERE ccod = $2"
        , [cond_pag, ccod]
//             , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback("Errore in aggiornamento record", null);
            }
            else {
                callback(null, "Condizione di pagamento ordine aggiornato correttamente");
            }
        });
};

Ordine.updateStatus = function updateStatus(ccod, cstt, xnote, callback) {
    //aggiorno lo status dell'ordine
    db.query("UPDATE portale.ordini SET cstt = $1, xnote = $2 WHERE ccod = $3"
        , [cstt, xnote, ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback("Errore in aggiornamento record", null);
            }
            else {
                callback(null, "Stato ordine aggiornato correttamente");
            }
        });
};

Ordine.updateCcli = function updateCcli(ccod, ccli, callback) {
    //aggiorno lo status dell'ordine
    db.query("UPDATE portale.ordini SET ccli = $1 WHERE " + (ccod && ccod !== '' ? "ccod = $2" : "1<>1")
        , [ccli, ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback("Errore in aggiornamento record", null);
            }
            else {
                callback(null, "Codice cliente ordine aggiornato correttamente");
            }
        });
};

Ordine.newOrder = function newOrder(ctiprec, ccli, cage, callback) {
    db.query("INSERT INTO portale.ordini (nreg, ctiprec, ctipdoc, dreg, ccli, cval, cimp, cstt, cage)"
        + " VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ccod"
        , [999, ctiprec, 701, new Date(), 0, 'EUR', 1, 10, cage]
//                , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback('Errore inserimento ordine', null);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes[0].ccod);
            }
        });
};

Ordine.newOrderProduct = function newOrderProduct(ccod, ccodprod, iqta, callback) {
    //ricerco il prodotto da inserire
    Prodotto.find(ccodprod, function (err, res) {
        if (err) {
            callback('Prodotto inesistente', null);
        } else {
            //calcolo importo
            var iimp = res.iprz * iqta;

            //se il prodotto era già presente nel carrello per quest'ordine allora aggiorno quantità e importo
            db.query("SELECT 1 FROM portale.righe_ordini WHERE ccod = $1 AND ccodprod = $2"
                , [ccod, ccodprod]
//                , function (queryErr, queryRes) {
                , (queryErr, queryRes) => {
                    queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                    if (queryErr || queryRes.rowCount === 0 || (queryRes.length && queryRes.length <= 0)) {
                        console.log('insert order prod');
                        db.query("INSERT INTO portale.righe_ordini (ccod, ccodprod, iqta, iimp)"
                            + " VALUES($1, $2, $3, $4)"
                            , [ccod, ccodprod, iqta, iimp]
//                            , function (queryErr, queryRes) {
                            , (queryErr, queryRes) => {
                                if (queryErr) {
                                    console.log('errore insert prod: ' + queryErr);
                                    callback('Errore inserimento prodotto', null);
                                }
                                else {
                                    console.log('insert prod res: ' + queryErr);
                                    callback(null, "Prodotto inserito corretamente");
                                }
                            });
                    }
                    else {
                        db.query("UPDATE portale.righe_ordini SET iqta = $1, iimp = $2"
                            + " WHERE ccod = $3 AND ccodprod = $4"
                            , [iqta, iimp, ccod, ccodprod]
//                            , function (queryErr, queryRes) {
                            , (queryErr, queryRes) => {
                                if (queryErr) {
                                    callback("Errore aggiornamento prodotto", null);
                                }
                                else {
                                    callback(null, "Prodotto aggiornato");
                                }
                            });
                    }
                });

        }
    });
};

Ordine.getUserOrder = function getUserOrder(cage, cstt, xcli, callback) {
    //ricerca ordine per codice agente/status/cliente
    var query = "SELECT a.*, b.iimp, c.xragsoc " +
        "FROM " +
        "(SELECT ccod, dreg, cstt, cage, ccli " +
        "FROM portale.ordini)  AS a, " +
        "(SELECT ccod, SUM(iimp) AS iimp " +
        "FROM portale.righe_ordini " +
        "GROUP BY ccod) AS b, " +
        "(SELECT ccod, xragsoc " +
        "FROM portale.clienti) AS c " +
        "WHERE a.ccod = b.ccod AND a.ccli = c.ccod "
        + (cage && cage !== '' ? "AND a.cage = $1": "AND 1 <> 1")
        + (cstt && cstt !== '' ? " AND a.cstt = $2"  : "")
        + (xcli && xcli !== '' ? " AND c.xragsoc like $3" : "");
    console.log(query);
    db.query(query
        , [cage, cstt, "%" + xcli + "%"]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes);
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback("Nessun ordine trovato", null);
        });
};

Ordine.updateNreg = function updateNreg(ccod, callback) {
    db.query("SELECT max(nreg) AS nreg FROM portale.ordini WHERE cstt = 50"
//             , function (nregErr, nregRes) {
        , (nregErr, nregRes) => {
            if (nregErr) {
                callback('Nessun numero di registrazione presente in archivio', null);
            } else {
                console.log('nreg length: ' + nregRes.rows.length);
                console.log('nreg max: ' + nregRes.rows[0].nreg);
                nregRes = (nregRes.rows && nregRes.rows.length > 0 ? nregRes.rows : nregRes);
                //se non è presente nreg è il primo ordine nreg=0
                if (!(nregRes[0].nreg))
                    nregRes[0].nreg = 0;

                console.log('nreg pre: ' + nregRes[0].nreg);
                nregRes[0].nreg = nregRes[0].nreg + 1;
                console.log('nreg post: ' + nregRes[0].nreg);
                console.log('ccod: ' + ccod);

                //inserisco l'ordine con il numero di registrazione calcolato
                db.query("UPDATE portale.ordini set nreg = $1 WHERE cstt <> $2 AND "
                    + (ccod && ccod !== '' ? "ccod = $3" : "1 <> 1")
                    , [nregRes[0].nreg, 50, ccod]
//                , function (queryErr, queryRes) {
                    , (queryErr, queryRes) => {
                        if (queryErr) {
                            console.log(queryErr);
                            callback('Errore aggiornamento numero di registrazione ordine', null);
                        }
                        else {
                            callback(null, nregRes[0].nreg--);
                        }
                    });
            }
        });
};

Ordine.getNota = function getNota(ccod, callback) {
    //ricerca ordine per codice
    db.query("SELECT xnote FROM portale.ordini WHERE ccod = $1"
        , [ccod]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    console.log('xnote: \n %j', queryRes);
                    callback(null, queryRes[0]);
                    return;
                } else {
                    console.log("non ghe mia");
                }
            }
            callback("Nessun ordine trovato", null);
        });
};
module.exports = Ordine;
