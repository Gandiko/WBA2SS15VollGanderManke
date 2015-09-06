/**
* Webbasierte Anwendungen II
* Sommersemester 2015 - FH Koeln - F10
* @author VollGanderManke - Team 7
*
* Implementierung einer Anwendung, die den Ausleih
* sowie den Verleih von Kameras und sonstigem Equipment
* realisieren soll.

* Schnittstelle für Redis-Datenbank und Dienstnutzer
*/


// Module werden eingebunden
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var http = require('http');

// Starten der Redis Datenbank
var db = redis.createClient();

// In App werden die Methoden von Express eingebunden
var app = express();

// App benutzt JSON-Parser
app.use(bodyParser.json());


/**
* Implementierung der User Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn user Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* name: String
* wohnort: String
*/
app.post('/users', function userAnlegen(req, res){

        var newUser = req.body;

        db.incr('u_id:user', function(err, rep){
            newUser.u_id = rep;
            db.set('user:'+newUser.u_id, JSON.stringify(newUser), function(err, rep){
                res.status(200).json(newUser);
            });
        });
    });

app.get('/users/:u_id', function userAusgeben(req, res){
        db.get('user:'+req.params.u_id, function(err, rep){
           if(rep){
               res.type('json').send(rep);
           }
            else {
                res.status(404).type('text').send("Der User wurde nicht gefunden");
            }
        });
    });

app.put('/users/:u_id', function userInfoBearbeiten(req, res){
    db.exists('user:'+req.params.u_id, function(err, rep){
        if (rep == 1){
            var updatedUser = req.body;
            updatedUser.u_id = req.params.u_id;
            db.set('user:'+req.params.u_id, JSON.stringify(updatedUser), function(err, rep){
                res.json(updatedUser);
            });
        }
        else {
            res.status(404).type('text').send('Der User mit der ID ' + req.params.u_id + ' wurde nicht gefunden');
        }
    });
});

app.delete('/users/:u_id', function userLoeschen(req, res){
    db.del('user:'+req.params.u_id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Der User mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.get("/users", function alleUserausgeben(req, res){
    db.keys('user:*', function(err, rep){
        var users = [];

        if(rep.length == 0) {
            res.json(users);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               users.push(JSON.parse(val));
           });
            res.json(users);
        });
    });
});
// Ende user Interaktion


/**
* Implementierung der Kamera Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn Kamera Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* hersteller: String
* modell: String
* baujahr: String
* typ: String
* objektive : String
* preis: float
*/
app.post('/equipment/kameras', function kameraAnlegen(req, res){
        var newCam = req.body;

        db.incr('k_id:kameras', function(err, rep){
            newCam.k_id = rep;
            db.set('kameras:' + newCam.k_id, JSON.stringify(newCam), function(err, rep){
                res.json(newCam);
            });
        });
    });

app.put('/equipment/kameras/:k_id', function kameraInfoBearbeiten(req, res){
    db.exists('kameras:'+req.params.k_id, function(err, rep){
        if (rep == 1) {
            var updatedCam = req.body;
            updatedCam.k_id = req.params.k_id;
            db.set('kameras:'+req.params.k_id, JSON.stringify(updatedCam), function(err, rep) {
                res.json(updatedCam);
            });
        }
        else {
            res.status(404).type('text').send('Die Kamera wurde nicht gefunden');
        }
    });
});

app.get('/equipment/kameras/:k_id', function kameraAusgeben(req, res){
    db.get('kameras:' + req.params.k_id, function(err, rep){
        if(rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Die Kamera mit der ID " + req.params.k_id +  " ist nicht in der Datenbank");
        }
    });
});

app.delete('/equipment/kameras/:k_id', function kameraLoeschen(req, res){
    db.del('kameras:'+req.params.k_id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Die Kamera mit der ID ' + req.params.k_id + ' wurde nicht gefunden');
        }
    });
});

app.get("/equipment/kameras", function alleKamerasausgeben(req, res){
    db.keys('kameras:*', function(err, rep){
        var kamera = [];

        if(rep.length == 0) {
            res.json(kamera);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               kamera.push(JSON.parse(val));
           });

            kamera = kamera.map(function(kamera){
                return {k_id: kamera.k_id, hersteller: kamera.hersteller, modell: kamera.modell};
            });
            res.json(kamera);
        });
    });
});

// Ende Kamera Interaktion


// Beginn der Interaktionen für den Ausleihvorgang
/*
    Pflichtangaben, die der User angeben muss:
    
    besitzer: String,
    equipment: integer,
    ausleiher: String,
    rating: integer,
    rezension: String
*/
app.post('/equipment/ausleihen', function(req, res){
        var newAusleihe = req.body;
        
        db.incr('leih_id:ausleihe', function(err, rep){
                newAusleihe.leih_id = rep;
                db.set('ausleihe:' + newAusleihe.leih_id , JSON.stringify(newAusleihe), function(err,rep){
                    res.json(newAusleihe);
                });
        });
            
});

app.put('/equipment/ausleihen/:leih_id', function(req,res){
    db.exists('ausleihe:'+req.params.leih_id, function(err, rep){
        if(rep == 1){
            var updatedAusleihe = req.body;
            updatedAusleihe.leih_id = req.params.leih_id;
            db.set('ausleihe:' + req.params.leih_id, JSON.stringify(updatedAusleihe), function(err, rep){
                res.json(updatedAusleihe);
            });
        }
        else {
            res.status(404).type('text').send("Die Transaktion mit der ID " + req.pararms.leih_id + " wurde nicht gefunden");
        }
    });
});

app.get("/equipment/ausleihen/:leih_id", function(req, res){
    db.get('ausleihe:'+ req.params.leih_id, function(err, rep){

        if(rep.length == 0) {
            res.json(ausleihe);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               ausleihe.push(JSON.parse(val));
           });
            res.json(ausleihe);
        });
    });
});

app.get("/equipment/ausleihen", function alleKamerasausgeben(req, res){
    db.keys('ausleihe:*', function(err, rep){
        var ausleihe = [];

        if(rep.length == 0) {
            res.json(ausleihe);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               ausleihe.push(JSON.parse(val));
           });
            res.json(ausleihe);
        });
    });
});

/**
* Implementierung der Objektive Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn Objektive Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* hersteller: String
* modell: String
* typ: String
* kompatibilität: String
* brennweite: String
*/
app.post('/equipment/objektive', function(req, res){
        var newObj = req.body;

        db.incr('o_id:objektive', function(err, rep){
            newObj.o_id = rep;
            db.set('objektive:' + newObj.o_id, JSON.stringify(newObj), function(err, rep){
                res.json(newObj);
            });
        });
    });

app.get('/equipment/objektive/:o_id', function objektivAusgeben(req, res){
    db.get('objektive:' + req.params.o_id, function(err, rep){
        if(rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Das Objektiv mit der ID: " + req.params.o_id + "wurde nicht gefunden");
        }
    });
});

app.put('/equipment/objektive/:o_id', function objektivInfoBearbeiten(req, res){
    db.exists('objektive:'+req.params.o_id, function(err, rep){
        if (rep == 1){
            var updatedObj = req.body;
            updatedObj.o_id = req.params.o_id;
            db.set('objektive:'+req.params.o_id, JSON.stringify(updatedObj), function(err, rep){
                res.json(updatedObj);
            });
        }
        else {
            res.status(404).type('text').send('Das Objektiv mit der ID ' + req.params.o_id + ' wurde nicht gefunden');
        }
    });
});

app.delete('/equipment/objektive/:o_id', function objektivLoeschen(req, res){
    db.del('objektive:'+req.params.o_id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Das Objektiv mit der ID ' + req.params.o_id + ' wurde nicht gefunden');
        }
    });
});

app.get("/equipment/objektive", function(req, res){
    db.keys('objektive:*', function(err, rep){
        var objektive = [];

        if(rep.length == 0) {
            res.json(objektive);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               objektive.push(JSON.parse(val));
           });

            res.json(objektive);
        });
    });
});


// Spezifische Suche Funktion!!!!
app.get("/search/objektive", function(req, res){
    db.keys('objektive:*', function(err, rep){
        var ergebnisse = [];
        if(rep.length == 0) {
            res.json(ergebnisse);
            return;
        }

        db.mget(rep, function(err, rep){
            rep.forEach(function(val){
                ergebnisse.push(JSON.parse(val));
            });
                    if(req.query.hersteller !== undefined) {
                        res.json(ergebnisse.filter(function(e,i,ergebnisse){
                        return e.hersteller == req.query.hersteller;
                        res.end();
                    }));
                    }

                    else if(req.query.modell !== undefined) {
                        res.json(ergebnisse.filter(function(e,i,ergebnisse){
                            return e.modell == req.query.modell;
                            res.end();
                        }));
                    }

                    else if(req.query.typ !== undefined) {
                        res.json(ergebnisse.filter(function(e,i,ergebnisse) {
                            return e.typ == req.query.typ;
                            res.end()
                        }));
                    }
            
                    else if(req.query.von !== undefined) {
                        res.json(ergebnisse.filter(function(e,i,ergebnisse){
                            return e.von == req.query.von;
                            res.end();
                        }));
                    }
                    
                    else if(req.query.bis !== undefined) {
                        res.json(ergebnisse.filter(function(e,i,ergebnisse) {
                            return e.bis == req.query.bis;
                            res.end();
                        }));
                    }
                    else {
                        res.status(404).type("text").send("Es wurden keine Objektive mit dem Suchbegriff gefunden");
                    }

        });
    });
});



/*
app.get("/equipment/objektive", function(req,res){
    db.keys('objektive:*', function(err, rep){
        var ergebnisse = [];
        if(rep.length == 0) {
            res.json(ergebnisse);
            return;
        }
        
        db.mget(rep, function(err, rep){
            rep.forEach(function(val){
                ergebnisse.push(JSON.parse(val));
            });
            
                if(req.query.von !== undefined && req.query.bis !== undefined) {
                    res.json(ergebnisse.filter(function(e,i,ergebnisse){
                        return e.von == req.query.von;
                        return e.bis == req.query.bis;
                        res.end();
                    }));
                }
        });
    });
});

*/

// Ende Objektive Interaktion


/**
* Implementierung der Beleuchtung, Blitzgeräte Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn Beleuchtung, Blitzgeräte Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* hersteller: String
* modell: String
* typ: String
* leistung in volt: integer
* stromquelle: String
*/
app.post('/equipment/beleuchtung', function lightHinzufuegen(req, res){
        var newLi = req.body;

        db.incr('id:beleuchtung', function(err, rep){
            newLi.id = rep;
            db.set('beleuchtung:' + newLi.id, JSON.stringify(newLi), function(err, rep){
                res.json(newLi);
            });
        });
    });

app.get('/equipment/beleuchtung/:id', function lightAusgeben(req, res){
    db.get('beleuchtung:' + req.params.id, function(err, rep){
        if(rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Die Kamera ist nicht in der Datenbank");
        }
    });
});

app.put('/equipment/beleuchtung:id', function lightInfoBearbeiten(req, res){
    db.exists('beleuchtung:'+req.params.id, function(err, rep){
        if (rep == 1){
            var updatedLi = req.body;
            updatedLi.id = req.params.id;
            db.set('beleuchtung:'+req.params.id, JSON.stringify(updatedLi), function(err, rep){
                res.json(updatedLi);
            });
        }
        else {
            res.status(404).type('text').send('Das Licht set mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.delete('/equipment/beleuchtung:id', function lightLoeschen(req, res){
    db.del('beleuchtung:'+req.params.id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Das Licht Set mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.get("/equipment/beleuchtung", function(req, res){
    db.keys('beleuchtung:*', function(err, rep){
        var light = [];

        if(rep.length == 0) {
            res.json(light);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               light.push(JSON.parse(val));
           });

            res.json(light);
        });
    });
});
// Beginn Beleuchtung, Blitzgeräte Interaktion


/**
* Implementierung der Halterung Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn Halterung Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* hersteller: String
* modell: String
* typ: String
* befestigungsmethode: String
* kompatibilität: String
* preis: float
*/
app.post('/equipment/halterungen', function halterungHinzufuegen(req, res){
        var newHalt = req.body;

        db.incr('h_id:halterungen', function(err, rep){
            newHalt.h_id = rep;
            db.set('halterungen:' + newStv.h_id, JSON.stringify(newHalt), function(err, rep){
                res.json(newHalt);
            });
        });
    });

app.get('/equipment/halterungen/:h_id', function halterungAusgeben(req, res){
    db.get('halterungen:' + req.params.h_id, function(err, rep){
        if(rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Die Kamera ist nicht in der Datenbank");
        }
    });
});

app.put('/equipment/halterungen/:id', function halterungBearbeiten(req, res){
    db.exists('halterungen:'+req.params.id, function(err, rep){
        if (rep == 1){
            var updatedHalt = req.body;
            updatedHalt.id = req.params.id;
            db.set('halterungen:'+req.params.id, JSON.stringify(updatedHalt), function(err, rep){
                res.json(updatedHalt);
            });
        }
        else {
            res.status(404).type('text').send('Das Stativ mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.delete('/equipment/halterungen/:id', function halterungLoeschen(req, res){
    db.del('halterungen:'+req.params.id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Das Stativ mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.get("/equipment/halterungen", function(req, res){
    db.keys('halterungen:*', function(err, rep){
        var halterungen = [];

        if(rep.length == 0) {
            res.json(halterungen);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               halterungen.push(JSON.parse(val));
           });

            res.json(halterungen);
        });
    });
});
// Ende Halterung Interaktion


/**
* Implementierung der Drohnen Interaktion, zum interagieren mit der Redis Datenbank
* Benennung der Funktionen ist selbsterklärend
*/

// Beginn Drohnen Interaktion
/**
* Pflichtangaben, die der User angeben muss:
*
* hersteller: String
* modell: String
* kamera integriert ja/nein: integer (1,0)
* akkulaufzeit in h: integer
* kompatibilität: String
* steuerung: String
* kompatibilität: String
* preis: float
*/
app.post('/equipment/drohnen', function drohneHinzufuegen(req, res){
        var newStv = req.body;

        db.incr('id:drohnen', function(err, rep){
            newStv.id = rep;
            db.set('drohnen:' + newStv.id, JSON.stringify(newStv), function(err, rep){
                res.json(newStv);
            });
        });
    });

app.get('/equipment/drohnen/:id', function drohneAusgeben(req, res){
    db.get('drohnen:' + req.params.id, function(err, rep){
        if(rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Die Kamera ist nicht in der Datenbank");
        }
    });
});

app.put('/equipment/drohnen:id', function drohneBearbeiten(req, res){
    db.exists('drohnen:'+req.params.id, function(err, rep){
        if (rep == 1){
            var updatedStv = req.body;
            updatedStv.id = req.params.id;
            db.set('drohnen:'+req.params.id, JSON.stringify(updatedStv), function(err, rep){
                res.json(updatedStv);
            });
        }
        else {
            res.status(404).type('text').send('Das Stativ mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.delete('/equipment/drohnen:id', function drohneLoeschen(req, res){
    db.del('drohnen:'+req.params.id, function(err, rep){
        if(rep == 1){
            res.status(200).type('text').send('OK');
        }
        else{
            res.status(404).type('text').send('Das Stativ mit der ID ' + req.params.id + ' wurde nicht gefunden');
        }
    });
});

app.get("/equipment/drohnen", function(req, res){
    db.keys('drohnen:*', function(err, rep){
        var drohnen = [];

        if(rep.length == 0) {
            res.json(drohnen);
            return;
        }

        db.mget(rep, function(err, rep){
           rep.forEach(function(val){
               drohnen.push(JSON.parse(val));
           });
           
            res.json(drohnen);
        });
    });
});
// Ende Drohnen Interaktion


// App läuft über Prot 3000
app.listen(3000);
console.log("Hören auf Port 3000 du musst");
