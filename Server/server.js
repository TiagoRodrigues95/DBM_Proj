var mustache = require("mustache");
var childProcess = require("child_process");
var fs = require('fs');
var mkdirp = require("mkdirp");
var del = require("del");
var classGenerator = require('../Gerador/models/generate-class.js');
var databaseGenerator = require('../Gerador/database/generate-database.js');
var apiGenerator = require('../Gerador/api/generate-api.js');
var generate = function () {

    //clears the previous published website, creates folder structure
    del.sync(['./Publish/**', '!./Publish']);
    mkdirp.sync("./Publish/Controllers");
    mkdirp.sync("./Publish/Views");
    mkdirp.sync("./Publish/Models");
    mkdirp.sync("./Publish/Database");
    mkdirp.sync("./Publish/Schemas");
    mkdirp.sync("./Publish/Public/css");
    mkdirp.sync("./Publish/Public/images");
    mkdirp.sync("./Publish/Public/js");
    //code generator

    //generates simple web server from template
    var config = JSON.parse(fs.readFileSync("./Server/config.json", "utf-8"));
    fs.readFile('./Server/server.mustache', function (err, data) {

        var output = mustache.render(data.toString(), config);
        fs.writeFile('./Publish/index.js', output, function () {
            childProcess.fork('./Publish/index.js');
        });
    });

    //generates backoffice routes
    fs.readFile('./Gerador/backoffice/backoffice.mustache', function (err, data) {
        var output = mustache.render(data.toString(), config);
        fs.writeFile('./Publish/Controllers/backoffice.js', output,function(err){
            if(err){
                console.log(err);
            }
        });
    });
    
    //generates front office routes
    fs.readFile('./Gerador/frontoffice/frontoffice.mustache', function (err, data) {
        var output = mustache.render(data.toString(), config);
        fs.writeFile('./Publish/Controllers/frontoffice.js', output,function(err){
            if(err){
                console.log(err);
            }
        });
    });

    classGenerator.generate(config.schemas, config.dbname);

    apiGenerator.generate(config.schemas);

    //copies all specified files to the publish folder
    config.staticFiles.forEach(file => {
        fs.copyFile(file.originalPath,file.destinationPath,(err)=>{if(err)console.log(err)});
    });

   //copies all the schemas to the publish folder
    config.schemas.forEach(schema=>{
        let destination = './Publish/Schemas/'+schema.name.toLowerCase()+'-schema.json';
        fs.copyFile(schema.Path,destination,(err)=>{if(err)console.log(err)});
    });

    databaseGenerator.generate(config.dbname, config.schemas);


}

module.exports.generate = generate;