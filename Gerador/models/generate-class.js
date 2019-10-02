var mustache = require('mustache');
var fs = require('fs');


/*
    gera as classes references a cada schema usado como input, e as funções ORM que interagem com a BD
*/
function generate(schemas, dbname) {
    schemas.forEach(schema => {
        var sch = JSON.parse(fs.readFileSync(schema.Path).toString());
        var props = Object.keys(sch.properties);
        var mandatory = sch.required;
        var view = {
            dbname: dbname,
            classTitle: sch.title,
            tableName:sch.title.toLowerCase(),
            classProperties: props,
            classConstructor: function () {
                let str = "";
                props.forEach(key => {

                    str += "\n\t\tthis." + key + "=" + key + ";";
                    if (!mandatory.includes(key)) {
                        str += "\n\t\tObject.defineProperty(this,\"" + key + "\",{\n\t\t\t enumerable:false\n\t\t});\n";
                    }
                });
                sch.references.forEach(ref => {
                    str += "\n\t\tObject.defineProperty(this,\"" + ref.model.toLowerCase()+"_id" + "\",{\n\t\t\t enumerable:false, writable:true\n\t\t});\n";
                });
                return str;
            },
            propertiesParams: function () {
                return props.map(prop => { return "?"; }).join();
            },
            propertiesUpdate: function () {
                return props.map(prop => { return prop + " = ?"; }).join();
            },
            propertiesThis: function () {
                return props.map(prop => { return "this." + prop; }).join();
            },
            mappingDBtoObject: function () {
                var str="";
                str+= props.map(prop => {
                    return "\n  " + prop + " : " + "\"" + prop + "\"";
                }).join();
                if(sch.references.length>0)str+=",";
                str+= sch.references.map(ref => {
                    if(ref.relation!=="M-M"){
                        return "\n  " + ref.model.toLowerCase()+"_id" + " : " + "\"" + ref.model.toLowerCase()+"_id" + "\"";
                    }
                    else return "";
                }).filter(string=>string!=="").join();
                return str;
            },
            references: function(){
                return sch.references.map(ref=>{
                    return{
                        model: ref.model.toLowerCase(),
                        isMM: (ref.relation ==="M-M")
                    }
                })
            },
            primaryKey: {
                propertyName: "id",
                columnName: sch.title.toLowerCase() + "_id"
            }

        };

        var template = fs.readFileSync("./Gerador/models/class.mustache").toString();
        var output = mustache.render(template, view);
        fs.writeFileSync("./Publish/Models/" + view.classTitle + ".js", output);
    });
}
module.exports.generate = generate;