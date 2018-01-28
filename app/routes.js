var db = require("../config/database.js");
var Client = require("./models/client.js");
var Order = require("./models/order.js");
var Product = require("./models/product.js");
var i = 0;

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/home', isLoggedIn, function (req, res) {
        res.render('home.ejs', {
            user: req.user // get the user out of session and pass to template
        }); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/new-order-product', isLoggedIn, function (req, res) {
        Order.newOrder('TES', req.param('ccodcli'), req.user.cage, function (err, qres) {
            if (qres) {
                Product.list(0, 999999, '', '', '', function (productErr, productRes) {
                    if (productErr) {
                        req.flash('orderMessage', 'Nessun prodotto trovato');
                    }
                    if (productRes) {
                        console.log('prodotti: ' + productRes.length);
                        req.flash('orderMessage', productRes.length + ' risultati');
                        Product.getSven(function (venErr, venRes) {
                            if (venErr) {
                                console.log("errore sven");
                                venRes = {};
                            } else {
                                console.log("sven trovate: " + venRes.length);
                            }
                            Product.getXgrp(function (grpErr, grpRes) {
                                if (grpErr) {
                                    console.log("errore xgrp");
                                    grpRes = {};
                                } else {
                                    console.log("xgrp trovate" + grpRes);
                                }
                                res.render('new-order-product.ejs', {
                                    message: req.flash('orderMessage'),
                                    products: productRes,
                                    lven: venRes,
                                    xgrp: grpRes,
                                    idOrd: qres
                                });
                            });
                        });
                    }
                });
            }
        });
    });

    app.post('/new-order-product', isLoggedIn, function (req, res) {
        Product.list(req.body.ccodda, req.body.ccoda, req.body.sven, req.body.xgrp, req.body.xprod, function (productErr, productRes) {
            if (productErr) {
                req.flash('orderMessage', 'Nessun cliente trovato');
            } else {
                console.log('clients: ' + productRes.length);
                req.flash('orderMessage', productRes.length + ' risultati');

                // render the page and pass in any flash data if it exists
                Product.getSven(function (venErr, venRes) {
                    if (venErr) {
                        console.log("errore sven");
                    } else {
                        console.log("sven trovate: " + venRes.length);
                    }
                    Product.getXgrp(function (grpErr, grpRes) {
                        if (grpErr) {
                            console.log("errore xgrp");
                            grpRes = {};
                        } else {
                            console.log("xgrp trovate" + grpRes);
                        }
                        res.render('new-order-product.ejs', {
                            message: req.flash('orderMessage'),
                            products: productRes,
                            lven: venRes,
                            xgrp: grpRes,
                            idOrd: req.body.idOrd
                        });
                    });
                });
            }
        });
    });
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/new-order-product-row', isLoggedIn, function (req, res) {
        var msg;
        Order.newOrderProduct(req.query.ccod, req.query.ccodprod, req.query.iqta, function (orderErr, orderRes) {
            if (orderErr) {
                msg = 'errore inserimento prodotto ordine';
            } else {
                msg = 'prodotto ordine inserito correttamente';
            }
            console.log(msg);
            req.flash('orderMessage', msg);
            Product.list(0, 999999, '', '', '', function (productErr, productRes) {
                if (productErr) {
                    req.flash('orderMessage', 'Nessun cliente trovato');
                } else {
                    console.log('clients: ' + productRes.length);
                    req.flash('orderMessage', productRes.length + ' risultati');

                    // render the page and pass in any flash data if it exists
                    Product.getSven(function (venErr, venRes) {
                        if (venErr) {
                            console.log("errore sven");
                        } else {
                            console.log("sven trovate: " + venRes.length);
                        }
                        Product.getXgrp(function (grpErr, grpRes) {
                            if (grpErr) {
                                console.log("errore xgrp");
                                grpRes = {};
                            } else {
                                console.log("xgrp trovate" + grpRes);
                            }
                            res.render('new-order-product.ejs', {
                                message: req.flash('orderMessage'),
                                products: productRes,
                                lven: venRes,
                                xgrp: grpRes,
                                idOrd: req.query.ccod
                            });
                        });
                    });
                }
            });
        });
    });

    app.get('/new-order-cond-pag', isLoggedIn, function (req, res) {
        db.query("SELECT * FROM condizioni_pagamento", function (queryErr, queryRes) {
            if (queryErr) {
                req.flash('orderMessage', 'Nessuna condizione di pagamento trovata');
            } else {
                res.render('new-order-cond-pag.ejs', {
                    message: req.flash('orderMessage'),
                    idOrd: req.query.idOrd,
                    condpag: queryRes
                });
            }
        });
    });
    app.post('/new-order-cond-pag', isLoggedIn, function (req, res) {
        Order.updateCondPag(req.body.ccod, req.body.ccodpag, function (queryErr, queryRes) {
            if (queryErr)
                req.flash('orderMessage', queryErr);
            else {
                req.flash('orderMessage', queryRes);
                Order.find(req.body.ccod, function (queryErr, queryRes) {
                    if (queryErr)
                        req.flash('orderMessage', queryErr);
                    else {
                        Client.find(queryRes.ccli, function (cliErr, cliRes) {
                            if (cliErr)
                                req.flash('orderMessage', cliErr);
                            else {
                                Order.findProduct(req.body.ccod, function (righeErr, righeRes) {
                                    if (righeErr) {
                                        req.flash('orderMessage', righeErr);
                                    } else {
                                        i = 0;
                                        getRighe(res, req, righeRes, cliRes, queryRes);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    app.post('/new-order-sum', isLoggedIn, function (req, res) {
        Order.updateStatus(req.body.idOrd, 0, function (queryErr, queryRes) {
            if (queryErr)
                console.log('impossibile ma vero');
            else
                res.redirect('/home');
        })
    });

    app.post('/del-order', isLoggedIn, function (req, res) {
        Order.delOrder(req.body.ccod, 0, function (queryErr, queryRes) {
            if (queryErr)
                console.log('impossibile ma vero');
            else
                res.redirect('/home');
        })
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/order-list', isLoggedIn, function (req, res) {
        var orders = [];
        
        Order.getUserOrder(req.user.cage, null, null, function (ordErr, ordRes) {
            if (ordErr) {
                req.flash('list-order-message', ordErr);
            } else {
                var order = {};
                for (i = 0; i < ordRes.length; i++) {
                    order = {};
                    order.ccod = ordRes[i].ccod;
                    order.xragsoc = ordRes[i].xragsoc;
                    order.iimp = ordRes[i].iimp;
                    order.data = ordRes[i].dreg;
                    orders[i] = order;
                }

                res.render('order-list.ejs', {
                    orders: orders,
                    user: req.user
                });
            }
        });
    });


    app.post('/order-list', isLoggedIn, function (req, res) {
        var orders = [];

        Order.getUserOrder(req.user.cage, req.body.cstt, req.body.xragsoc, function (ordErr, ordRes) {
            if (ordErr) {
                req.flash('list-order-message', ordErr);
            } else {
                var order = {};
                for (i = 0; i < ordRes.length; i++) {
                    order = {};
                    order.ccod = ordRes[i].ccod;
                    order.xragsoc = ordRes[i].xragsoc;
                    order.iimp = ordRes[i].iimp;
                    order.data = ordRes[i].dreg;
                    orders[i] = order;
                }

                res.render('order-list.ejs', {
                    orders: orders,
                    user: req.user
                });
            }
        });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/new-order', isLoggedIn, function (req, res) {
        // search for clients
        getClients(req, res);
    });

    app.post('/new-order', isLoggedIn, function (req, res) {
        // search for clients
        getClients(req, res);
    });

// process the login form
// app.post('/login', do all our passport stuff here);

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// =====================================
// LOGOUT ==============================
// =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
}
;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function getClients(req, res) {
    Client.list(req.body.ccod, req.body.xragsoc, function (clientErr, clientRes) {
        if (clientErr) {
            req.flash('orderMessage', 'Nessun cliente trovato');
        }
        if (clientRes) {
            console.log('clients: ' + clientRes.length);
            req.flash('orderMessage', clientRes.length + ' risultati');

            // render the page and pass in any flash data if it exists
            res.render('new-order.ejs', {
                message: req.flash('orderMessage'),
                clients: clientRes,
                xragsoc: req.body.xragsoc,
                ccod: req.body.ccod
            });
        }
    });
}

function getRighe(res, req, righe, cliente, cond) {
    var products = [];
    var product = {};
    var riga = {};
    if (i >= righe.length)
        return;

    Product.find(righe[i].ccodprod, function (prodErr, prodRes) {
        if (prodErr) {
            req.flash('orderMessage', prodErr);
        } else {
            product = {};
            riga = righe[i];
            product.ccod = prodRes.ccod;
            product.xdesc = prodRes.xdesc;
            product.iqta = riga.iqta;
            product.iimp = riga.iimp;
            products[i] = product;
            if (i === righe.length - 1) {
                var condpag;
                db.query("SELECT * FROM condizioni_pagamento WHERE ccod = " + cond.ccondpag,
                    function (condErr, condRes) {
                        if (condErr) {
                            req.flash('orderMessage', 'Nessuna condizione di pagamento trovata');
                        } else {
                            condpag = condRes[0];
                            res.render('new-order-sum.ejs', {
                                message: req.flash('orderMessage'),
                                idOrd: req.body.ccod,
                                client: cliente,
                                products: products,
                                condpag: condpag
                            });
                        }
                    });
            }
            i++;
            getRighe(res, req, righe, cliente, cond);
        }
    });
}