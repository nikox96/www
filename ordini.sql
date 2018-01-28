-- create table ordini
CREATE TABLE ordini (ccod INT(3) NOT NULL AUTO_INCREMENT COMMENT 'Codice ordine automatico',
            nreg INT(3) NOT NULL COMMENT 'Numero di registrazione (selvert 1 a 300)',
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
			cvet INT(4) DEFAULT 1604 COMMENT 'Codice vettore',
			cstt INT(3) DEFAULT 0 COMMENT 'Stato ordine (0-Ins, 10-Bozza, 50-conf e 999-Ann)',
			cage INT(5) NOT NULL COMMENT 'Agente',
			psco DECIMAL(5,2) DEFAULT '0.00' COMMENT 'Sconto 1',
			ibol DECIMAL(7,2) COMMENT 'Importo spesa bollo',
			iinc DECIMAL(7,2) COMMENT 'Importo spesa incasso',
			isp1 DECIMAL(7,2) COMMENT 'Importo spesa 1',
			isp2 DECIMAL(7,2) COMMENT 'Importo spesa 2',
			PRIMARY KEY(ccod),
			UNIQUE (nreg),
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
				sspe INT(1) DEFAULT 0 COMMENT 'Calcolo spese (0-No, 1-Sì)',
				civa INT(2) DEFAULT 22 COMMENT 'Codice % IVA',
				PRIMARY KEY(ccod, ccodprod),
				FOREIGN KEY (ccodprod)
					REFERENCES prodotti(ccod)
					ON UPDATE CASCADE ON DELETE CASCADE,
				FOREIGN KEY (ccod)
					REFERENCES ordini(ccod)
					ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=INNODB;