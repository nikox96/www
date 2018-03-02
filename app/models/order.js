var db = require("../../config/database_psql.js");
var mysql = require('mysql');
var Prodotto = require("./product.js");

var Ordine = {};

Ordine.find = function find(ccod, callback) {
    //ricerca ordine per codice
    db.query("SELECT * FROM portale.ordini WHERE ccod = "
        + ccod
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

Ordine.delOrder = function delOrder(ccod, callback) {
    db.query("SELECT cstt FROM ordini WHERE ccod = "
        + ccod
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0 && queryRes[0].cstt !== 50) {
                    //ricerca ordine per codice
                    db.query("DELETE FROM portale.ordini WHERE ccod = "
                        + ccod
//                        , function (delErr, delRes) {
                        , (delErr, delRes) => {
                            if (delErr) {
                                console.log("error: " + delErr);
                            }
                            else {
                                delRes = (delRes.rows && delRes.rows.length > 0 ? delRes.rows : delRes);
                                db.query("DELETE FROM portale.righe_ordini WHERE ccod = "
                                    + ccod
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
            callback("Nessun ordine trovato", null);
        });
};

Ordine.findProduct = function findProduct(ccod, callback) {
    //ricerco i prodotti per un determinato ordine
    db.query("SELECT * FROM portale.righe_ordini WHERE ccod = "
        + ccod
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

    db.query(query
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

Ordine.updateStatus = function updateStatus(ccod, cstt, callback) {
    //aggiorno lo status dell'ordine
    db.query("UPDATE portale.ordini SET cstt = " + cstt + " WHERE ccod = "
        + ccod
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
    db.query("UPDATE portale.ordini SET ccli = " + ccli + (ccod && ccod !== '' ? " WHERE ccod = "
        + ccod : "WHERE 1<>1")
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
    db.query("INSERT INTO portale.ordini (nreg, ctiprec, ctipdoc, dreg, ccli, cval, cimp, cstt, cage) VALUES("
        + "999, "
        + mysql.escape(ctiprec) + ", 701, "
        + mysql.escape(new Date()) + ", "
        + mysql.escape(0) + ", 'EUR', 1, 10, "
        + cage + ") RETURNING ccod"
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

            console.log('iimp: ' + iimp);
            //se il prodotto era già presente nel carrello per quest'ordine allora aggiorno quantità e importo
            db.query("SELECT 1 FROM portale.righe_ordini WHERE ccod = " + ccod + "AND ccodprod = " + ccodprod
//                , function (queryErr, queryRes) {
                , (queryErr, queryRes) => {
                    if (queryErr) {
                        db.query("INSERT INTO portale.righe_ordini (ccod, ccodprod, iqta, iimp) VALUES("
                            + ccod + ", "
                            + ccodprod + ", "
                            + iqta + ", "
                            + iimp + ")"
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
                        queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                        db.query("UPDATE portale.righe_ordini SET iqta = " + iqta + ", iimp = " + iimp
                            + " WHERE ccod = " + ccod + " AND ccodprod = " + ccodprod
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
        + (cage && cage !== '' ? "AND a.cage = " + cage : 'AND 1 <> 1')
        + (cstt && cstt !== '' ? " AND a.cstt = " + cstt : '')
        + (xcli && xcli !== '' ? " AND c.xragsoc like '%" + xcli + "%'" : '');
    //console.log(query);
    db.query(query
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
                db.query("UPDATE portale.ordini set nreg = " + nregRes[0].nreg + " WHERE cstt <> 50 AND "
                    + (ccod && ccod !== '' ? 'ccod = ' + ccod : '1 <> 1')
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

module.exports = Ordine;
