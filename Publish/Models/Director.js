var database = require('../Database/sqlitedbm.js')('./Publish/Database/projecto_fase1.db');

class Director {
    constructor (name,gender,age) {
        Object.defineProperty(this,'id',{ 
                enumerable:true,
                writable:true    
            });
        
		this.name=name;
		this.gender=gender;
		this.age=age;
    }
}

Director.all = function (callback) {
    database.where("SELECT * FROM director", [], Director, callback);
}

Director.get = function (id, callback) {
    database.where("SELECT * FROM director WHERE director_id = ?", [id], Director, callback);
}

//TODO update e verificar insert
Director.prototype.save = function (callback) {
    if(this.id) { //Se existir valor no id será para update
     database.run("UPDATE director SET name = ?,gender = ?,age = ?  WHERE director_id = ?", [this.name,this.gender,this.age, this.id],callback);
    } else { //caso contrário para insert
        database.run("INSERT INTO director (name,gender,age ) VALUES (?,?,?)",
        [this.name,this.gender,this.age], callback);
    }
}

Director.delete = function (id, callback) {
    database.get("DELETE FROM director WHERE director_id = ? ",[id], Director, callback);
}

Director.many = function (model, id, callback) {
    var tablename = relationManyToManyTableName("director",model);
    database.where(`SELECT director.* FROM director INNER JOIN ${tablename} ON
        ${tablename}.director_id = director.director_id WHERE ${tablename}.${model.toLowerCase()}_id = ?`, [id],
        Director, callback);
}


Director.mappingDBtoObject = {
  director_id : "id",
  
  name : "name",
  gender : "gender",
  age : "age"
}

Director.top = function (property,order,limit,callback) {
	var dbprop = Object.keys(Director.mappingDBtoObject).find(function(key) {
	          return Director.mappingDBtoObject[key] == property;    
	});
	database.where(`SELECT * FROM Director ORDER BY ${dbprop} ${order} LIMIT ${limit}`, [], Director,callback);
}

function relationManyToManyTableName(tableA,tableB){
    var array = [];
    array.push(tableA,tableB);
    array.sort();
    let tableName = array.join("_");
    return tableName;
}

module.exports=Director;