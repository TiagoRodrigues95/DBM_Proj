var sqlite3 = require('sqlite3').verbose();
var mustache = require('mustache');
var fs = require('fs');

var db;

/*
    gera as chaves estrangeiras/tabelas de ligação, de acordo com as relações indicadas nos schemas
 */
function generateRelationships(schemas) {
    schemas.forEach(schema => {
        var sch = JSON.parse(fs.readFileSync(schema.Path).toString());
        var references = sch.references;
        references.forEach(reference => {
            var view = {
                childTable: sch.title.toLowerCase(),
                parentTable: reference.model.toLowerCase(),
                isUnique:false
            }
            switch (reference.relation) {
                case "1-1":
                    view.isUnique=true;
                case "1-M":
                    var template = fs.readFileSync("./Gerador/database/fk.mustache").toString();
                    var output = mustache.render(template, view);
                    db.run(output);
                    break;

                case "M-M":
                    if(view.childTable>view.parentTable){
                        let aux=view.childTable;
                        view.childTable=view.parentTable;
                        view.parentTable=aux;
                    }
                    var template = fs.readFileSync("./Gerador/database/jointable.mustache").toString();
                    var output = mustache.render(template, view);
                    db.run(output);
                    break;
            }
        });
    });
}

/*
    gera a base de dados e tabelas necessárias, consoante os schemas inseridos
*/
var generate = function (databaseName, schemas) {
    //CHECK IF SCHEMAS IS ARRAY OR OBJECT, IF ARRAY CREATE N TABLES
    var template = fs.readFileSync("./Gerador/database/create-table.mustache").toString();
    var queries = [];
    var script = "";
    schemas.forEach(schema => {
        var sch = JSON.parse(fs.readFileSync(schema.Path).toString());
        var props = sch.properties;
        var required = sch.required;
        var view = {
            tableName: sch.title.toLowerCase(),
            primaryKey: sch.title.toLowerCase()+"_id",
            columns: function () {
                var columns = Array();
                var i = 0;
                for (var p in props) {
                    let prop = props[p];
                    let propName = p;
                    columns.push({
                        name: p,
                        type: function () {
                            switch (prop.type) {
                                case "integer":
                                    return "INTEGER";
                                case "number":
                                    return "INTEGER";
                                case "string":
                                    return "TEXT";
                            }
                        },
                        constrains: function() {
                            var constrains = "";
                            if (required.includes(prop)) {
                                constrains += " NOT NULL";
                            }
                            if (prop.unique == true) {
                                constrains += " UNIQUE";
                            }
                            if (prop.type === "number") {
                                if (prop.minimum !== undefined || prop.maximum !== undefined) {
                                    constrains += "CHECK(";
                                    if (prop.minimum !== undefined && prop.maximum !== undefined) {
                                        constrains += propName + '>=' + prop.minimum + " AND " + propName + '<=' + prop.maximum + ")";
                                    }
                                    else if (prop.minimum !== undefined) {
                                        constrains += propName + '>=' + prop.minimum + ")";
                                    }
                                    else if (prop.maximum !== undefined) {
                                        constrains += propName + '<=' + prop.maximum + ")";
                                    }
                                }
                            }
                            return constrains;
                        }
                    });
                }
                return columns;
            },
        };
        var output = mustache.render(template, view);
        script+= "\n"+output;

        queries.push(output);
    });
    fs.writeFileSync("./Publish/Database/create_script.sql",script);
    // open the database connection
    db = new sqlite3.Database('./Publish/Database/' + databaseName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            return console.log(err.message);
        }
    });

    db.serialize((err) => {
        if (err) {
            return console.error(err.message + "banana");
        }
        // Queries scheduled here will be serialized.
        queries.forEach(query=>{
            db.run(query);
        });
        generateRelationships(schemas);
    });
    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message + "banana");
        }
    });
};


module.exports.generate = generate;