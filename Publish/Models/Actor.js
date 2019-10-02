var database = require('../Database/sqlitedbm.js')('./Publish/Database/projecto_fase1.db');

class Actor {
    constructor (name,gender,age) {
        Object.defineProperty(this,'id',{ 
                enumerable:true,
                writable:true    
            });
        
		this.name=name;
		this.gender=gender;
		this.age=age;
		Object.defineProperty(this,"movie_id",{
			 enumerable:false, writable:true
		});

    }
}

Actor.all = function (callback) {
    database.where("SELECT * FROM actor", [], Actor, callback);
}

Actor.get = function (id, callback) {
    database.where("SELECT * FROM actor WHERE actor_id = ?", [id], Actor, callback);
}

//TODO update e verificar insert
Actor.prototype.save = function (callback) {
    if(this.id) { //Se existir valor no id será para update
     database.run("UPDATE actor SET name = ?,gender = ?,age = ?    WHERE actor_id = ?", [this.name,this.gender,this.age  , this.id],callback);
    } else { //caso contrário para insert
        database.run("INSERT INTO actor (name,gender,age   ) VALUES (?,?,?  )",
        [this.name,this.gender,this.age  ], callback);
    }
}

Actor.delete = function (id, callback) {
    database.get("DELETE FROM actor WHERE actor_id = ? ",[id], Actor, callback);
}

Actor.many = function (model, id, callback) {
    var tablename = relationManyToManyTableName("actor",model);
    database.where(`SELECT actor.* FROM actor INNER JOIN ${tablename} ON
        ${tablename}.actor_id = actor.actor_id WHERE ${tablename}.${model.toLowerCase()}_id = ?`, [id],
        Actor, callback);
}


Actor.mappingDBtoObject = {
  actor_id : "id",
  
  name : "name",
  gender : "gender",
  age : "age",
}

Actor.top = function (property,order,limit,callback) {
	var dbprop = Object.keys(Actor.mappingDBtoObject).find(function(key) {
	          return Actor.mappingDBtoObject[key] == property;    
	});
	database.where(`SELECT * FROM Actor ORDER BY ${dbprop} ${order} LIMIT ${limit}`, [], Actor,callback);
}

function relationManyToManyTableName(tableA,tableB){
    var array = [];
    array.push(tableA,tableB);
    array.sort();
    let tableName = array.join("_");
    return tableName;
}

module.exports=Actor;