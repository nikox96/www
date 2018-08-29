-- create table agenti
CREATE TABLE agenti (	cage INT(5) NOT NULL COMMENT 'Codice agente',
                        percProvv DECIMAL(5,2) NOT NULL COMMENT 'Percenuale provvigione',
			PRIMARY KEY(cage));
            
-- create table users
CREATE TABLE users (	cage INT(5) NOT NULL COMMENT 'Codice agente',
			cuser VARCHAR(30) NOT NULL COMMENT 'Codice utente',
			xnome VARCHAR(15) NOT NULL COMMENT 'Nome agente',
			xcogn VARCHAR(15) NOT NULL COMMENT 'Cognome agente',
			xpwd BINARY(60) NOT NULL COMMENT 'Password utente',
			PRIMARY KEY(cage),
			UNIQUE KEY (cuser),
            FOREIGN KEY (cage)
				REFERENCES agenti(cage)
				ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=INNODB;

-- create table condizioni_pagamento
CREATE TABLE condizioni_pagamento (	ccod INT(3) NOT NULL COMMENT 'Codice',
					xcond VARCHAR(35) NOT NULL COMMENT 'Descrizione',
					psco DECIMAL(5,2) COMMENT '% Sconto',
					nsca INT(2) NOT NULL COMMENT 'Numero scadenze',
					PRIMARY KEY(ccod),
					INDEX descrizione (xcond));

-- create table clienti
CREATE TABLE clienti (	ccod INT(5) NOT NULL COMMENT 'Codice',
			cpiva VARCHAR(11) COMMENT 'Partita IVA',
			xragsoc VARCHAR(60) NOT NULL COMMENT 'Ragione sociale',
			cfis VARCHAR(16) COMMENT 'Codice fiscale',
			xcli1 VARCHAR(30) NOT NULL COMMENT 'Codice alternativo 1',
			xind VARCHAR(40) NOT NULL COMMENT 'Indirizzo',
			xcli2 VARCHAR(40) COMMENT 'Codice alternativo 2',
			xcom VARCHAR(30) NOT NULL COMMENT 'Comune',
			cprv CHAR(2) NOT NULL COMMENT 'Provincia',
			ccap CHAR(5) NOT NULL COMMENT 'C.A.P.',
			xnaz VARCHAR(20) NOT NULL COMMENT 'Stato estero',
			xmail VARCHAR(60) COMMENT 'E-mail',
			ccat VARCHAR(10) NOT NULL COMMENT 'Categoria',
			ctipcomm INT(2) NOT NULL COMMENT 'Tipologia commerciale',
			czona CHAR(1) COMMENT 'Zona',
			cage INT(5) NOT NULL COMMENT 'Agente',
			cabi INT(4) COMMENT 'Codice ABI',
			ccab INT(5) COMMENT 'Codice CAB',
			nrifind INT(1) COMMENT 'Numero di riferimento indirizzo',
			PRIMARY KEY(ccod, cpiva, cfis),
			INDEX ragione_sociale (xragsoc),
			FOREIGN KEY (cage)
				REFERENCES agenti(cage)
				ON UPDATE no action ON DELETE no action) ENGINE=INNODB;

-- create table prodotti
CREATE TABLE prodotti (	ccod INT(6) NOT NULL COMMENT 'Codice prodotto',
			xdesc VARCHAR(70) NOT NULL COMMENT 'Descrizione',
			xcap VARCHAR(20) COMMENT 'Capienza',
			iprz DECIMAL(5,2) NOT NULL COMMENT 'Prezzo prodotto',
			xgrp VARCHAR(45) COMMENT 'Gruppo/Categoria',
			sven VARCHAR(10) NOT NULL COMMENT 'Tipo vendita (cabina/autocura)',
			PRIMARY KEY(ccod),
			INDEX descrizione (xdesc),
			INDEX gruppo (xdesc, xgrp));

-- create table campioncini (10% del ctv dell'ordine
CREATE TABLE campioncini (	ccod CHAR(6) NOT NULL COMMENT 'Codice campioncino',
			xdesc VARCHAR(70) NOT NULL COMMENT 'Descrizione',
			iprz DECIMAL(5,2) NOT NULL COMMENT 'Prezzo prodotto',
			xgrp VARCHAR(45) COMMENT 'Gruppo/Categoria',
			PRIMARY KEY(ccod),
			INDEX descrizione (xdesc),
			INDEX gruppo (xdesc, xgrp));

-- create table ana_promo
CREATE TABLE ana_promo (ccod INT(6) NOT NULL COMMENT 'Codice promozione',
			xdesc VARCHAR(30) NOT NULL COMMENT 'Descrizione promozione',
			PRIMARY KEY(ccod),
			INDEX descrizione (xdesc));

-- create table prod_promo
CREATE TABLE prod_promo (ccodpromo INT(6) NOT NULL COMMENT 'Codice promozione (non deve esistere in prodotti)',
			ccodprod INT(6) NOT NULL COMMENT 'Codice prodotto',
			ipzz INT(2) NOT NULL COMMENT 'Pezzi prodotto',
			PRIMARY KEY(ccodpromo, ccodprod),
			FOREIGN KEY (ccodpromo)
				REFERENCES ana_promo(ccod)
				ON UPDATE CASCADE ON DELETE CASCADE,
			FOREIGN KEY (ccodprod)
				REFERENCES prodotti(ccod)
				ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=INNODB;

-- create table vettori
CREATE TABLE vettori (	cvet INT(1) NOT NULL COMMENT 'Codice vettore',
			xragsoc VARCHAR(60) NOT NULL COMMENT 'Ragione sociale',
			xind VARCHAR(45) COMMENT 'Indirizzo',
			ccap CHAR(5) COMMENT 'C.A.P.',
			xcom VARCHAR(30) NOT NULL COMMENT 'Comune',
			cprv CHAR(2) NOT NULL COMMENT 'Provincia',
			PRIMARY KEY(cvet),
			INDEX ragione_sociale (xragsoc));

-- create table ordini
CREATE TABLE ordini (nreg INT(3) NOT NULL AUTO_INCREMENT COMMENT 'Numero di registrazione (selvert 1 a 300)',
			ctiprec VARCHAR(5) NOT NULL DEFAULT '@' COMMENT 'Tipo record',
			ctipdoc INT(3) NOT NULL DEFAULT 701 COMMENT 'Tipo documento',
			dreg DATE NOT NULL COMMENT 'Data registrazione',
			ccli INT(5) NOT NULL COMMENT 'Codice cliente',
			cval CHAR(3) NOT NULL DEFAULT 'EUR' COMMENT 'Codice valuta',
			cimp INT(1) NOT NULL DEFAULT 1 COMMENT 'Codice centro imputazione',
			ccondpag INT(3) COMMENT 'Codice condizione di pagamento',
			ccau INT(1) DEFAULT 1 COMMENT 'Codice causale trasporto',
			xcau VARCHAR(10) DEFAULT 'VENDITA' COMMENT 'Descrizione causale trasporto',
			cporto INT(1) DEFAULT 1 COMMENT 'Codice porto',
			xporto VARCHAR(10) DEFAULT 'FRANCO' COMMENT 'Descrizione porto',
			cben INT(1) DEFAULT 2 COMMENT 'Aspetto beni',
			xben VARCHAR(10) DEFAULT 'SCATOLE' COMMENT 'Descrizione aspetto beni',
			cmezzo INT(1) DEFAULT 1 COMMENT 'Trasporto a mezzo',
			xmezzo VARCHAR(10) DEFAULT 'VETTORE' COMMENT 'Descrizione trasporto a mezzo',
			cvet INT(1) DEFAULT 1 COMMENT 'Codice vettore',
			cstt INT(3) DEFAULT 0 COMMENT 'Stato ordine (0-Ins, 10-Bozza, 50-conf e 999-Ann)',
			cage INT(5) NOT NULL COMMENT 'Agente',
			psco DECIMAL(5,2) DEFAULT '0.00' COMMENT 'Sconto 1',
			ibol DECIMAL(7,2) COMMENT 'Importo spesa bollo',
			iinc DECIMAL(7,2) COMMENT 'Importo spesa incasso',
			isp1 DECIMAL(7,2) COMMENT 'Importo spesa 1',
			isp2 DECIMAL(7,2) COMMENT 'Importo spesa 2',
			PRIMARY KEY(ccod),
			INDEX cliente (ccli),
			INDEX agente (cage),
			INDEX data (dreg),
			INDEX stato (cstt),
			FOREIGN KEY (ccli)
				REFERENCES clienti(ccod)
				ON UPDATE CASCADE ON DELETE CASCADE,
			FOREIGN KEY (ccondpag)
				REFERENCES condizioni_pagamento(ccod)
				ON UPDATE CASCADE ON DELETE CASCADE,
			FOREIGN KEY (cvet)
				REFERENCES vettori(cvet)
				ON UPDATE CASCADE ON DELETE CASCADE) engine=innodb;

-- create table righe_ordini
CREATE TABLE righe_ordini (	ccod INT(9) NOT NULL COMMENT 'ID ordine',
				ctiprig INT(1) NOT NULL DEFAULT 1 COMMENT 'Tipo riga',
				ccodprod INT(6) NOT NULL COMMENT 'Codice prodotto',
				xlis CHAR(2) DEFAULT '01' COMMENT 'Codice listino',
				npes DECIMAL(5,2) COMMENT 'Peso prodotto',
				umis CHAR(2) DEFAULT 'pz' COMMENT 'Unità di misura',
				iqta INT(3) DEFAULT 1 COMMENT 'Quantità prodotto',
				iimp DECIMAL(7,2) DEFAULT '0.00' COMMENT 'Importo (prz * qta)',
				sspe INT(1) DEFAUL 0 COMMENT 'Calcolo spese (0-No, 1-Sì)',
				civa INT(2) DEFAULT 22 COMMENT 'Codice % IVA',
				PRIMARY KEY(ccod, ccodprod),
				FOREIGN KEY (ccodprod)
					REFERENCES prodotti(ccod)
					ON UPDATE CASCADE ON DELETE CASCADE,
				FOREIGN KEY (ccod)
					REFERENCES ordini(ccod)
					ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=INNODB;

-- load
   LOAD DATA LOCAL INFILE 'insert_ana_agenti.txt' INTO TABLE agenti LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_ana_clienti.txt' INTO TABLE clienti LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_cond_pagamento.txt' INTO TABLE condizioni_pagamento LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_prodotti.txt' INTO TABLE prodotti LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_ana_promo.txt' INTO TABLE ana_promo LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_prod_promo.txt' INTO TABLE prod_promo LINES TERMINATED BY '\r\n';
   LOAD DATA LOCAL INFILE 'insert_vettori.txt' INTO TABLE vettori LINES TERMINATED BY '\r\n';