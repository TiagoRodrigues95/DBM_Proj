var fs = require('fs');
var mustache = require('mustache');


/*
    gera as rotas para a API, a partir do template api.mustache
*/
var generate = function(schemas){
    var view = {
        schemas: function(){
            var obj = [];
            schemas.forEach(schema=>{
                var sch = JSON.parse(fs.readFileSync(schema.Path).toString());//
                obj.push({
                    classTitle: sch.title
                });
            });
            return obj;
        }
    };

    var template = fs.readFileSync("./Gerador/api/api.mustache").toString();
    var output = mustache.render(template, view);
    fs.writeFileSync("./Publish/Controllers/" + "api.js", output);
}

module.exports.generate=generate;