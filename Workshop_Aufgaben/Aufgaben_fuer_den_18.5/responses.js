var express = require('express');
var bodyparser = require('body-parser');

var responses = express()
// Methode für den JSON Parser - ist im Bodyparser integriert
var jsonParser = bodyparser.json()

var profile = [
    {
         "name":"Gander",
         "vorname": "Nikolas",
         "geburtsdatum":"13.06.1992",
         "alter":22,
          "typ":"Musiker"
      },
      {    
         "name":"Voll",
         "vorname": "Jacqueline",
         "geburtsdatum":"24.07.1992",
         "alter":22,
          "typ":"Veranstalter"
      },
      {
         "name":"Manke",
         "vorname": "Meike",
         "geburtsdatum":"23.12.1990",
         "alter":24,
          "typ": "Security"
      }
]

responses.listen(3000);

responses.get("/", function(req, res){
    res.status(200).type('plain').send('Server ist bereit!');
});

responses.get('/profile', function(req, res) {
    res.status(200).json(profile);
});

//Gibt zu unserem JSON-Objekt ein neues Profil hinzu
responses.post('/profile', jsonParser, function profil_hinzufuegen(req, res){
    profile.push(req.body);
    res.status(201).type('plain').send('Hat Funktioniert!');
});
