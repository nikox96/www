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

    app.get('/get-csv',isLoggedIn,function (req, res) {
        var rig = {}, tes={}, rec = {}, ltc = {}, iva = {}, par = {}:
        rec.tipRec='';
        tes.cDocAut='';
        tes.dreg='';
        tes.tipDocFttVen='';
        tes.tipDocFttAcq='';
        tes.tipDocPreVen='';
        tes.tipDocPreAcq='';
        tes.tipDocOrdVen='';
        tes.tipDocOrdAcq='';
        tes.tipDocDdtVen='';
        tes.tipDocDdtAcq='';
        tes.nreg='';
        tes.appDigReg='';
        tes.nAttIva='';
        tes.nAttIvaAltroSis='';
        tes.tipRegIva='';
        tes.cRegIva='';
        tes.cRegIvaAltroSis='';
        tes.ddoc='';
        tes.ndoc='';
        tes.nregAnn='';
        tes.appDigRegAnn='';
        tes.cConCont='';
        tes.cConContAltroSis='';
        tes.cPartAltroSis='';
        tes.cPart='';
        tes.cfisPart='';
        tes.pivaPart='';
        tes.addAut='';
        tes.cValDoc='';
        tes.camb='';
        tes.cValIntr='';
        tes.cimp='';
        tes.filler='';
        tes.iimp='';
        tes.fpag='';
        tes.civaNonImp='';
        tes.civaNonImpAltroSis='';
        tes.ccatRegIvaSpec='';
        tes.regIvaSpecPrev='';
        tes.contRegDocIva='';
        tes.indetr='';
        tes.cas1='';
        tes.cas2='';
        tes.cas3='';
        tes.rifVs='';
        tes.rifNs='';
        tes.ddtDaFtt='';
        tes.ddtInc='';
        tes.ddtFttSosp='';
        tes.ddtDaFttTipFtt='';
        tes.ragrFtt='';
        tes.cage='';
        tes.cageAltroSis='';
        tes.provvAge='';
        tes.provCapoArea='';
        tes.ccondPag='';
        tes.ccondPagAltroSis='';
        tes.scoCondPag='';
        tes.rilTrackFlussiFin='';
        tes.rilTrackFlussiFinAltroSis='';
        tes.idGara='';
        tes.idProg='';
        tes.descTrackFlussiFin='';
        tes.scoTes='';
        tes.sScoAna='';
        tes.dini='';
        tes.dfin='';
        tes.eseComp='';
        tes.ddecor='';
        tes.cBancaNs='';
        tes.cBancaNsAltroSis='';
        tes.descBancaRif='';
        tes.cAppBanc='';
        tes.cabi='';
        tes.ccab='';
        tes.ccin='';
        tes.ccin2='';
        tes.nconcor='';
        tes.cbic='';
        tes.cpae='';
        tes.rifBancaEstera='';
        tes.ciban='';
        tes.xcau='';
        tes.cauAggRegIva1='';
        tes.cauAggRegIva2='';
        tes.cauAggRegIva3='';
        tes.cauAggRegIva4='';
        tes.annCompIva='';
        tes.perCompIva='';
        tes.dopr='';
        tes.cessCliPriv='';
        tes.annRifOpr='';
        tes.perRifOpr='';
        tes.rilBlackList='';
        tes.cAziendaRapp='';
        tes.cAziendaRappAltroSis='';
        tes.terrIva='';
        tes.filler2='';
        tes.totDocVal='';
        tes.nRifInd='';
        tes.ragSoc1='';
        tes.ragSoc2='';
        tes.xind1='';
        tes.xind2='';
        tes.ccap='';
        tes.xloc1='';
        tes.xloc2='';
        tes.cprv='';
        tes.ciso='';
        tes.ccatCli='';
        tes.xcatCli='';
        tes.tipGesList='';
        tes.clis='';
        tes.cdep='';
        tes.cdepRic='';
        tes.ccauTrasp='';
        tes.xcauTrasp='';
        tes.aspBen='';
        tes.xAspBen='';
        tes.cporto='';
        tes.xporto='';
        tes.traspMez='';
        tes.xTraspMex='';
        tes.diniTrasp='';
        tes.oiniTrasp='';
        tes.xmezz='';
        tes.targaMez='';
        tes.cvet='';
        tes.cvetAltroSis='';
        tes.vetRagSoc1='';
        tes.vetRagSoc2='';
        tes.xvettInd1='';
        tes.xvettInd2='';
        tes.ccapVet='';
        tes.xvetLoc1='';
        tes.xvetLoc2='';
        tes.cprvVet='';
        tes.cisoVet='';
        tes.cvet2='';
        tes.cvetAltroSis2='';
        tes.vetRagSoc12='';
        tes.vetRagSoc22='';
        tes.xvettInd12='';
        tes.xvettInd22='';
        tes.ccapVet2='';
        tes.xvetLoc12='';
        tes.xvetLoc22='';
        tes.cprvVet2='';
        tes.cisoVet2='';
        tes.copr='';
        tes.compElenchiIvaAnniPrec='';
        tes.partitaCollRit='';
        tes.ctipOprRit='';
        tes.ctipOprRitAltroSis='';
        tes.tipContributoPrev='';
        tes.tipContributoPrevAltroSis='';
        tes.derivaSpesePie='';
        tes.iBollo='';
        tes.iInc='';
        tes.iSpesa1='';
        tes.iSpesa2='';
        tes.iBolloOprEse='';
        tes.codCoint1='';
        tes.cfisCoin1='';
        tes.pivaCoin1='';
        tes.ragSoc1Coin1='';
        tes.ragSoc2Coin1='';
        tes.xnoteCoin1='';
        tes.codCoint2='';
        tes.cfisCoin2='';
        tes.pivaCoin2='';
        tes.ragSoc1Coin2='';
        tes.ragSoc2Coin2='';
        tes.xnoteCoin2='';
        tes.codCoint3='';
        tes.cfisCoin3='';
        tes.pivaCoin3='';
        tes.ragSoc1Coin3='';
        tes.ragSoc2Coin3='';
        tes.xnoteCoin3='';
        tes.codCoint4='';
        tes.cfisCoin4='';
        tes.pivaCoin4='';
        tes.ragSoc1Coin4='';
        tes.ragSoc2Coin4='';
        tes.xnoteCoin4='';
        tes.codCoint5='';
        tes.cfisCoin5='';
        tes.pivaCoin5='';
        tes.ragSoc1Coin5='';
        tes.ragSoc2Coin5='';
        tes.xnoteCoin5='';
        tes.tipProd='';
        tes.ddecorPag='';
        tes.datiAggFttEle='';
        tes.ccentroAnalisi='';
        tes.ccentroAnalisiAltroSis='';
        tes.ccomm='';
        tes.ccommALtroSis='';
        tes.docRil='';
        tes.cfisDef='';
        tes.xcognDef='';
        tes.xnomeDef='';
        tes.intAutPlafond='';
        tes.tipAnaVen='';
        tes.cven='';
        tes.cvenEst='';
        tes.cvenInd='';
        rig.tipRig='';
        rig.carticolo='';
        rig.carticoloAltroSis='';
        rig.cbarre='';
        rig.carticoloTerzi='';
        rig.cconto='';
        rig.ccontoAltroSis='';
        rig.cpartitarioAltroSis='';
        rig.cpartitarioAna='';
        rig.cbanca='';
        rig.cbancaAltroSis='';
        rig.ccatCespite='';
        rig.ccatCespiteAltroSis='';
        rig.cpartitarioAltriConti='';
        rig.cpartitarioAltriContiAltroSis='';
        rig.opzComposto='';
        rig.descrizione1='';
        rig.descrizione2='';
        rig.descrizione3='';
        rig.descrizione4='';
        rig.descrizione5='';
        rig.descrizioneInterna='';
        rig.tipGesListino='';
        rig.clistino='';
        rig.dconsegna='';
        rig.calcVar1='';
        rig.calcVar2='';
        rig.calcVar3='';
        rig.calcVar4='';
        rig.pesoLordo='';
        rig.tara='';
        rig.vol='';
        rig.ncolli='';
        rig.uMis='';
        rig.qdoc='';
        rig.qdocScoMerce='';
        rig.qExpUmSec='';
        rig.qExpUmMag='';
        rig.iprz='';
        rig.sco1='';
        rig.fscoAna='';
        rig.sco2='';
        rig.sco3='';
        rig.scoUni='';
        rig.provvAge='';
        rig.impVal='';
        rig.cimp='';
        rig.copeMag='';
        rig.cdep='';
        rig.classeStat='';
        rig.cdep2='';
        rig.datiAggFttEle='';
        rig.datiAggDdtPepp='';
        rig.rifLotCalf='';
        rig.rifLotData='';
        rig.rifLotNum='';
        ltc.qdoc='';
        ltc.qExpUmSec='';
        ltc.qExpUmMag='';
        rig.calcSpe='';
        rig.oggRilev='';
        rig.filler1='';
		rig.rilevCalcRit='';
		rig.tracFlussiFinAltroSis='';
		rig.cig='';
		rig.cup='';
		rig.descTraccFlussiFin='';
		rig.civa='';
		rig.civaAltroSis='';
		rig.civaVentilazione='';
		rig.civaVentilazioneAltroSis='';
		rig.regIvaSpec='';
		rig.cindetraibilita='';
		rig.percIndetra='';
		rig.percIndetraProRata='';
		rig.eseComp='';
		rig.eseCompDa='';
		rig.eseCompA='';
		rig.cauCont='';
		rig.omaggio='';
		rig.clsOmaggio='';
		rig.daNonIntegrare='';
		rig.rifRigOrd='';
		rig.saldaRigEvasa='';
		rig.naturaTran='';
		rig.cmodTran='';
		rig.cCondConsegna='';
		rig.cpaeDest='';
		rig.cprvOrig='';
		rig.cpaeOrig='';
		rig.cnomenComb='';
		rig.iudc='';
		rig.impVal='';
		rig.massaNetta='';
		rig.qExpUmSuppl='';
		rig.valStatNettoMag='';
		rig.percMag='';
		rig.modErogSrv='';
		rig.modInc='';
		rig.cpaePag='';
		rig.nFtt='';
		rig.dFtt='';
		rig.rettMese='';
		rig.rettAnno='';
		rig.rettSegno='';
		rig.tope='';
		rig.filler2='';
		rig.beniMtdPag='';
		rig.beniSettForfait='';
		rig.beniTope='';
		rig.beniCostoAcq='';
		rig.beniMargineLordo='';
		rig.beniFttCollegata='';
		rig.ordApprovigionamento='';
		rig.cFornitoreAbituale='';
		rig.cFornitoreAbitualeAltroSis='';
		rig.ccommessa='';
		rig.ccommessaAltroSis='';
		rig.diniComp='';
		rig.dfineComp='';
		rig.cvoce='';
		rig.cvocAltroSis='';
		iva.civa='';
		iva.civaAltroSis='';
		iva.civaVentilazione='';
		iva.civaVentilazioneAltroSis='';
		iva.regIvaSpec='';
		iva.impVal='';
		iva.impIvaValRig='';
		rig.percIndetraibilitaOgg='';
		rig.impIvaOggIndetraibileVal='';
		rig.percIndetraibilitaProRata='';
		rig.impIvaOggIndetraibileProRataVal='';
		rig.filler1='';
		rig.filler2='';
		rig.filler3='';
		rig.filler4='';
		rig.filler5='';
		rig.filler6='';
		rig.filler7='';
		par.dsca='';
		par.pagBloccato='';
		par.nsContoBanca='';
		par.nsContoBancaAltroSis='';
		par.tipPag='';
		par.tipPagAltroSis='';
		par.cAppBancario='';
		par.cabi='';
		par.ccab='';
		par.numCC='';
		par.cin1='';
		par.cin2='';
		par.cbic='';
		par.cpae='';
		par.rifBancaEstera='';
		par.ciban='';
		par.impRataVal='';
		par.annScad='';
		par.cartComponente='';
		par.cartComponenteAltroSis='';
		par.descComponente='';
		par.iqta='';
		par.qExpUmSec='';
		rec.campoDaNonAcq=''; //Serve? Si o no... Il campo di schrodinger
		
        rec.tes=tes;
        rec.rig=rig;
		rec.iva=iva;
        rec.ltc=ltc;
		rec.par=par;
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

function getIqta(ccod, task) {

    return obj.ccod === ccod;
}
