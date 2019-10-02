var database = require('../Database/sqlitedbm.js')('./Publish/Database/projecto_fase1.db');

class Tag {
    constructor (tagname) {
        Object.defineProperty(this,'id',{ 
                enumerable:true,
                writable:true    
            });
        
		this.tagname=tagname;
		Object.defineProperty(this,"movie_id",{
			 enumerable:false, writable:true
		});

    }
}

Tag.all = function (callback) {
    database.where("SELECT * FROM tag", [], Tag, callback);
}

Tag.get = function (id, callback) {
    database.where("SELECT * FROM tag WHERE tag_id = ?", [id], Tag, callback);
}

//TODO update e verificar insert
Tag.prototype.save = function (callback) {
    if(this.id) { //Se existir valor no id será para update
     database.run("UPDATE tag SET tagname = ?    WHERE tag_id = ?", [this.tagname  , this.id],callback);
    } else { //caso contrário para insert
        database.run("INSERT INTO tag (tagname   ) VALUES (?  )",
        [this.tagname  ], callback);
    }
}

Tag.delete = function (id, callback) {
    database.get("DELETE FROM tag WHERE tag_id = ? ",[id], Tag, callback);
}

Tag.many = function (model, id, callback) {
    var tablename = relationManyToManyTableName("tag",model);
    database.where(`SELECT tag.* FROM tag INNER JOIN ${tablename} ON
        ${tablename}.tag_id = tag.tag_id WHERE ${tablename}.${model.toLowerCase()}_id = ?`, [id],
        Tag, callback);
}


Tag.mappingDBtoObject = {
  tag_id : "id",
  
  tagname : "tagname",
}

Tag.top = function (property,order,limit,callback) {
	var dbprop = Object.keys(Tag.mappingDBtoObject).find(function(key) {
	          return Tag.mappingDBtoObject[key] == property;    
	});
	database.where(`SELECT * FROM Tag ORDER BY ${dbprop} ${order} LIMIT ${limit}`, [], Tag,callback);
}

function relationManyToManyTableName(tableA,tableB){
    var array = [];
    array.push(tableA,tableB);
    array.sort();
    let tableName = array.join("_");
    return tableName;
}

module.exports=Tag;