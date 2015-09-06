var fs = require('fs');
var chalk = require('chalk');

fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data) 
    
    {
     if(err)    throw err;
    
    
    
    var data = JSON.parse(data);
	var sortiert = data.wolkenkratzer.sort(function (a, b) 
    {
        if (b.hoehe > a.hoehe) return 1;
        if (b.hoehe < a.hoehe) return -1;
        return 0;
    });


    var wolkenkratzer_liste = JSON.stringify({wolkenkratzer : sortiert});
    fs.writeFile(__dirname+"/wolkenkratzer_liste.json", wolkenkratzer_liste, function(err) 
    {
        if(err) throw err;
    
    for(var i = 0; i < data.wolkenkratzer.length; i++)
    {
        console.log(chalk.styles.blue.open + "________________________________________" + chalk.styles.blue.close + "\n"
        + chalk.styles.green.open + "Name: " + chalk.styles.green.close + data.wolkenkratzer[i].name + "\n"
        + chalk.styles.green.open + "Stadt: " + chalk.styles.green.close + data.wolkenkratzer[i].stadt + "\n" 
        + chalk.styles.green.open +  "Höhe: " + chalk.styles.green.close + data.wolkenkratzer[i].hoehe +  "\n"
        );
	};
});
	});
	
