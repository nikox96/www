var db = require("../../config/database_psql.js");

var Product = {};

Product.find = function find(cprod, callback) {
    console.log("ricerca codice prodotto " + cprod);
    var query = "SELECT * FROM portale.prodotti WHERE ccod = " + cprod;
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

Product.list = function list(ccodda, ccoda, sven, xgrp, xprod, callback) {
    console.log("ricerca lista prodotti");
    console.log("ccodda " + ccodda);
    console.log("ccoda " + ccoda);
    console.log("sven " + sven);
    console.log("xgrp " + xgrp);
    console.log("xprod" + xprod);
    var query = "SELECT * FROM portale.prodotti WHERE ccod >= " + (ccodda && ccodda !== '' ? ccodda : 0) + " AND ccod <= " + (ccoda && ccoda !== '' ? ccoda : 999999)
        + " AND xgrp LIKE '%" + (xgrp && xgrp !== '' ? xgrp : '') + "%' AND xdesc ILIKE '%" + (xprod && xprod ? xprod : '')
        + "%' AND sven LIKE '%" + (sven && sven !== '' ? sven : '') + "%'";
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

Product.getSven = function getSven(callback) {
    console.log("ricerca tipo vendita");
    var query = "SELECT sven FROM portale.prodotti group by sven";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr){
                callback(queryErr, null);
            }else{
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        })
};

Product.getXgrp = function getXgrp(callback) {
    console.log("ricerca categoria prodotto");
    var query = "SELECT xgrp FROM portale.prodotti group by xgrp";
    console.log(query);
    db.query(query
//        , function (queryErr, queryRes) {
        , (queryErr, queryRes) => {
            if (queryErr){
                callback(queryErr, null);
            }else{
                queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                callback(null, queryRes);
            }
        })
};

Product.listPromo = function listPromo(ccod, callback) {
    console.log("lista promo");
    var query = "SELECT t1.ccod, t1.xdesc AS xdescPromo, t2.ccodprod, t2.ipzz, t3.xdesc AS xdescProd, t3.iprz " +
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

module.exports = Product;
