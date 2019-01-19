var db = require("../../config/database_psql.js");

var Product = {};

Product.find = function find(cprod, callback) {
    console.log("ricerca codice prodotto " + cprod);
    var query = "SELECT * FROM portale.prodotti WHERE ccod = " + cprod + " AND sval = true";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes[0]);
                console.log("record: " + queryRes.length);
            }
        });
};

Product.list = function list(ccodda, ccoda, sven, xgrp, xprod, idord, callback) {
    console.log("ricerca lista prodotti");
    console.log("idord " + idord);
    var query = "select z.* from (select a.*, CASE WHEN b.iqta IS NULL THEN 0 ELSE b.iqta END AS iqta, CASE WHEN b.psco IS NULL THEN 0 ELSE b.psco END AS psco from portale.prodotti a left outer join (select ccodprod, iqta, psco from portale.righe_ordini where ccod = $6) b on a.ccod=b.ccodprod WHERE (a.ccod >= $1 AND a.ccod <= $2 AND a.xgrp ILIKE $3 AND a.xdesc ILIKE $4 AND a.sven ILIKE $5 AND a.sval = true) OR b. iqta IS NOT NULL) z ORDER BY z.iqta desc, z.ccod asc, z.psco desc;";
    console.log(query);
    db.query(query
        , [(ccodda && ccodda !== '' && ccoda !== 'undefined' && ccoda !== null ? ccodda : 0), (ccoda && ccoda !== '' && ccoda !== 'undefined' && ccoda !== null ? ccoda : 999998), '%' + (xgrp !== 'undefined' && xgrp !== null ? xgrp : '') + '%', '%' + (xprod !== 'undefined' && xprod !== null ? xprod : '') + '%', '%' + (sven !== 'undefined' && sven !== null ? sven : '') + '%', (idord && idord !== 'undefined' && idord !== null ? idord : -1)]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
                console.log("record: " + queryRes.length);
            }
        });
};

Product.getSven = function getSven(callback) {
    console.log("ricerca tipo vendita");
    var query = "SELECT sven FROM portale.prodotti where ccod <> 999999 group by sven";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
            } else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        })
};

Product.getXgrp = function getXgrp(callback) {
    console.log("ricerca categoria prodotto");
    var query = "SELECT xgrp FROM portale.prodotti where ccod <> 999999 group by xgrp";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
            } else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        })
};

Product.listPromo = function listPromo(ccod, callback) {
    console.log("lista promo");
    var query = "SELECT t1.ccod, t1.xdesc AS xdescPromo, t2.ccodprod, t2.psco, t2.ipzz, t3.xdesc AS xdescProd, t3.iprz " +
        "FROM portale.ana_promo t1 INNER JOIN portale.prod_promo t2 " +
        "ON t1.ccod = t2.ccodpromo INNER JOIN portale.prodotti t3 " +
        "ON t2.ccodprod = t3.ccod " +
        (ccod && ccod !== '' ? "WHERE t1.ccod = " + ccod : "");
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
                console.log("record: " + queryRes.length);
            }
        });
};

Product.findCamp = function findCamp(ccamp, callback) {
    var query = "SELECT * FROM portale.campioncini WHERE ccod = $1";
    console.log(query);
    db.query(query
        , [ccamp]
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes[0]);
                console.log("record: " + queryRes.length);
            }
        });
};

Product.listCamp = function listCamp(ccod, xgrp, xcamp, callback) {
    console.log("ricerca lista prodotti");
    console.log("ccod " + ccod);
    console.log("xgrp " + xgrp);
    console.log("xcamp " + xcamp);
    var query = "SELECT * FROM portale.campioncini WHERE ccod ILIKE $1 AND xgrp ILIKE $2 AND xdesc ILIKE $3 ORDER BY ccod";
    console.log(query);
    db.query(query
        , ['%' + (ccod ? ccod : '') + '%', '%' + (xgrp ? xgrp : '') + '%', '%' + (xcamp ? xcamp : '') + '%']
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
                console.log("listCamp record: " + queryRes.length);
            }
        });
};

Product.getXgrpCamp = function getXgrpCamp(callback) {
    console.log("ricerca categoria campioncini");
    var query = "SELECT xgrp FROM portale.campioncini group by xgrp";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr) {
                callback(queryErr, null);
            } else {
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        })
};

module.exports = Product;
