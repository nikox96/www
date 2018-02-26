var db = require("../config/database_psql.js");
var Client = require("./models/client.js");
var Order = require("./models/order.js");
var Product = require("./models/product.js");
var Agent = require("./models/agent.js");
var Appoggio = require("./models/appoggio.js");
var dateFormat = require('dateformat');
var i = 0, csvEl = 0;
var rig, tes, rec, iva, par, csv;

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/home', isLoggedIn, function (req, res) {
        Appoggio.delApp(req.user.cage, '', function (errApp, resApp) {
            if (errApp){
                console.log(errApp);
            }        
            res.render('home.ejs', {
                user: req.user // get the user out of session and pass to template
            }); // load the index.ejs file
        });
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
        Appoggio.find(req.user.cage, '', function (appErr, appRes) {
            if (appErr) {
                console.log("errore recupero codice ordine");
            } else {
                Product.list(req.query.ccodda, req.query.ccoda, req.query.sven, req.query.xgrp, req.query.xprod, function (productErr, productRes) {
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
                                    idOrd: appRes[0].idOrd
                                });
                            });
                        });
                    }
                });
            }
        });
    });

    app.post('/new-order-product', isLoggedIn, function (req, res) {
        Appoggio.find(req.user.cage, '', function (appErr, appRes) {
            if (appErr) {
                console.log("errore recupero codice ordine");
            } else {
                var msg;
                Order.newOrderProduct(req.body.ccod, req.body.ccodprod, req.body.iqta, function (orderErr, orderRes) {
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
                                        idOrd: appRes[0].idOrd
                                    });
                                });
                            });
                        }
                    });
                });
            }
        });
    });

    app.get('/new-order-cond-pag', isLoggedIn, function (req, res) {
        Appoggio.find(req.user.cage, '', function (appErr, appRes) {
            if (appErr) {
                console.log("errore recupero codice ordine");
            } else {
                db.query("SELECT * FROM portale.condizioni_pagamento"
//                 , function (queryErr, queryRes) {
                    , (queryErr, queryRes) => {
                        if (queryErr) {
                            req.flash('orderMessage', 'Nessuna condizione di pagamento trovata');
                        } else {
                            queryRes = (queryRes.rows && queryRes.rows.length > 0 ? queryRes.rows : queryRes);
                            res.render('new-order-cond-pag.ejs', {
                                message: req.flash('orderMessage'),
                                idOrd: appRes[0].idOrd,
                                condpag: queryRes
                            });
                        }
                    });
            }
        });
    });

    app.post('/new-order-cond-pag', isLoggedIn, function (req, res) {
        Appoggio.find(req.user.cage, '', function (appErr, appRes) {
            if (appErr) {
                console.log("errore recupero codice ordine");
            } else {
                Order.updateCondPag(appRes[0].idOrd, req.body.ccodpag, function (queryErr, queryRes) {
                    if (queryErr)
                        req.flash('orderMessage', queryErr);
                    else {
                        req.flash('orderMessage', queryRes);
                        Order.find(appRes[0].idOrd, function (queryErr, queryRes) {
                            if (queryErr)
                                req.flash('orderMessage', queryErr);
                            else {
                                Client.find(queryRes.ccli, function (cliErr, cliRes) {
                                    if (cliErr)
                                        req.flash('orderMessage', cliErr);
                                    else {
                                        Order.findProduct(appRes[0].idOrd, function (righeErr, righeRes) {
                                            if (righeErr) {
                                                req.flash('orderMessage', righeErr);
                                            } else {
                                                i = 0;
                                                getRighe(res, req, righeRes, cliRes, queryRes, appRes[0].idOrd);
                                            }
                                        });
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

    app.get('/edit-products', isLoggedIn, function (req, res) {
        Order.findProduct(req.body.ccod, function (queryErr, queryRes) {
            Product.list(0, 999999, '', '', '', function (productErr, productRes) {
                if (productErr) {
                    req.flash('editProducts', 'Nessun prodotto disponibile');
                } else {
                    var products = [];
                    var product;
                    for (i = 0; i < productRes.length; i++) {
                        product = {};
                        product.ccod = productRes[i].ccod;
                        product.xdesc = productRes[i].xdesc;
                        if (queryRes.length > 0) {
                            product.iqta = queryRes.find(getIqta(product.ccod));
                        } else {
                            product.iqta = 0;
                        }
                        products[i] = product;
                    }

                    products = _.sortBy(products, "iqta");
                    res.render('edit-products.ejs', {
                        message: req.flash('editProducts'),
                        idOrd: req.body.ccod,
                        products: products
                    })
                }
            });
        });
    });

    app.get('/get-csv', isLoggedIn, function (req, res) {
        rec = {};
        initializeCSV();
        csv = [];
        csvEl = 0;

        Order.find(req.query.ccod, function (ordErr, ordRes) {
            if (ordErr)
                return;
            else {
                Agent.find(ordRes.cage, function (ageErr, ageRes) {
                    if (ageErr) {
                        return
                    } else {
                        Client.find(ordRes.ccli, function (cliErr, cliRes) {
                            if (cliErr)
                                return;
                            else {
                                Order.findProduct(req.query.ccod, function (righeErr, righeRes) {
                                    console.log('ordRes.dreg pre: ' + ordRes.dreg);
                                    ordRes.dreg = dateFormat(ordRes.dreg, "dd/mm/yyyy");
                                    console.log('ordRes.dreg post: ' + ordRes.dreg);
                                    rec.tipRec = 'TES';
                                    tes.cDocAut = '000';
                                    tes.dreg = (ordRes.dreg && ordRes.dreg !== '' ? ordRes.dreg : '');
                                    tes.tipDocFttVen = '000';
                                    tes.tipDocFttAcq = '000';
                                    tes.tipDocPreVen = '000';
                                    tes.tipDocPreAcq = '000';
                                    tes.tipDocOrdVen = '701';
                                    tes.tipDocOrdAcq = '000';
                                    tes.tipDocDdtVen = '000';
                                    tes.tipDocDdtAcq = '000';
                                    tes.nreg = (ordRes.nreg && ordRes.nreg !== '' ? ordRes.nreg : '');
                                    tes.appDigReg = '';
                                    tes.nAttIva = '00';
                                    tes.nAttIvaAltroSis = '';
                                    tes.tipRegIva = '0';
                                    tes.cRegIva = '00';
                                    tes.cRegIvaAltroSis = '';
                                    tes.ddoc = tes.dreg;
                                    tes.ndoc = '';
                                    tes.nregAnn = '0000000';
                                    tes.appDigRegAnn = '';
                                    tes.cConCont = '';
                                    tes.cConContAltroSis = '';
                                    tes.cPartAltroSis = '';
                                    tes.cPart = (ordRes.ccli && ordRes.ccli !== '' ? ordRes.ccli : '');
                                    tes.cfisPart = (cliRes.cfis && cliRes.cfis !== '' ? cliRes.cfis : '');
                                    tes.pivaPart = (cliRes.piva && cliRes.piva !== '' ? cliRes.piva : '');
                                    tes.addAut = '';
                                    tes.cValDoc = (ordRes.cval && ordRes.cval !== '' ? ordRes.cval : '');
                                    tes.camb = '1.0';
                                    tes.cValIntr = '';
                                    tes.cCambIntr = '';
                                    tes.cimp = '1';
                                    tes.filler = '';
                                    tes.iimp = (ordRes.iinc && ordRes.iinc !== '' ? ordRes.iinc : '');
                                    tes.fpag = '000';
                                    tes.civaNonImp = '';
                                    tes.civaNonImpAltroSis = '';
                                    tes.ccatRegIvaSpec = '000';
                                    tes.regIvaSpecPrev = '';
                                    tes.contRegDocIva = '0';
                                    tes.indetr = '0';
                                    tes.cas1 = '';
                                    tes.cas2 = '';
                                    tes.cas3 = '';
                                    tes.rifVs = '';
                                    tes.rifNs = '';
                                    tes.ddtDaFtt = '0';
                                    tes.ddtInc = '0';
                                    tes.ddtFttSosp = '0';
                                    tes.ddtDaFttTipFtt = '000';
                                    tes.ragrFtt = '';
                                    tes.cage = (ordRes.cage && ordRes.cage !== '' ? ordRes.cage : '');
                                    tes.cageAltroSis = '';
                                    tes.provvAge = (ageRes.provv && ageRes.provv !== '' ? ageRes.provv : '');
                                    tes.provCapoArea = '0.00';
                                    tes.ccondPag = (ordRes.ccondPag && ordRes.ccondPag !== '' ? ordRes.ccondPag : '');
                                    tes.ccondPagAltroSis = '';
                                    tes.scoCondPag = '0.00';
                                    tes.rilTrackFlussiFin = '';
                                    tes.rilTrackFlussiFinAltroSis = '';
                                    tes.idGara = '';
                                    tes.idProg = '';
                                    tes.descTrackFlussiFin = '';
                                    tes.scoTes = '0.00';
                                    tes.sScoAna = '';
                                    tes.dini = '';
                                    tes.dfin = '';
                                    tes.eseComp = '';
                                    tes.ddecor = '';
                                    tes.cBancaNs = '';
                                    tes.cBancaNsAltroSis = '';
                                    tes.descBancaRif = '';
                                    tes.cAppBanc = '000';
                                    tes.cabi = '';
                                    tes.ccab = '';
                                    tes.ccin = '';
                                    tes.ccin2 = '';
                                    tes.nconcor = '';
                                    tes.cbic = '';
                                    tes.cpae = '';
                                    tes.rifBancaEstera = '';
                                    tes.ciban = '';
                                    tes.xcau = '';
                                    tes.cauAggRegIva1 = '';
                                    tes.cauAggRegIva2 = '';
                                    tes.cauAggRegIva3 = '';
                                    tes.cauAggRegIva4 = '';
                                    tes.annCompIva = (ordRes.dreg && ordRes.dreg !== '' ? ordRes.dreg.substr(6, 4) : '');
                                    tes.perCompIva = '';
                                    tes.dopr = '';
                                    tes.cessCliPriv = '';
                                    tes.annRifOpr = tes.annCompIva;
                                    tes.perRifOpr = '';
                                    tes.rilBlackList = '';
                                    tes.cAziendaRapp = '';
                                    tes.cAziendaRappAltroSis = '';
                                    tes.terrIva = '0';
                                    tes.filler2 = '';
                                    tes.totDocVal = '0.0';
                                    tes.nRifInd = '';
                                    tes.ragSoc1 = '';
                                    tes.ragSoc2 = '';
                                    tes.xind1 = '';
                                    tes.xind2 = '';
                                    tes.ccap = '';
                                    tes.xloc1 = '';
                                    tes.xloc2 = '';
                                    tes.cprv = '';
                                    tes.ciso = '';
                                    tes.ccatCli = '';
                                    tes.xcatCli = '';
                                    tes.tipGesList = '';
                                    tes.clis = '';
                                    tes.cdep = '';
                                    tes.cdepRic = '';
                                    tes.ccauTrasp = '';
                                    tes.xcauTrasp = '';
                                    tes.aspBen = '';
                                    tes.xAspBen = '';
                                    tes.cporto = '';
                                    tes.xporto = '';
                                    tes.traspMez = '';
                                    tes.xTraspMex = '';
                                    tes.diniTrasp = '';
                                    tes.oiniTrasp = '';
                                    tes.xmezz = '';
                                    tes.targaMez = '';
                                    tes.cvet = '';
                                    tes.cvetAltroSis = '';
                                    tes.vetRagSoc1 = '';
                                    tes.vetRagSoc2 = '';
                                    tes.xvettInd1 = '';
                                    tes.xvettInd2 = '';
                                    tes.ccapVet = '';
                                    tes.xvetLoc1 = '';
                                    tes.xvetLoc2 = '';
                                    tes.cprvVet = '';
                                    tes.cisoVet = '';
                                    tes.cvet2 = '';
                                    tes.cvetAltroSis2 = '';
                                    tes.vetRagSoc12 = '';
                                    tes.vetRagSoc22 = '';
                                    tes.xvettInd12 = '';
                                    tes.xvettInd22 = '';
                                    tes.ccapVet2 = '';
                                    tes.xvetLoc12 = '';
                                    tes.xvetLoc22 = '';
                                    tes.cprvVet2 = '';
                                    tes.cisoVet2 = '';
                                    tes.copr = '';
                                    tes.compElenchiIvaAnniPrec = '';
                                    tes.partitaCollRit = '';
                                    tes.ctipOprRit = '';
                                    tes.ctipOprRitAltroSis = '';
                                    tes.tipContributoPrev = '';
                                    tes.tipContributoPrevAltroSis = '';
                                    tes.derivaSpesePie = '';
                                    tes.iBollo = '';
                                    tes.iInc = '';
                                    tes.iSpesa1 = '';
                                    tes.iSpesa2 = '';
                                    tes.iBolloOprEse = '';
                                    tes.codCoint1 = '';
                                    tes.cfisCoin1 = '';
                                    tes.pivaCoin1 = '';
                                    tes.ragSoc1Coin1 = '';
                                    tes.ragSoc2Coin1 = '';
                                    tes.xnoteCoin1 = '';
                                    tes.codCoint2 = '';
                                    tes.cfisCoin2 = '';
                                    tes.pivaCoin2 = '';
                                    tes.ragSoc1Coin2 = '';
                                    tes.ragSoc2Coin2 = '';
                                    tes.xnoteCoin2 = '';
                                    tes.codCoint3 = '';
                                    tes.cfisCoin3 = '';
                                    tes.pivaCoin3 = '';
                                    tes.ragSoc1Coin3 = '';
                                    tes.ragSoc2Coin3 = '';
                                    tes.xnoteCoin3 = '';
                                    tes.codCoint4 = '';
                                    tes.cfisCoin4 = '';
                                    tes.pivaCoin4 = '';
                                    tes.ragSoc1Coin4 = '';
                                    tes.ragSoc2Coin4 = '';
                                    tes.xnoteCoin4 = '';
                                    tes.codCoint5 = '';
                                    tes.cfisCoin5 = '';
                                    tes.pivaCoin5 = '';
                                    tes.ragSoc1Coin5 = '';
                                    tes.ragSoc2Coin5 = '';
                                    tes.xnoteCoin5 = '';
                                    tes.tipProd = '';
                                    tes.ddecorPag = '';
                                    tes.datiAggFttEle = '';
                                    tes.ccentroAnalisi = '';
                                    tes.ccentroAnalisiAltroSis = '';
                                    tes.ccomm = '';
                                    tes.ccommALtroSis = '';
                                    tes.docRil = '';
                                    tes.cfisDef = '';
                                    tes.xcognDef = '';
                                    tes.xnomeDef = '';
                                    tes.intAutPlafond = '';
                                    tes.tipAnaVen = '';
                                    tes.cven = '';
                                    tes.cvenEst = '';
                                    tes.cvenInd = '';

                                    rec.tes = tes;
                                    rec.rig = rig;
                                    rec.iva = iva;
                                    rec.par = par;

                                    csvRig93();
                                    i = 0;
                                    getRigheCSV(res, req, ordRes.nreg, righeRes, cliRes, ageRes);
                                });
                            }
                        });
                    }
                });
            }
        });
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

    app.get('/new-order', isLoggedIn, function (req, res) {
        // search for clients
        getClients(req, res);
    });

    app.post('/new-order', isLoggedIn, function (req, res) {
        Appoggio.find(req.user.cage, '', function (appErr, appRes) {
            if (appErr) {
                console.log("errore recupero codice ordine");
            } else {
                Order.updateCcli(appRes[0].idOrd, req.body.ccod, function (ordErr, ordRes) {
                    if (ordErr) {
                        console.log("errore aggiornamento codice cliente ordine");
                    } else {
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
                                            idOrd: appRes[0].idOrd
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });

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
        Appoggio.delApp(req.user.cage, '', function (errApp, resApp) {
            if (errApp){
                console.log(errApp);
            }
            req.logout();
            res.redirect('/');
        });
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
    Appoggio.find(req.user.cage, '', function (appfinErr, appfinRes) {
        if (appfinErr) {
            console.log("errore lettura appoggio");
        } else {
            if (appfinRes.length > 0 && appfinRes[0].idOrd && appfinRes[0].idOrd !== '') {
                Client.list(req.query.ccod, req.query.xragsoc, function (clientErr, clientRes) {
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
                            ccod: req.body.ccod,
                            idOrd: appfinRes[0].idOrd
                        });
                    }
                });
            } else {
                Order.newOrder('TES', '', req.user.cage, function (ordErr, ordRes) {
                    console.log("ordRes: " + ordRes);
                    if (ordRes) {
                        Appoggio.insert(req.user.cage, ordRes, function (appErr, appRes) {
                            if (appErr) {
                                console.log("Errore inserimento appoggio: " + appErr);
                            } else {
                                Client.list(req.query.ccod, req.query.xragsoc, function (clientErr, clientRes) {
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
                                            xragsoc: req.query.xragsoc,
                                            ccod: req.query.ccod,
                                            idOrd: ordRes
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });

}

function getRighe(res, req, righe, cliente, cond, idOrd) {
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
                db.query("SELECT * FROM portale.condizioni_pagamento WHERE ccod = " + cond.ccondpag
//                    , function (condErr, condRes) {
                    , (condErr, condRes) => {
                        if (condErr) {
                            req.flash('orderMessage', 'Nessuna condizione di pagamento trovata');
                        } else {
                            condRes = (condRes.rows && condRes.rows.length > 0 ? condRes.rows : condRes);
                            condpag = condRes[0];
                            res.render('new-order-sum.ejs', {
                                message: req.flash('orderMessage'),
                                idOrd: idOrd,
                                client: cliente,
                                products: products,
                                condpag: condpag
                            });
                        }
                    });
            }
            i++;
            getRighe(res, req, righe, cliente, cond, idOrd);
        }
    });
}

function initializeCSV() {

    rig = {};
    tes = {};
    iva = {};
    par = {};

    rec.tipRec = '';
    tes.cDocAut = '';
    tes.dreg = '';
    tes.tipDocFttVen = '';
    tes.tipDocFttAcq = '';
    tes.tipDocPreVen = '';
    tes.tipDocPreAcq = '';
    tes.tipDocOrdVen = '';
    tes.tipDocOrdAcq = '';
    tes.tipDocDdtVen = '';
    tes.tipDocDdtAcq = '';
    tes.nreg = '';
    tes.appDigReg = '';
    tes.nAttIva = '';
    tes.nAttIvaAltroSis = '';
    tes.tipRegIva = '';
    tes.cRegIva = '';
    tes.cRegIvaAltroSis = '';
    tes.ddoc = '';
    tes.ndoc = '';
    tes.nregAnn = '';
    tes.appDigRegAnn = '';
    tes.cConCont = '';
    tes.cConContAltroSis = '';
    tes.cPartAltroSis = '';
    tes.cPart = '';
    tes.cfisPart = '';
    tes.pivaPart = '';
    tes.addAut = '';
    tes.cValDoc = '';
    tes.camb = '';
    tes.cValIntr = '';
    tes.cCambIntr = '';
    tes.cimp = '';
    tes.filler = '';
    tes.iimp = '';
    tes.fpag = '';
    tes.civaNonImp = '';
    tes.civaNonImpAltroSis = '';
    tes.ccatRegIvaSpec = '';
    tes.regIvaSpecPrev = '';
    tes.contRegDocIva = '';
    tes.indetr = '';
    tes.cas1 = '';
    tes.cas2 = '';
    tes.cas3 = '';
    tes.rifVs = '';
    tes.rifNs = '';
    tes.ddtDaFtt = '';
    tes.ddtInc = '';
    tes.ddtFttSosp = '';
    tes.ddtDaFttTipFtt = '';
    tes.ragrFtt = '';
    tes.cage = '';
    tes.cageAltroSis = '';
    tes.provvAge = '';
    tes.provCapoArea = '';
    tes.ccondPag = '';
    tes.ccondPagAltroSis = '';
    tes.scoCondPag = '';
    tes.rilTrackFlussiFin = '';
    tes.rilTrackFlussiFinAltroSis = '';
    tes.idGara = '';
    tes.idProg = '';
    tes.descTrackFlussiFin = '';
    tes.scoTes = '';
    tes.sScoAna = '';
    tes.dini = '';
    tes.dfin = '';
    tes.eseComp = '';
    tes.ddecor = '';
    tes.cBancaNs = '';
    tes.cBancaNsAltroSis = '';
    tes.descBancaRif = '';
    tes.cAppBanc = '';
    tes.cabi = '';
    tes.ccab = '';
    tes.ccin = '';
    tes.ccin2 = '';
    tes.nconcor = '';
    tes.cbic = '';
    tes.cpae = '';
    tes.rifBancaEstera = '';
    tes.ciban = '';
    tes.xcau = '';
    tes.cauAggRegIva1 = '';
    tes.cauAggRegIva2 = '';
    tes.cauAggRegIva3 = '';
    tes.cauAggRegIva4 = '';
    tes.annCompIva = '';
    tes.perCompIva = '';
    tes.dopr = '';
    tes.cessCliPriv = '';
    tes.annRifOpr = '';
    tes.perRifOpr = '';
    tes.rilBlackList = '';
    tes.cAziendaRapp = '';
    tes.cAziendaRappAltroSis = '';
    tes.terrIva = '';
    tes.filler2 = '';
    tes.totDocVal = '';
    tes.nRifInd = '';
    tes.ragSoc1 = '';
    tes.ragSoc2 = '';
    tes.xind1 = '';
    tes.xind2 = '';
    tes.ccap = '';
    tes.xloc1 = '';
    tes.xloc2 = '';
    tes.cprv = '';
    tes.ciso = '';
    tes.ccatCli = '';
    tes.xcatCli = '';
    tes.tipGesList = '';
    tes.clis = '';
    tes.cdep = '';
    tes.cdepRic = '';
    tes.ccauTrasp = '';
    tes.xcauTrasp = '';
    tes.aspBen = '';
    tes.xAspBen = '';
    tes.cporto = '';
    tes.xporto = '';
    tes.traspMez = '';
    tes.xTraspMex = '';
    tes.diniTrasp = '';
    tes.oiniTrasp = '';
    tes.xmezz = '';
    tes.targaMez = '';
    tes.cvet = '';
    tes.cvetAltroSis = '';
    tes.vetRagSoc1 = '';
    tes.vetRagSoc2 = '';
    tes.xvettInd1 = '';
    tes.xvettInd2 = '';
    tes.ccapVet = '';
    tes.xvetLoc1 = '';
    tes.xvetLoc2 = '';
    tes.cprvVet = '';
    tes.cisoVet = '';
    tes.cvet2 = '';
    tes.cvetAltroSis2 = '';
    tes.vetRagSoc12 = '';
    tes.vetRagSoc22 = '';
    tes.xvettInd12 = '';
    tes.xvettInd22 = '';
    tes.ccapVet2 = '';
    tes.xvetLoc12 = '';
    tes.xvetLoc22 = '';
    tes.cprvVet2 = '';
    tes.cisoVet2 = '';
    tes.copr = '';
    tes.compElenchiIvaAnniPrec = '';
    tes.partitaCollRit = '';
    tes.ctipOprRit = '';
    tes.ctipOprRitAltroSis = '';
    tes.tipContributoPrev = '';
    tes.tipContributoPrevAltroSis = '';
    tes.derivaSpesePie = '';
    tes.iBollo = '';
    tes.iInc = '';
    tes.iSpesa1 = '';
    tes.iSpesa2 = '';
    tes.iBolloOprEse = '';
    tes.codCoint1 = '';
    tes.cfisCoin1 = '';
    tes.pivaCoin1 = '';
    tes.ragSoc1Coin1 = '';
    tes.ragSoc2Coin1 = '';
    tes.xnoteCoin1 = '';
    tes.codCoint2 = '';
    tes.cfisCoin2 = '';
    tes.pivaCoin2 = '';
    tes.ragSoc1Coin2 = '';
    tes.ragSoc2Coin2 = '';
    tes.xnoteCoin2 = '';
    tes.codCoint3 = '';
    tes.cfisCoin3 = '';
    tes.pivaCoin3 = '';
    tes.ragSoc1Coin3 = '';
    tes.ragSoc2Coin3 = '';
    tes.xnoteCoin3 = '';
    tes.codCoint4 = '';
    tes.cfisCoin4 = '';
    tes.pivaCoin4 = '';
    tes.ragSoc1Coin4 = '';
    tes.ragSoc2Coin4 = '';
    tes.xnoteCoin4 = '';
    tes.codCoint5 = '';
    tes.cfisCoin5 = '';
    tes.pivaCoin5 = '';
    tes.ragSoc1Coin5 = '';
    tes.ragSoc2Coin5 = '';
    tes.xnoteCoin5 = '';
    tes.tipProd = '';
    tes.ddecorPag = '';
    tes.datiAggFttEle = '';
    tes.ccentroAnalisi = '';
    tes.ccentroAnalisiAltroSis = '';
    tes.ccomm = '';
    tes.ccommALtroSis = '';
    tes.docRil = '';
    tes.cfisDef = '';
    tes.xcognDef = '';
    tes.xnomeDef = '';
    tes.intAutPlafond = '';
    tes.tipAnaVen = '';
    tes.cven = '';
    tes.cvenEst = '';
    tes.cvenInd = '';
    rig.tipRig = '';
    rig.carticolo = '';
    rig.carticoloAltroSis = '';
    rig.cbarre = '';
    rig.carticoloTerzi = '';
    rig.cconto = '';
    rig.ccontoAltroSis = '';
    rig.cpartitarioAltroSis = '';
    rig.cpartitarioAna = '';
    rig.cbanca = '';
    rig.cbancaAltroSis = '';
    rig.ccatCespite = '';
    rig.ccatCespiteAltroSis = '';
    rig.cpartitarioAltriConti = '';
    rig.cpartitarioAltriContiAltroSis = '';
    rig.descPartAltriConti = '';
    rig.opzComposto = '';
    rig.descrizione1 = '';
    rig.descrizione2 = '';
    rig.descrizione3 = '';
    rig.descrizione4 = '';
    rig.descrizione5 = '';
    rig.descrizioneInterna = '';
    rig.tipGesListino = '';
    rig.clistino = '';
    rig.dconsegna = '';
    rig.calcVar1 = '';
    rig.calcVar2 = '';
    rig.calcVar3 = '';
    rig.calcVar4 = '';
    rig.pesoLordo = '';
    rig.tara = '';
    rig.vol = '';
    rig.ncolli = '';
    rig.uMis = '';
    rig.uMisAltroSis = '';
    rig.qdoc = '';
    rig.qdocScoMerce = '';
    rig.qExpUmSec = '';
    rig.qExpUmMag = '';
    rig.iprz = '';
    rig.sco1 = '';
    rig.fscoAna = '';
    rig.sco2 = '';
    rig.sco3 = '';
    rig.scoUni = '';
    rig.provvAge = '';
    rig.impVal = '';
    rig.cimp = '';
    rig.copeMag = '';
    rig.cdep = '';
    rig.classeStat = '';
    rig.cdep2 = '';
    rig.datiAggFttEle = '';
    rig.datiAggDdtPepp = '';
    rig.rifLotCalf = '';
    rig.rifLotData = '';
    rig.rifLotNum = '';
    rig.qdocLtc = '';
    rig.qExpUmSecLtc = '';
    rig.qExpUmMagLtc = '';
    rig.calcSpe = '';
    rig.oggRilev = '';
    rig.filler1 = '';
    rig.rilevCalcRit = '';
    rig.tracFlussiFinAltroSis = '';
    rig.cig = '';
    rig.cup = '';
    rig.descTraccFlussiFin = '';
    rig.civa = '';
    rig.civaAltroSis = '';
    rig.civaVentilazione = '';
    rig.civaVentilazioneAltroSis = '';
    rig.regIvaSpec = '';
    rig.cindetraibilita = '';
    rig.percIndetra = '';
    rig.percIndetraProRata = '';
    rig.eseComp = '';
    rig.eseCompDa = '';
    rig.eseCompA = '';
    rig.cauCont = '';
    rig.omaggio = '';
    rig.clsOmaggio = '';
    rig.daNonIntegrare = '';
    rig.rifRigOrd = '';
    rig.saldaRigEvasa = '';
    rig.naturaTran = '';
    rig.cmodTran = '';
    rig.cCondConsegna = '';
    rig.cpaeDest = '';
    rig.cprvOrig = '';
    rig.cpaeOrig = '';
    rig.cnomenComb = '';
    rig.iudc = '';
    rig.impValIntra = '';
    rig.massaNetta = '';
    rig.qExpUmSuppl = '';
    rig.valStatNettoMag = '';
    rig.percMag = '';
    rig.modErogSrv = '';
    rig.modInc = '';
    rig.cpaePag = '';
    rig.nFtt = '';
    rig.dFtt = '';
    rig.rettMese = '';
    rig.rettAnno = '';
    rig.rettSegno = '';
    rig.tope = '';
    rig.filler2 = '';
    rig.beniMtdPag = '';
    rig.beniSettForfait = '';
    rig.beniTope = '';
    rig.beniCostoAcq = '';
    rig.beniMargineLordo = '';
    rig.beniFttCollegata = '';
    rig.ordApprovigionamento = '';
    rig.cFornitoreAbituale = '';
    rig.cFornitoreAbitualeAltroSis = '';
    rig.rigaSaldata = '';
    rig.annotazione = '';
    rig.opposizione = '';
    rig.assistenzaDiretta = '';
    rig.cCentroAnalisi = '';
    rig.ccentroAnalisiAltroSis = '';
    rig.ccommessa = '';
    rig.ccommessaAltroSis = '';
    rig.diniComp = '';
    rig.dfineComp = '';
    rig.cvoce = '';
    rig.cvocAltroSis = '';
    iva.civa = '';
    iva.civaAltroSis = '';
    iva.civaVentilazione = '';
    iva.civaVentilazioneAltroSis = '';
    iva.regIvaSpec = '';
    iva.impVal = '';
    iva.impIvaValRig = '';
    iva.percIndetraibilitaOgg = '';
    iva.impIvaOggIndetraibileVal = '';
    iva.percIndetraibilitaProRata = '';
    iva.impIvaOggIndetraibileProRataVal = '';
    iva.filler1 = '';
    iva.filler2 = '';
    iva.filler3 = '';
    iva.filler4 = '';
    iva.filler5 = '';
    iva.filler6 = '';
    iva.filler7 = '';
    par.dsca = '';
    par.pagBloccato = '';
    par.nsContoBanca = '';
    par.nsContoBancaAltroSis = '';
    par.tipPag = '';
    par.tipPagAltroSis = '';
    par.cAppBancario = '';
    par.cabi = '';
    par.ccab = '';
    par.numCC = '';
    par.cin1 = '';
    par.cin2 = '';
    par.cbic = '';
    par.cpae = '';
    par.rifBancaEstera = '';
    par.ciban = '';
    par.impRataVal = '';
    par.annScad = '';
    par.cartComponente = '';
    par.cartComponenteAltroSis = '';
    par.descComponente = '';
    par.iqta = '';
    par.qExpUmSec = '';
    par.cdep = '';
    rec.campoDaNonAcq = ''; //Serve? Si o no... Il campo di schrodinger

}

function csvRig() {
    var str = '';

    str += rec.tipRec + ';';
    str += rec.tes.cDocAut + ';';
    str += rec.tes.dreg + ';';
    str += rec.tes.tipDocFttVen + ';';
    str += rec.tes.tipDocFttAcq + ';';
    str += rec.tes.tipDocPreVen + ';';
    str += rec.tes.tipDocPreAcq + ';';
    str += rec.tes.tipDocOrdVen + ';';
    str += rec.tes.tipDocOrdAcq + ';';
    str += rec.tes.tipDocDdtVen + ';';
    str += rec.tes.tipDocDdtAcq + ';';
    str += rec.tes.nreg + ';';
    str += rec.tes.appDigReg + ';';
    str += rec.tes.nAttIva + ';';
    str += rec.tes.nAttIvaAltroSis + ';';
    str += rec.tes.tipRegIva + ';';
    str += rec.tes.cRegIva + ';';
    str += rec.tes.cRegIvaAltroSis + ';';
    str += rec.tes.ddoc + ';';
    str += rec.tes.ndoc + ';';
    str += rec.tes.nregAnn + ';';
    str += rec.tes.appDigRegAnn + ';';
    str += rec.tes.cConCont + ';';
    str += rec.tes.cConContAltroSis + ';';
    str += rec.tes.cPartAltroSis + ';';
    str += rec.tes.cPart + ';';
    str += rec.tes.cfisPart + ';';
    str += rec.tes.pivaPart + ';';
    str += rec.tes.addAut + ';';
    str += rec.tes.cValDoc + ';';
    str += rec.tes.camb + ';';
    str += rec.tes.cValIntr + ';';
    str += rec.tes.cCambIntr + ';';
    str += rec.tes.cimp + ';';
    str += rec.tes.filler + ';';
    str += rec.tes.iimp + ';';
    str += rec.tes.fpag + ';';
    str += rec.tes.civaNonImp + ';';
    str += rec.tes.civaNonImpAltroSis + ';';
    str += rec.tes.ccatRegIvaSpec + ';';
    str += rec.tes.regIvaSpecPrev + ';';
    str += rec.tes.contRegDocIva + ';';
    str += rec.tes.indetr + ';';
    str += rec.tes.cas1 + ';';
    str += rec.tes.cas2 + ';';
    str += rec.tes.cas3 + ';';
    str += rec.tes.rifVs + ';';
    str += rec.tes.rifNs + ';';
    str += rec.tes.ddtDaFtt + ';';
    str += rec.tes.ddtInc + ';';
    str += rec.tes.ddtFttSosp + ';';
    str += rec.tes.ddtDaFttTipFtt + ';';
    str += rec.tes.ragrFtt + ';';
    str += rec.tes.cage + ';';
    str += rec.tes.cageAltroSis + ';';
    str += rec.tes.provvAge + ';';
    str += rec.tes.provCapoArea + ';';
    str += rec.tes.ccondPag + ';';
    str += rec.tes.ccondPagAltroSis + ';';
    str += rec.tes.scoCondPag + ';';
    str += rec.tes.rilTrackFlussiFin + ';';
    str += rec.tes.rilTrackFlussiFinAltroSis + ';';
    str += rec.tes.idGara + ';';
    str += rec.tes.idProg + ';';
    str += rec.tes.descTrackFlussiFin + ';';
    str += rec.tes.scoTes + ';';
    str += rec.tes.sScoAna + ';';
    str += rec.tes.dini + ';';
    str += rec.tes.dfin + ';';
    str += rec.tes.eseComp + ';';
    str += rec.tes.ddecor + ';';
    str += rec.tes.cBancaNs + ';';
    str += rec.tes.cBancaNsAltroSis + ';';
    str += rec.tes.descBancaRif + ';';
    str += rec.tes.cAppBanc + ';';
    str += rec.tes.cabi + ';';
    str += rec.tes.ccab + ';';
    str += rec.tes.ccin + ';';
    str += rec.tes.ccin2 + ';';
    str += rec.tes.nconcor + ';';
    str += rec.tes.cbic + ';';
    str += rec.tes.cpae + ';';
    str += rec.tes.rifBancaEstera + ';';
    str += rec.tes.ciban + ';';
    str += rec.tes.xcau + ';';
    str += rec.tes.cauAggRegIva1 + ';';
    str += rec.tes.cauAggRegIva2 + ';';
    str += rec.tes.cauAggRegIva3 + ';';
    str += rec.tes.cauAggRegIva4 + ';';
    str += rec.tes.annCompIva + ';';
    str += rec.tes.perCompIva + ';';
    str += rec.tes.dopr + ';';
    str += rec.tes.cessCliPriv + ';';
    str += rec.tes.annRifOpr + ';';
    str += rec.tes.perRifOpr + ';';
    str += rec.tes.rilBlackList + ';';
    str += rec.tes.cAziendaRapp + ';';
    str += rec.tes.cAziendaRappAltroSis + ';';
    str += rec.tes.terrIva + ';';
    str += rec.tes.filler2 + ';';
    str += rec.tes.totDocVal + ';';
    str += rec.tes.nRifInd + ';';
    str += rec.tes.ragSoc1 + ';';
    str += rec.tes.ragSoc2 + ';';
    str += rec.tes.xind1 + ';';
    str += rec.tes.xind2 + ';';
    str += rec.tes.ccap + ';';
    str += rec.tes.xloc1 + ';';
    str += rec.tes.xloc2 + ';';
    str += rec.tes.cprv + ';';
    str += rec.tes.ciso + ';';
    str += rec.tes.ccatCli + ';';
    str += rec.tes.xcatCli + ';';
    str += rec.tes.tipGesList + ';';
    str += rec.tes.clis + ';';
    str += rec.tes.cdep + ';';
    str += rec.tes.cdepRic + ';';
    str += rec.tes.ccauTrasp + ';';
    str += rec.tes.xcauTrasp + ';';
    str += rec.tes.aspBen + ';';
    str += rec.tes.xAspBen + ';';
    str += rec.tes.cporto + ';';
    str += rec.tes.xporto + ';';
    str += rec.tes.traspMez + ';';
    str += rec.tes.xTraspMex + ';';
    str += rec.tes.diniTrasp + ';';
    str += rec.tes.oiniTrasp + ';';
    str += rec.tes.xmezz + ';';
    str += rec.tes.targaMez + ';';
    str += rec.tes.cvet + ';';
    str += rec.tes.cvetAltroSis + ';';
    str += rec.tes.vetRagSoc1 + ';';
    str += rec.tes.vetRagSoc2 + ';';
    str += rec.tes.xvettInd1 + ';';
    str += rec.tes.xvettInd2 + ';';
    str += rec.tes.ccapVet + ';';
    str += rec.tes.xvetLoc1 + ';';
    str += rec.tes.xvetLoc2 + ';';
    str += rec.tes.cprvVet + ';';
    str += rec.tes.cisoVet + ';';
    str += rec.tes.cvet2 + ';';
    str += rec.tes.cvetAltroSis2 + ';';
    str += rec.tes.vetRagSoc12 + ';';
    str += rec.tes.vetRagSoc22 + ';';
    str += rec.tes.xvettInd12 + ';';
    str += rec.tes.xvettInd22 + ';';
    str += rec.tes.ccapVet2 + ';';
    str += rec.tes.xvetLoc12 + ';';
    str += rec.tes.xvetLoc22 + ';';
    str += rec.tes.cprvVet2 + ';';
    str += rec.tes.cisoVet2 + ';';
    str += rec.tes.copr + ';';
    str += rec.tes.compElenchiIvaAnniPrec + ';';
    str += rec.tes.partitaCollRit + ';';
    str += rec.tes.ctipOprRit + ';';
    str += rec.tes.ctipOprRitAltroSis + ';';
    str += rec.tes.tipContributoPrev + ';';
    str += rec.tes.tipContributoPrevAltroSis + ';';
    str += rec.tes.derivaSpesePie + ';';
    str += rec.tes.iBollo + ';';
    str += rec.tes.iInc + ';';
    str += rec.tes.iSpesa1 + ';';
    str += rec.tes.iSpesa2 + ';';
    str += rec.tes.iBolloOprEse + ';';
    str += rec.tes.codCoint1 + ';';
    str += rec.tes.cfisCoin1 + ';';
    str += rec.tes.pivaCoin1 + ';';
    str += rec.tes.ragSoc1Coin1 + ';';
    str += rec.tes.ragSoc2Coin1 + ';';
    str += rec.tes.xnoteCoin1 + ';';
    str += rec.tes.codCoint2 + ';';
    str += rec.tes.cfisCoin2 + ';';
    str += rec.tes.pivaCoin2 + ';';
    str += rec.tes.ragSoc1Coin2 + ';';
    str += rec.tes.ragSoc2Coin2 + ';';
    str += rec.tes.xnoteCoin2 + ';';
    str += rec.tes.codCoint3 + ';';
    str += rec.tes.cfisCoin3 + ';';
    str += rec.tes.pivaCoin3 + ';';
    str += rec.tes.ragSoc1Coin3 + ';';
    str += rec.tes.ragSoc2Coin3 + ';';
    str += rec.tes.xnoteCoin3 + ';';
    str += rec.tes.codCoint4 + ';';
    str += rec.tes.cfisCoin4 + ';';
    str += rec.tes.pivaCoin4 + ';';
    str += rec.tes.ragSoc1Coin4 + ';';
    str += rec.tes.ragSoc2Coin4 + ';';
    str += rec.tes.xnoteCoin4 + ';';
    str += rec.tes.codCoint5 + ';';
    str += rec.tes.cfisCoin5 + ';';
    str += rec.tes.pivaCoin5 + ';';
    str += rec.tes.ragSoc1Coin5 + ';';
    str += rec.tes.ragSoc2Coin5 + ';';
    str += rec.tes.xnoteCoin5 + ';';
    str += rec.tes.tipProd + ';';
    str += rec.tes.ddecorPag + ';';
    str += rec.tes.datiAggFttEle + ';';
    str += rec.tes.ccentroAnalisi + ';';
    str += rec.tes.ccentroAnalisiAltroSis + ';';
    str += rec.tes.ccomm + ';';
    str += rec.tes.ccommALtroSis + ';';
    str += rec.tes.docRil + ';';
    str += rec.tes.cfisDef + ';';
    str += rec.tes.xcognDef + ';';
    str += rec.tes.xnomeDef + ';';
    str += rec.tes.intAutPlafond + ';';
    str += rec.tes.tipAnaVen + ';';
    str += rec.tes.cven + ';';
    str += rec.tes.cvenEst + ';';
    str += rec.tes.cvenInd + ';';
    str += rec.rig.tipRig + ';';
    str += rec.rig.carticolo + ';';
    str += rec.rig.carticoloAltroSis + ';';
    str += rec.rig.cbarre + ';';
    str += rec.rig.carticoloTerzi + ';';
    str += rec.rig.cconto + ';';
    str += rec.rig.ccontoAltroSis + ';';
    str += rec.rig.cpartitarioAltroSis + ';';
    str += rec.rig.cpartitarioAna + ';';
    str += rec.rig.cbanca + ';';
    str += rec.rig.cbancaAltroSis + ';';
    str += rec.rig.ccatCespite + ';';
    str += rec.rig.ccatCespiteAltroSis + ';';
    str += rec.rig.cpartitarioAltriConti + ';';
    str += rec.rig.cpartitarioAltriContiAltroSis + ';';
    str += rec.rig.descPartAltriConti + ';';
    str += rec.rig.opzComposto + ';';
    str += rec.rig.descrizione1 + ';';
    str += rec.rig.descrizione2 + ';';
    str += rec.rig.descrizione3 + ';';
    str += rec.rig.descrizione4 + ';';
    str += rec.rig.descrizione5 + ';';
    str += rec.rig.descrizioneInterna + ';';
    str += rec.rig.tipGesListino + ';';
    str += rec.rig.clistino + ';';
    str += rec.rig.dconsegna + ';';
    str += rec.rig.calcVar1 + ';';
    str += rec.rig.calcVar2 + ';';
    str += rec.rig.calcVar3 + ';';
    str += rec.rig.calcVar4 + ';';
    str += rec.rig.pesoLordo + ';';
    str += rec.rig.tara + ';';
    str += rec.rig.vol + ';';
    str += rec.rig.ncolli + ';';
    str += rec.rig.uMis + ';';
    str += rec.rig.uMisAltroSis + ';';
    str += rec.rig.qdoc + ';';
    str += rec.rig.qdocScoMerce + ';';
    str += rec.rig.qExpUmSec + ';';
    str += rec.rig.qExpUmMag + ';';
    str += rec.rig.iprz + ';';
    str += rec.rig.sco1 + ';';
    str += rec.rig.fscoAna + ';';
    str += rec.rig.sco2 + ';';
    str += rec.rig.sco3 + ';';
    str += rec.rig.scoUni + ';';
    str += rec.rig.provvAge + ';';
    str += rec.rig.impVal + ';';
    str += rec.rig.cimp + ';';
    str += rec.rig.copeMag + ';';
    str += rec.rig.cdep + ';';
    str += rec.rig.classeStat + ';';
    str += rec.rig.cdep2 + ';';
    str += rec.rig.datiAggFttEle + ';';
    str += rec.rig.datiAggDdtPepp + ';';
    str += rec.rig.rifLotCalf + ';';
    str += rec.rig.rifLotData + ';';
    str += rec.rig.rifLotNum + ';';
    str += rec.rig.qdocLtc + ';';
    str += rec.rig.qExpUmSecLtc + ';';
    str += rec.rig.qExpUmMagLtc + ';';
    str += rec.rig.calcSpe + ';';
    str += rec.rig.oggRilev + ';';
    str += rec.rig.filler1 + ';';
    str += rec.rig.rilevCalcRit + ';';
    str += rec.rig.tracFlussiFinAltroSis + ';';
    str += rec.rig.cig + ';';
    str += rec.rig.cup + ';';
    str += rec.rig.descTraccFlussiFin + ';';
    str += rec.rig.civa + ';';
    str += rec.rig.civaAltroSis + ';';
    str += rec.rig.civaVentilazione + ';';
    str += rec.rig.civaVentilazioneAltroSis + ';';
    str += rec.rig.regIvaSpec + ';';
    str += rec.rig.cindetraibilita + ';';
    str += rec.rig.percIndetra + ';';
    str += rec.rig.percIndetraProRata + ';';
    str += rec.rig.eseComp + ';';
    str += rec.rig.eseCompDa + ';';
    str += rec.rig.eseCompA + ';';
    str += rec.rig.cauCont + ';';
    str += rec.rig.omaggio + ';';
    str += rec.rig.clsOmaggio + ';';
    str += rec.rig.daNonIntegrare + ';';
    str += rec.rig.rifRigOrd + ';';
    str += rec.rig.saldaRigEvasa + ';';
    str += rec.rig.naturaTran + ';';
    str += rec.rig.cmodTran + ';';
    str += rec.rig.cCondConsegna + ';';
    str += rec.rig.cpaeDest + ';';
    str += rec.rig.cprvOrig + ';';
    str += rec.rig.cpaeOrig + ';';
    str += rec.rig.cnomenComb + ';';
    str += rec.rig.iudc + ';';
    str += rec.rig.impValIntra + ';';
    str += rec.rig.massaNetta + ';';
    str += rec.rig.qExpUmSuppl + ';';
    str += rec.rig.valStatNettoMag + ';';
    str += rec.rig.percMag + ';';
    str += rec.rig.modErogSrv + ';';
    str += rec.rig.modInc + ';';
    str += rec.rig.cpaePag + ';';
    str += rec.rig.nFtt + ';';
    str += rec.rig.dFtt + ';';
    str += rec.rig.rettMese + ';';
    str += rec.rig.rettAnno + ';';
    str += rec.rig.rettSegno + ';';
    str += rec.rig.tope + ';';
    str += rec.rig.filler2 + ';';
    str += rec.rig.beniMtdPag + ';';
    str += rec.rig.beniSettForfait + ';';
    str += rec.rig.beniTope + ';';
    str += rec.rig.beniCostoAcq + ';';
    str += rec.rig.beniMargineLordo + ';';
    str += rec.rig.beniFttCollegata + ';';
    str += rec.rig.ordApprovigionamento + ';';
    str += rec.rig.cFornitoreAbituale + ';';
    str += rec.rig.cFornitoreAbitualeAltroSis + ';';
    str += rec.rig.rigaSaldata + ';';
    str += rec.rig.annotazione + ';';
    str += rec.rig.opposizione + ';';
    str += rec.rig.assistenzaDiretta + ';';
    str += rec.rig.cCentroAnalisi + ';';
    str += rec.rig.ccentroAnalisiAltroSis = ';';
    str += rec.rig.ccommessa + ';';
    str += rec.rig.ccommessaAltroSis + ';';
    str += rec.rig.diniComp + ';';
    str += rec.rig.dfineComp + ';';
    str += rec.rig.cvoce + ';';
    str += rec.rig.cvocAltroSis + ';';
    str += rec.iva.civa + ';';
    str += rec.iva.civaAltroSis + ';';
    str += rec.iva.civaVentilazione + ';';
    str += rec.iva.civaVentilazioneAltroSis + ';';
    str += rec.iva.regIvaSpec + ';';
    str += rec.iva.impVal + ';';
    str += rec.iva.impIvaValRig + ';';
    str += rec.iva.percIndetraibilitaOgg + ';';
    str += rec.iva.impIvaOggIndetraibileVal + ';';
    str += rec.iva.percIndetraibilitaProRata + ';';
    str += rec.iva.impIvaOggIndetraibileProRataVal + ';';
    str += rec.iva.filler1 + ';';
    str += rec.iva.filler2 + ';';
    str += rec.iva.filler3 + ';';
    str += rec.iva.filler4 + ';';
    str += rec.iva.filler5 + ';';
    str += rec.iva.filler6 + ';';
    str += rec.iva.filler7 + ';';
    str += rec.par.dsca + ';';
    str += rec.par.pagBloccato + ';';
    str += rec.par.nsContoBanca + ';';
    str += rec.par.nsContoBancaAltroSis + ';';
    str += rec.par.tipPag + ';';
    str += rec.par.tipPagAltroSis + ';';
    str += rec.par.cAppBancario + ';';
    str += rec.par.cabi + ';';
    str += rec.par.ccab + ';';
    str += rec.par.numCC + ';';
    str += rec.par.cin1 + ';';
    str += rec.par.cin2 + ';';
    str += rec.par.cbic + ';';
    str += rec.par.cpae + ';';
    str += rec.par.rifBancaEstera + ';';
    str += rec.par.ciban + ';';
    str += rec.par.impRataVal + ';';
    str += rec.par.annScad + ';';
    str += rec.par.cartComponente + ';';
    str += rec.par.cartComponenteAltroSis + ';';
    str += rec.par.descComponente + ';';
    str += rec.par.iqta + ';';
    str += rec.par.qExpUmSec + ';';
    str += rec.par.cdep + ';';


    csv[csvEl] = str;
    csvEl++;

    console.log(str);
}

function csvRig93() {
    var str = '';

    str += rec.tipRec + ';';
    str += rec.tes.tipDocOrdVen + ';';
    str += rec.tes.dreg + ';';
    str += rec.tes.nreg + ';';
    str += rec.tes.appDigReg + ';';
    str += rec.tes.ddoc + ';';
    str += rec.tes.ndoc + ';';
    str += rec.tes.cPart + ';';
    str += rec.tes.cValDoc + ';';
    str += rec.tes.camb + ';';
    str += rec.tes.cimp + ';';
    str += rec.tes.civaNonImp + ';';
    str += rec.tes.cas1 + ';';
    str += rec.tes.cas2 + ';';
    str += rec.tes.cas3 + ';';
    str += rec.tes.ccondPag + ';';
    str += rec.tes.scoCondPag + ';';
    str += rec.tes.ddecor + ';';
    str += rec.tes.cBancaNs + ';';
    str += rec.tes.cabi + ';';
    str += rec.tes.ccab + ';';
    str += rec.tes.ccin + ';';
    str += rec.tes.ccin2 + ';';
    str += rec.tes.nconcor + ';';
    str += rec.tes.cbic + ';';
    str += rec.tes.cpae + ';';
    str += rec.tes.rifBancaEstera + ';';
    str += rec.tes.ciban + ';';
    str += rec.tes.nRifInd + ';';
    str += rec.tes.ragSoc1 + ';';
    str += rec.tes.ragSoc2 + ';';
    str += rec.tes.xind1 + ';';
    str += rec.tes.ccap + ';';
    str += rec.tes.xloc1 + ';';
    str += rec.tes.cprv + ';';
    str += rec.tes.ccauTrasp + ';';
    str += rec.tes.xcauTrasp + ';';
    str += rec.tes.cporto + ';';
    str += rec.tes.xporto + ';';
    str += rec.tes.aspBen + ';';
    str += rec.tes.xAspBen + ';';
    str += rec.tes.traspMez + ';';
    str += rec.tes.xTraspMex + ';';
    str += rec.tes.cvet + ';';
    str += rec.tes.vetRagSoc1 + ';';
    str += rec.tes.xvettInd1 + ';';
    str += rec.tes.ccapVet + ';';
    str += rec.tes.xvetLoc1 + ';';
    str += rec.tes.cprvVet + ';';
    str += rec.tes.cvet2 + ';';
    str += rec.tes.vetRagSoc12 + ';';
    str += rec.tes.xvettInd12 + ';';
    str += rec.tes.ccapVet2 + ';';
    str += rec.tes.xvetLoc12 + ';';
    str += rec.tes.cprvVet2 + ';';
    str += rec.rig.tipRig + ';';
    str += rec.rig.carticolo + ';';
    str += rec.rig.cconto + ';';
    str += rec.rig.descrizione1 + ';';
    str += rec.rig.clistino + ';';
    str += rec.rig.dconsegna + ';';
    str += rec.rig.calcVar1 + ';';
    str += rec.rig.calcVar2 + ';';
    str += rec.rig.calcVar3 + ';';
    str += rec.rig.calcVar4 + ';';
    str += rec.rig.pesoLordo + ';';
    str += rec.rig.tara + ';';
    str += rec.rig.uMis + ';';
    str += rec.rig.qdoc + ';';
    str += rec.rig.qdocScoMerce + ';';
    str += rec.rig.qExpUmSec + ';';
    str += rec.rig.iprz + ';';
    str += rec.rig.sco1 + ';';
    str += rec.rig.sco2 + ';';
    str += rec.rig.sco3 + ';';
    str += rec.rig.impVal + ';';
    str += rec.rig.cimp + ';';
    str += rec.rig.cdep + ';';
    str += rec.rig.cdep2 + ';';
    str += rec.rig.rifLotCalf + ';';
    str += rec.rig.rifLotData + ';';
    str += rec.rig.rifLotNum + ';';
    str += rec.rig.calcSpe + ';';
    str += rec.rig.civa + ';';
    str += rec.rig.ordApprovigionamento + ';';
    str += rec.rig.cFornitoreAbituale + ';';
    str += rec.tes.derivaSpesePie + ';';
    str += rec.tes.iBollo + ';';
    str += rec.tes.iInc + ';';
    str += rec.tes.iSpesa1 + ';';
    str += rec.tes.iSpesa2 + ';';
    str += rec.tes.iBolloOprEse + ';';
    str += rec.rig.rigaSaldata + ';';


    csv[csvEl] = str;
    csvEl++;

    console.log(str);
}

function getRigheCSV(res, req, nreg, righe, cliente, agente) {
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
            initializeCSV();
            rec.tipRec = 'RIG';
            rig.tipRig = '1';
            rig.carticolo = product.ccod;
            rig.carticoloAltroSis = '';
            rig.cbarre = '';
            rig.carticoloTerzi = '';
            rig.cconto = '';
            rig.ccontoAltroSis = '';
            rig.cpartitarioAltroSis = '';
            rig.cpartitarioAna = cliente.ccod;
            rig.cbanca = '';
            rig.cbancaAltroSis = '';
            rig.ccatCespite = '';
            rig.ccatCespiteAltroSis = '';
            rig.cpartitarioAltriConti = '';
            rig.cpartitarioAltriContiAltroSis = '';
            rig.descPartAltriConti = '';
            rig.opzComposto = '';
            rig.descrizione1 = product.xdesc;
            rig.descrizione2 = '';
            rig.descrizione3 = '';
            rig.descrizione4 = '';
            rig.descrizione5 = '';
            rig.descrizioneInterna = rig.descrizione1;
            rig.tipGesListino = '';
            rig.clistino = '01';
            rig.dconsegna = '';
            rig.calcVar1 = '';
            rig.calcVar2 = '';
            rig.calcVar3 = '';
            rig.calcVar4 = '';
            rig.pesoLordo = '';
            rig.tara = '';
            rig.vol = '';
            rig.ncolli = '';
            rig.uMis = 'pz';
            rig.uMisAltroSis = '';
            rig.qdoc = product.iqta;
            rig.qdocScoMerce = '';
            rig.qExpUmSec = '';
            rig.qExpUmMag = '';
            rig.iprz = prodRes.iprz;
            rig.sco1 = '';
            rig.fscoAna = '';
            rig.sco2 = '';
            rig.sco3 = '';
            rig.scoUni = '';
            rig.provvAge = (agente && agente.percprovv ? agente.percprovv : '');
            rig.impVal = product.iimp;
            rig.cimp = '1';
            rig.copeMag = '';
            rig.cdep = '';
            rig.classeStat = '';
            rig.cdep2 = '';
            rig.datiAggFttEle = '';
            rig.datiAggDdtPepp = '';
            rig.rifLotCalf = '';
            rig.rifLotData = '';
            rig.rifLotNum = '';
            rig.qdocLtc = '';
            rig.qExpUmSecLtc = '';
            rig.qExpUmMagLtc = '';
            rig.calcSpe = '';
            rig.oggRilev = '';
            rig.filler1 = '';
            rig.rilevCalcRit = '';
            rig.tracFlussiFinAltroSis = '';
            rig.cig = '';
            rig.cup = '';
            rig.descTraccFlussiFin = '';
            rig.civa = '22';
            rig.civaAltroSis = '';
            rig.civaVentilazione = '';
            rig.civaVentilazioneAltroSis = '';
            rig.regIvaSpec = '';
            rig.cindetraibilita = '';
            rig.percIndetra = '';
            rig.percIndetraProRata = '';
            rig.eseComp = '';
            rig.eseCompDa = '';
            rig.eseCompA = '';
            rig.cauCont = '';
            rig.omaggio = '';
            rig.clsOmaggio = '';
            rig.daNonIntegrare = '';
            rig.rifRigOrd = '';
            rig.saldaRigEvasa = '';
            rig.naturaTran = '';
            rig.cmodTran = '';
            rig.cCondConsegna = '';
            rig.cpaeDest = '';
            rig.cprvOrig = '';
            rig.cpaeOrig = '';
            rig.cnomenComb = '';
            rig.iudc = '';
            rig.impValIntra = '';
            rig.massaNetta = '';
            rig.qExpUmSuppl = '';
            rig.valStatNettoMag = '';
            rig.percMag = '';
            rig.modErogSrv = '';
            rig.modInc = '';
            rig.cpaePag = '';
            rig.nFtt = '';
            rig.dFtt = '';
            rig.rettMese = '';
            rig.rettAnno = '';
            rig.rettSegno = '';
            rig.tope = '';
            rig.filler2 = '';
            rig.beniMtdPag = '';
            rig.beniSettForfait = '';
            rig.beniTope = '';
            rig.beniCostoAcq = '';
            rig.beniMargineLordo = '';
            rig.beniFttCollegata = '';
            rig.ordApprovigionamento = '';
            rig.cFornitoreAbituale = '';
            rig.cFornitoreAbitualeAltroSis = '';
            rig.rigaSaldata = '';
            rig.annotazione = '';
            rig.opposizione = '';
            rig.assistenzaDiretta = '';
            rig.cCentroAnalisi = '';
            rig.ccentroAnalisiAltroSis = '';
            rig.ccommessa = '';
            rig.ccommessaAltroSis = '';
            rig.diniComp = '';
            rig.dfineComp = '';
            rig.cvoce = '';
            rig.cvocAltroSis = '';
            rec.rig = rig;
            csvRig93();


            if (i === righe.length - 1) {
                Order.updateNreg(righe[0].ccod, function (nregErr, nregRes) {
                    if (nregErr) {
                        console.log(nregErr);
                    } else {
                        Order.updateStatus(righe[0].ccod, 50, function (sttErr, sttRes) {
                            if (sttErr) {
                                console.log(sttErr);
                            } else {
                                res.download(sendFile(nregRes, righe[0].ccod));
                            }
                        });
                    }
                });
                return;
            }
            i++;
            getRigheCSV(res, req, nreg, righe, cliente);
        }
    });
}

function sendFile(nreg, idOrd) {
    var fs = require('fs');
    var fd;
    var d = new Date();
    var file = '';
    d = dateFormat(d, "isoDateTime");

    try {
        console.log('dir name: ' + __dirname);
        if (!(fs.existsSync(__dirname + '/../public/file'))) {
            console.log("filesystem de merda!");
        }
        file = __dirname + '/../public/file/ord_' + idOrd + '_nreg_' + nreg + '_' + d.replace(/:/g, '.').substr(0, 19) + '.csv';
        fd = fs.openSync(file, 'a');
        for (csvEl = 0; csvEl < csv.length; csvEl++) {
            fs.appendFileSync(fd, csv[csvEl].toString() + "\n", 'utf8');
        }
        return file;
    } catch (err) {
        console.log('Errore creazione file: ' + err);
    } finally {
        if (fd !== undefined)
            fs.closeSync(fd);
    }
}

function getIqta(ccod, task) {

    return obj.ccod === ccod;
}
