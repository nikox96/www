var db = require("../../config/database_psql.js");
var mysql = require('mysql');
var Prodotto = require("./product.js");
var Camp = require("./campioncini.js");

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

Ordine.delOrder = function delOrder(ccod, cstt, callback) {
    db.query("SELECT cstt FROM portale.ordini WHERE ccod = " + ccod
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0 && queryRes[0].cstt != cstt) {
                    db.query("DELETE FROM portale.righe_ordini WHERE ccod = " + ccod
                        , (err2, res2) => {
                            if (err2) {
                                console.log("errore canc righe ordini");
                            } else {
                                db.query("DELETE FROM portale.camp_ordini WHERE ccod = " + ccod
                                    , (err3, res3) => {
                                        var qryStrTmp = "DELETE FROM portale.ordini WHERE ccod = " + ccod;
                                        db.query(qryStrTmp, (delErr, delRes) => {
                                            if (delErr) {
                                                console.log(delErr);
                                                callback("Errore cancellazione dettaglio: comunicare n° ordine all'amministratore: " + ccod, null);
                                            } else {
                                                return;
                                            }
                                        });
                                    });
                            }
                        });
                } else {
                    callback("Ordine non revocabile", null);
                }
            }
        });
};

Ordine.findProduct = function findProduct(ccod, callback) {
    //ricerco i prodotti per un determinato ordine
    db.query("SELECT * FROM portale.righe_ordini WHERE ccod = "
        + ccod + " ORDER BY descrpromo, ccod, psco"
        //        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                console.log('findProduct: ' + queryRes.length);
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

Ordine.updateStatus = function updateStatus(ccod, cstt, xnote, callback) {
    //aggiorno lo status dell'ordine
    db.query("UPDATE portale.ordini SET cstt = ($1), xnote = ($2) WHERE ccod = ($3)"
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

Ordine.newOrderProduct = function newOrderProduct(ccod, ccodprod, iqta, psco, promo, callback) {
    //ricerco il prodotto da inserire
    Prodotto.find(ccodprod, function (err, res) {
        if (err && promo.length <= 6) {
            callback('Prodotto inesistente', null);
        } else {
            //calcolo importo
            var iimp;
            if (promo.length > 6)
                iimp = 0;
            else
                iimp = (res.iprz - (res.iprz / 100 * psco)) * iqta;

            console.log('iimp: ' + iimp);
            //se il prodotto era già presente nel carrello per quest'ordine allora aggiorno quantità e importo
            db.query("SELECT 1 FROM portale.righe_ordini WHERE ccod = " + ccod + " AND ccodprod = " + ccodprod + " AND psco = " + (psco && psco >= 0 ? psco : 0) + " AND descrpromo = $1"
                , [promo + "z"]
                //                , function (queryErr, queryRes) {
                , (queryErr, queryRes) => {
                    queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                    if (queryErr || queryRes.rowCount == 0 || (queryRes.length && queryRes.length <= 0)) {
                        console.log('insert order prod');
                        db.query("INSERT INTO portale.righe_ordini (ccod, ccodprod, iqta, iimp, psco, descrpromo) VALUES("
                            + ccod + ", "
                            + ccodprod + ", "
                            + iqta + ", "
                            + iimp + ", "
                            + psco + ", "
                            + "$1 )"
                            , [promo + "z"]
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
                        console.log('update order prod');
                        if (iqta == 0) {
                            if (promo.length > 6) {
                                db.query("DELETE FROM portale.righe_ordini WHERE descrpromo = $1"
                                    , [promo + "z"]
                                    //                                  , function (queryErr, queryRes) {
                                    , (queryErr, queryRes) => {
                                        if (queryErr) {
                                            callback("Errore aggiornamento prodotto", null);
                                        }
                                        else {
                                            callback(null, "Prodotto aggiornato");
                                        }
                                    });
                            } else {
                                db.query("DELETE FROM portale.righe_ordini WHERE ccod = " + ccod + " AND ccodprod = " + ccodprod + " AND psco = " + (psco && psco >= 0 ? psco : 0) + "AND descrpromo = $1"
                                    , [promo + "z"]
                                    //                                  , function (queryErr, queryRes) {
                                    , (queryErr, queryRes) => {
                                        if (queryErr) {
                                            callback("Errore aggiornamento prodotto", null);
                                        }
                                        else {
                                            callback(null, "Prodotto aggiornato");
                                        }
                                    });
                            }
                        } else {
                            db.query("UPDATE portale.righe_ordini SET iqta = " + iqta + ", iimp = " + iimp
                                + " WHERE ccod = " + ccod + " AND ccodprod = " + ccodprod + " AND psco = " + (psco && psco >= 0 ? psco : 0) + "AND descrpromo = $1"
                                , [promo + "z"]
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
                    }
                });

        }
    });
};

Ordine.getUserOrder = function getUserOrder(cage, cstt, xcli, fall, callback) {
    //ricerca ordine per codice agente/status/cliente
    var query = "SELECT a.*, (b.iimp - (b.iimp / 100 * c.psco)), c.xragsoc " +
        "FROM " +
        "(SELECT ccod, to_char(dreg, 'YYYY/MM/DD HH:MM') AS dreg, cstt, cage, ccli, xnote " +
        "FROM portale.ordini)  AS a, " +
        "(SELECT ccod, SUM(iimp) AS iimp " +
        "FROM portale.righe_ordini " +
        "GROUP BY ccod) AS b, " +
        "(SELECT ccod, xragsoc, psco " +
        "FROM portale.clienti) AS c " +
        "WHERE a.ccod = b.ccod AND a.ccli = c.ccod " +
        (fall == 'on' ? "" : "AND date_part('year', a.dreg) >= date_part('year', CURRENT_DATE) ")
        + ((cage || cage === 0) && cage !== '' ? " AND a.cage = " + cage : '')
        + ((cstt || cstt === 0) && cstt !== '' ? " AND a.cstt = " + cstt : '')
        + " AND c.xragsoc ilike $1 ORDER BY a.ccod";
    db.query(query
        , ['%' + (xcli && xcli != '' ? xcli : '') + '%']
        //        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("getUserOrder: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    callback(null, queryRes);
                    return;
                } else {
                    console.log("Nessun ordine trovato");
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
                //se non è presente nreg è il primo ordine nreg=1000
                if (!(nregRes[0].nreg) || nregRes[0].nreg < 1000)
                    nregRes[0].nreg = 1000;

                console.log('nreg pre: ' + nregRes[0].nreg);
                nregRes[0].nreg = nregRes[0].nreg + 1;
                console.log('nreg post: ' + nregRes[0].nreg);
                console.log('ccod: ' + ccod);

                //inserisco l'ordine con il numero di registrazione calcolato
                db.query("UPDATE portale.ordini set nreg = " + nregRes[0].nreg + " WHERE nreg = 999 AND "
                    + (ccod && ccod !== '' ? 'ccod = ' + ccod : '1 <> 1')
                    //                , function (queryErr, queryRes) {
                    , (queryErr, queryRes) => {
                        if (queryErr) {
                            console.log(queryErr);
                            callback('Errore aggiornamento numero di registrazione ordine', null);
                        }
                        else {
                            db.query("SELECT nreg FROM portale.ordini WHERE ccod = $1"
                                , [ccod]
                                , (getNregErr, getNregRes) => {
                                    if (getNregErr)
                                        callback(getNregErr, null);
                                    else
                                        console.log('res updatenreg: %j', getNregRes);
                                        callback(null, getNregRes.rows[0].nreg);
                                });
                        }
                    });
            }
        });
};

Ordine.getNota = function getNota(ccod, callback) {
    //ricerca ordine per codice
    db.query("SELECT xnote FROM portale.ordini WHERE ccod = "
        + ccod
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

Ordine.getSumCtv = function getSumCtv(ccli, callback) {
    //ricerca ordine per codice
    db.query("select (y.sumctv - y.sumctv / 100 * cli.psco) as sumctv FROM (select case when c.iimp>0 then c.iimp else 0.00 end - case when sum(z.sumord)>0 then sum(z.sumord) else 0.00 end as sumctv , c.ccli" +
        "from (select a.dreg, a.ccli, a.ccod, a.nreg, sum(b.iimp) as sumord " +
        "from portale.ordini a inner join portale.righe_ordini b " +
        "on a.ccod = b.ccod " +
        "where a.nreg <> 999 " +
        "group by a.ccod) z " +
        "right outer join portale.contratti c " +
        "on z.ccli = c.ccli and date_part('year', z.dreg) = c.cannrif " +
        "where c.ccli = $1 and c.cannrif = date_part('year', CURRENT_DATE) group by c.ccli, c.iimp) y inner join portale.clienti cli on y.ccli = cli.ccod;"
        , [ccli]
        //        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log(queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                if (queryRes.length > 0) {
                    console.log('sum iimp ord cli: \n %j', queryRes);
                    callback(null, queryRes[0]);
                    return;
                }
            }
            callback("Errore somma controvalore ordini cliente", null);
        });
};

Ordine.newOrderCamp = function newOrderCamp(ccod, ccodcamp, iqta, callback) {
    var iqtaold;
    //ricerco il prodotto da inserire
    Prodotto.findCamp(ccodcamp, function (err, res) {
        if (err) {
            callback('Campioncino inesistente', null);
        } else {
            //se il campioncino era già presente nel carrello per quest'ordine allora aggiorno quantità
            db.query("SELECT iqta FROM portale.camp_ordini WHERE ccod = " + ccod + " AND ccamp = $1"
                , [ccodcamp]
                //                , function (queryErr, queryRes) {
                , (queryErr, queryRes) => {
                    queryRes = (queryRes.rows && queryRes.rows.length >= 0 ? queryRes.rows : queryRes);
                    if (queryErr || queryRes.length == 0) {
                        iqtaold = 0;
                    } else {
                        iqtaold = queryRes[0].iqta;
                    }
                    var iimp = Number((res.iprz * (iqta - iqtaold)).toFixed(2));
                    console.log('newordercamp: iqta ' + iqta + ' iqtaold ' + iqtaold + ' iimp ' + iimp);
                    Camp.getCtvCamp(ccod, function (ctvCampErr, ctvCampRes) {
                        if (ctvCampErr)
                            callback(ctvCampErr, null);
                        else {
                            console.log('newordercamp: ctvCampRes ' + ctvCampRes);
                            iimp += Number(ctvCampRes);
                            console.log('newordercamp: iimp + ctvCampRes ' + iimp);
                            Camp.getTotal(ccod, function (totalErr, totalRes) {
                                if (totalErr)
                                    callback(totalErr, null);
                                else {
                                    totalRes = totalRes / 10;
                                    console.log('newordercamp: totalRes ' + totalRes);
                                    if (totalRes <= iimp) {
                                        callback('Limite campioncini superato: rimuovere dei campioncini!', null);
                                        return;
                                    } else {
                                        console.log('%j', queryRes);
                                        console.log('length queryres', queryRes.length);
                                        if (queryErr || queryRes.length <= 0) {
                                            console.log('insert order camp');
                                            db.query("INSERT INTO portale.camp_ordini (ccod, ccamp, iqta) VALUES("
                                                + ccod + ", "
                                                + "$1 , "
                                                + iqta + ")"
                                                , [ccodcamp]
                                                //                            , function (queryErr, queryRes) {
                                                , (queryErr, queryRes) => {
                                                    if (queryErr) {
                                                        console.log('errore insert camp: ' + queryErr);
                                                        callback('Errore inserimento campioncino', null);
                                                    }
                                                    else {
                                                        console.log('insert camp res: ');
                                                        callback(null, "Campioncino inserito corretamente");
                                                    }
                                                });
                                        } else {
                                            console.log('update order camp');
                                            if (iqta == 0) {
                                                db.query("DELETE FROM portale.camp_ordini WHERE ccod = " + ccod + " AND ccamp = $1"
                                                    , [ccodcamp]
                                                    //                                  , function (queryErr, queryRes) {
                                                    , (queryErr, queryRes) => {
                                                        if (queryErr) {
                                                            callback("Errore delete campioncino", null);
                                                        }
                                                        else {
                                                            callback(null, "Campioncino aggiornato");
                                                        }
                                                    });
                                            } else {
                                                db.query("UPDATE portale.camp_ordini SET iqta = " + iqta
                                                    + " WHERE ccod = " + ccod + " AND ccamp = $1"
                                                    , [ccodcamp]
                                                    //                            , function (queryErr, queryRes) {
                                                    , (queryErr, queryRes) => {
                                                        if (queryErr) {
                                                            callback("Errore aggiornamento campioncino", null);
                                                        }
                                                        else {
                                                            callback(null, "Campioncino aggiornato");
                                                        }
                                                    });
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
        }
    });
};

Ordine.findCamp = function findCamp(ccod, callback) {
    //ricerco i prodotti per un determinato ordine
    db.query("SELECT * FROM portale.camp_ordini WHERE ccod = "
        + ccod
        //        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                console.log('findCamp: ' + queryRes.length);
                if (queryRes.length > 0) {
                    callback(null, queryRes);
                    return;
                } else {
                    console.log("campioncini non presenti");
                }
            }
            callback("Nessun campioncino inserito nell'ordine", null);
        });
};

module.exports = Ordine;
