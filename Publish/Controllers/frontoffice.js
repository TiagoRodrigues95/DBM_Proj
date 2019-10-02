var express = require('express');
var router = express.Router();
var mustacheExpress = require("mustache-express");

var Tag = require('../Models/Tag.js');
var TagSchema= require('../Schemas/'+ 'Tag'.toLowerCase() +'-schema.json');
var Movie = require('../Models/Movie.js');
var MovieSchema= require('../Schemas/'+ 'Movie'.toLowerCase() +'-schema.json');
var Actor = require('../Models/Actor.js');
var ActorSchema= require('../Schemas/'+ 'Actor'.toLowerCase() +'-schema.json');
var Director = require('../Models/Director.js');
var DirectorSchema= require('../Schemas/'+ 'Director'.toLowerCase() +'-schema.json');

router.get('/Home', function (req, res) {
    Movie.top("stars","DESC", 3, function (rows) {
	console.log(rows);
        res.render('home.mustache', {
            title:"Movie",
            rows: rows.map(obj => {
		        return {
                    properties: Object.keys(obj).map(key => {
                        return {
                            name: key,
                            value: obj[key]
                        }
                    })
                }
            }),
            columns: Object.keys(new Movie()).map(key => {
                return {
                    name: key
                }; 
            }),
            schemas:function(){
                var array = [];
                array.push({
                    name:"Tag",
                    href:"./backoffice/Tag"
                });
                array.push({
                    name:"Movie",
                    href:"./backoffice/Movie"
                });
                array.push({
                    name:"Actor",
                    href:"./backoffice/Actor"
                });
                array.push({
                    name:"Director",
                    href:"./backoffice/Director"
                });
                return array;
            }
        });
    });
});
router.get('*',function(req,res){
    res.redirect('/Home');
});

module.exports = router;
