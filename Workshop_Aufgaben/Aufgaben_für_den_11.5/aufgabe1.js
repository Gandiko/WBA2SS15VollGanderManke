var fs = require('fs');

fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data) {
    if(err) 
    {
        throw err;
    }
    
    var data = JSON.parse(data);
    
    for(var i = 0; i < data.wolkenkratzer.length; i++)
    {
        console.log("________________________________________" + "\n"
        + "Name: " + data.wolkenkratzer[i].name + "\n"
        + "Stadt: " + data.wolkenkratzer[i].stadt + "\n" 
        + "Höhe: " + data.wolkenkratzer[i].hoehe +  "\n"
        );
    }
});