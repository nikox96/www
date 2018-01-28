var db = require("../../config/database.js");

var Product = {};

Product.find = function find(cprod, callback) {
    console.log("ricerca codice prodotto " + cprod);
    var query = "SELECT * FROM prodotti WHERE ccod = " + cprod;
    console.log(query);
    db.query(query
        , function (queryErr, queryRes) {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
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
    var query = "SELECT * FROM prodotti WHERE ccod > " + (ccodda && ccodda !== '' ? ccodda : 0) + " AND ccod < " + (ccoda && ccoda !== '' ? ccoda : 999999)
        + " AND xgrp LIKE '%" + (xgrp && xgrp !== '' ? xgrp : '') + "%' AND xdesc LIKE '%" + (xprod && xprod ? xprod : '')
        + "%' AND sven LIKE '%" + (sven && sven !== '' ? sven : '') + "%'";
    console.log(query);
    db.query(query
        , function (queryErr, queryRes) {
            if (queryErr) {
                callback(queryErr, null);
                console.log("error: " + queryErr);
            }
            else {
                callback(null, queryRes);
                console.log("record: " + queryRes.length);
            }
        });
};

Product.getSven = function (callback) {
    console.log("ricerca tipo vendita");
    var query = "SELECT sven FROM prodotti group by sven";
    console.log(query);
    db.query(query
        , function (queryErr, queryRes) {
            if (queryErr)
                callback(queryErr, null);
            else
                callback(null, queryRes);
        })
};

Product.getXgrp = function (callback) {
    console.log("ricerca categoria prodotto");
    var query = "SELECT xgrp FROM prodotti group by xgrp";
    console.log(query);
    db.query(query
        , function (queryErr, queryRes) {
            if (queryErr)
                callback(queryErr, null);
            else
                callback(null, queryRes);
        })
};

module.exports = Product;