var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var http = require("http");

var app = express();
var server = http.createServer(app);


app.use(bodyParser.json());
app.use(express.static(__dirname+'/'));


//Beim Aufruf der Route "/" wird die Index Seite aufgerufen
app.get("/", function(req, res){
    res.render('index.ejs');
});

//Funktionen User BEGINN

// Gibt eine Liste aller User aus
app.get("/users", function(req, res){
    fs.readFile("./views/users.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/users",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Usern gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var users = JSON.parse(chunk);
                    console.log(users);
                    res.send(users);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/profile/:u_id", function(req,res){
    fs.readFile("./views/profile.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/users/"+req.params.u_id,
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            //Statuscodes weiterleiten!!!!
            
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach User gesucht");
                if(externalResponse.statusCode === 404){
                    console.log("404 - User not found");
                    res.render('notfound.ejs');
                }
                else {
                    externalResponse.on("data", function(chunk){
                        console.log(chunk);
                        var user = JSON.parse(chunk);
                        console.log(user);
                        var html = ejs.render(filestring, {user: user});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
                }
            });
            externalRequest.end();
        }        
    });
});

// Gibt einzelnen User aus 



app.get("/signup", function(req, res){
    res.render('signup.ejs');
});

app.post('/signup', function(req, res){
    console.log("Methode /signup wurde aufgerufen")
    var newUser = req.body;
    console.log(req.body);
    console.log(newUser);
   fs.readFile("./views/signup.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/users",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
        console.log("Mit dem Server verbunden -- Port 3000 -- Path : /users -- Methode : POST");
				externalResponse.on("data", function(chunk){
                    newUser = JSON.parse(chunk);
					var html = ejs.render(filestring, {newUser: newUser, filename: __dirname + '/views/signup.ejs'});
					res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
				});
			});
			externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(req.body));
      externalRequest.end();
    }
});
});

app.get("/updateProfile", function(req, res){
    res.render('updateProfile.ejs');
});

//Bearbeitet einen User
app.put("/users/:u_id", function(req, res) {
    var updatedUser = req.body;
    console.log("Funktion PUT wurde aufgerufen");
    console.log(req.body);
    console.log(updatedUser);
    
    var options = {
        host: "localhost",
        path: "/users/" + req.params.u_id,
        port: 3000,
        method: 'PUT',
        headers: {
            accept:"application/json"
        }
    }
        var externalRequest = http.request(options, function(externalResponse){
            console.log("Mit Dienstanbieter verbunden -- Port 3000 -- Path: users/:u_id -- Method: PUT");
            externalResponse.on("data", function(chunk){
                updatedUser = JSON.parse(chunk);
                res.status(200);
                res.end();
            });
            
        });
            externalRequest.setHeader("content-type", "application/json");
            externalRequest.write(JSON.stringify(req.body));
            console.log("Userdaten wurden überarbeitet");
            externalRequest.end();
});

app.delete('/user/:u_id', function(req, res){

    var options = {
        host: "localhost",
        port: 3000,
        path: "/users/"+ req.params.id,
        method:"DELETE",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bar delete");
				if(externalResponse.statusCode == 404){
            fs.readFile("./views/notfound.ejs", {encoding:"utf-8"}, function(err, filestring){
                if(err){
                  throw err;
                } else{
                    console.log("Got response: " + externalResponse.statusCode);
                    var status = externalResponse.statusCode;
                    externalResponse.on("data", function(chunk){
                        var fehlermeldung = chunk.toString();
                        console.log(fehlermeldung);
                        var fehler = {};
                        fehler.status = status;
                        fehler.fehlermeldung = fehlermeldung;
                        var html = ejs.render(filestring , {fehler: fehler, filename: __dirname + '/views/users.ejs'});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
                }
            });
          } else {
        externalResponse.on("data", function(chunk){

            res.status(200);
            res.end();
        });
			}
      });
      externalRequest.end();
});

//Funktionen User ENDE

//Kamera -- Funktionen BEGINN
app.get("/kameras", function(req, res){
    fs.readFile("./views/kameras.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/kameras",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Kameras gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var kameras = JSON.parse(chunk);
                    console.log(kameras);
                    var html = ejs.render(filestring, {kameras: kameras});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/postkamera", function(req, res){
    res.render('postkamera.ejs');
});

app.post('/postkamera', function(req, res){
    console.log("Methode /postkamera wurde aufgerufen")
    var newKamera = req.body;
    console.log(req.body);
    console.log(newKamera);
   fs.readFile("./views/postkamera.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/equipment/kameras",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
        console.log("Mit dem Server verbunden -- Port 3000 -- Path : /users -- Methode : POST");
                    externalResponse.on("data", function(chunk){
                    newUser = JSON.parse(chunk);
                    var html = ejs.render(filestring, {newKamera: newKamera, filename: __dirname + '/views/postkamera.ejs'});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
});
});
externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(req.body));
      externalRequest.end();
    }
});
});
//Kamera -- Funktionen Ende

//Objektive -- Funktionen Beginn
app.get("/objektive", function(req, res){
    fs.readFile("./views/objektive.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/objektive",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Usern gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var objektive = JSON.parse(chunk);
                    console.log(objektive);
                    var html = ejs.render(filestring, {objektive: objektive});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/objektiv/:o_id", function(req,res){
    fs.readFile("./views/objektiv.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/objektive/"+req.params.o_id,
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            //Statuscodes weiterleiten!!!!
            
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach User gesucht");
                if(externalResponse.statusCode === 404){
                    console.log("404 - Objektiv not found");
                    res.render('notfound.ejs');
                }
                else {
                    externalResponse.on("data", function(chunk){
                        console.log(chunk);
                        var objektiv = JSON.parse(chunk);
                        console.log(objektiv);
                        var html = ejs.render(filestring, {objektiv: objektiv});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
                }
            });
            externalRequest.end();
        }        
    });
});

app.get("/postobjektiv", function(req, res){
    res.render('postobjektiv.ejs');
});

app.post('/postobjektiv', function(req, res){
    console.log("Methode /postobjektiv wurde aufgerufen")
    var newObjektiv = req.body;
    console.log(req.body);
    console.log(newObjektiv);
   fs.readFile("./views/postobjektiv.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/equipment/objektive",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
        console.log("Mit dem Server verbunden -- Port 3000 -- Path : /users -- Methode : POST");
				externalResponse.on("data", function(chunk){
                    newObjektiv = JSON.parse(chunk);
					var html = ejs.render(filestring, {newObjektiv: newObjektiv, filename: __dirname + '/views/postobjektive.ejs'});
					res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
				});
			});
			externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(req.body));
      externalRequest.end();
    }
});
});

app.get("/updateobjektiv", function(req, res){
    res.render('updateobjektiv.ejs');
});

app.put("/objektiv/:o_id", function(req, res) {
    var updatedObj = req.body;
    console.log("Funktion PUT wurde aufgerufen");
    console.log(req.body);
    console.log(updatedObj);
    
    var options = {
        host: "localhost",
        path: "/equipment/objektive/" + req.params.o_id,
        port: 3000,
        method: 'PUT',
        headers: {
            accept:"application/json"
        }
    }
        var externalRequest = http.request(options, function(externalResponse){
            console.log("Mit Dienstanbieter verbunden -- Port 3000 -- Path: /equipment/objektive/:o_id -- Method: PUT");
            externalResponse.on("data", function(chunk){
                updatedObj = JSON.parse(chunk);
                res.status(200);
                res.end();
            });
            
        });
            externalRequest.setHeader("content-type", "application/json");
            externalRequest.write(JSON.stringify(req.body));
            console.log("Objektivdaten wurden überarbeitet");
            externalRequest.end();
});

//Objektive -- Funktionen ENDE

//Halterungen -- Funktionen BEGINN

app.get("/halterungen", function(req, res){
    fs.readFile("./views/halterungen.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/halterungen",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Halterungen gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var halterungen = JSON.parse(chunk);
                    console.log(halterungen);
                    var html = ejs.render(filestring, {halterungen: halterungen});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/posthalterung", function(req, res){
    res.render('posthalterung.ejs');
});

app.post('/posthalterung', function(req, res){
    console.log("Methode /posthalterung wurde aufgerufen")
    var newHalterung = req.body;
    console.log(req.body);
    console.log(newHalterung);
   fs.readFile("./views/posthalterung.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/equipment/halterungen",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
        console.log("Mit dem Server verbunden -- Port 3000 -- Path : /equipment/halterungen -- Methode : POST");
                externalResponse.on("data", function(chunk){
                    newUser = JSON.parse(chunk);
                    var html = ejs.render(filestring, {newHalterung: newHalterung, filename: __dirname + '/views/posthalterung.ejs'});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
});
});
externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(req.body));
      externalRequest.end();
    }
});
});

//Funktionen Halterungen ENDE

//Funktionen Beleuchtung BEGINN

app.get("/beleuchtung", function(req, res){
    fs.readFile("./views/beleuchtung.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/beleuchtung",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Beleuchtung gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var beleuchtung = JSON.parse(chunk);
                    console.log(beleuchtung);
                    var html = ejs.render(filestring, {beleuchtung: beleuchtung});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/postbeleuchtung", function(req, res){
    res.render('postbeleuchtung.ejs');
});

app.post('/postbeleuchtung', function(req, res){
    console.log("Methode /postbeleuchtung wurde aufgerufen")
    var newBeleuchtung = req.body;
    console.log(req.body);
    console.log(newBeleuchtung);
   fs.readFile("./views/postbeleuchtung.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/equipment/beleuchtung",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
            console.log("Mit dem Server verbunden -- Port 3000 -- Path : /equipment/beleuchtung -- Methode : POST");
            externalResponse.on("data", function(chunk){
                    newBeleuchtung = JSON.parse(chunk);
                    var html = ejs.render(filestring, {newBeleuchtung: newBeleuchtung, filename: __dirname + '/views/postbeleuchtung.ejs'});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
});
});
externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(req.body));
      externalRequest.end();
    }
});
});

//Funktionen Beleuchtung ENDE

//Funktionen Drohnen BEGINN

app.get("/drohnen", function(req, res){
    fs.readFile("./views/drohnen.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/equipment/drohnen",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Usern gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var drohnen = JSON.parse(chunk);
                    console.log(drohnen);
                    var html = ejs.render(filestring, {drohnen: drohnen});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }        
    });
});

app.get("/postdrohne", function(req, res){
    res.render('postdrohne.ejs');
});

app.post('/postdrohne', function(req, res){
    console.log("Methode /postdrohne wurde aufgerufen");
    var newDrohne = req.body;
    console.log(req.body);
    console.log(newDrohne);
   fs.readFile("./views/postdrohne.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/equipment/drohnen",
        method:"POST"
      }
        var externalRequest = http.request(options, function(externalResponse){
            console.log("Mit dem Server verbunden -- Port 3000 -- Path : /equipment/drohnen -- Methode : POST");
            externalResponse.on("data", function(chunk){
                    newDrohne = JSON.parse(chunk);
                    var html = ejs.render(filestring, {newDrohne: newDrohne, filename: __dirname + '/views/postdrohne.ejs'});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
            });
        });
        externalRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        externalRequest.setHeader("content-type", "application/json");
        externalRequest.write(JSON.stringify(req.body));
        externalRequest.end();
    }
});
});

//Funktionen Drohnen ENDE

// Funktionene für Ausleihe Beginn


app.get("/postequipment", function(req, res){
    res.render('postequipment.ejs');
});

app.listen(3001);
console.log("Es wird auf Port 3001 gehorcht");