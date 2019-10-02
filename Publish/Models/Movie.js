var database = require('../Database/sqlitedbm.js')('./Publish/Database/projecto_fase1.db');

class Movie {
    constructor (name,stars,date) {
        Object.defineProperty(this,'id',{ 
                enumerable:true,
                writable:true    
            });
        
		this.name=name;
		this.stars=stars;
		this.date=date;
		Object.defineProperty(this,"tag_id",{
			 enumerable:false, writable:true
		});

		Object.defineProperty(this,"actor_id",{
			 enumerable:false, writable:true
		});

		Object.defineProperty(this,"director_id",{
			 enumerable:false, writable:true
		});

    }
}

Movie.all = function (callback) {
    database.where("SELECT * FROM movie", [], Movie, callback);
}

Movie.get = function (id, callback) {
    database.where("SELECT * FROM movie WHERE movie_id = ?", [id], Movie, callback);
}

//TODO update e verificar insert
Movie.prototype.save = function (callback) {
    if(this.id) { //Se existir valor no id será para update
     database.run("UPDATE movie SET name = ?,stars = ?,date = ?      ,director_id =?  WHERE movie_id = ?", [this.name,this.stars,this.date     ,this.director_id , this.id],callback);
    } else { //caso contrário para insert
        database.run("INSERT INTO movie (name,stars,date      ,director_id ) VALUES (?,?,?     ,? )",
        [this.name,this.stars,this.date     ,this.director_id ], callback);
    }
}

Movie.delete = function (id, callback) {
    database.get("DELETE FROM movie WHERE movie_id = ? ",[id], Movie, callback);
}

Movie.many = function (model, id, callback) {
    var tablename = relationManyToManyTableName("movie",model);
    database.where(`SELECT movie.* FROM movie INNER JOIN ${tablename} ON
        ${tablename}.movie_id = movie.movie_id WHERE ${tablename}.${model.toLowerCase()}_id = ?`, [id],
        Movie, callback);
}


Movie.mappingDBtoObject = {
  movie_id : "id",
  
  name : "name",
  stars : "stars",
  date : "date",
  director_id : "director_id"
}

Movie.top = function (property,order,limit,callback) {
	var dbprop = Object.keys(Movie.mappingDBtoObject).find(function(key) {
	          return Movie.mappingDBtoObject[key] == property;    
	});
	database.where(`SELECT * FROM Movie ORDER BY ${dbprop} ${order} LIMIT ${limit}`, [], Movie,callback);
}

function relationManyToManyTableName(tableA,tableB){
    var array = [];
    array.push(tableA,tableB);
    array.sort();
    let tableName = array.join("_");
    return tableName;
}

module.exports=Movie;