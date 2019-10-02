var express = require('express');
var router = express.Router();

function mapping(object, type) {
    var obj = new type();
    Object.getOwnPropertyNames(object).forEach(function (value){
        if(Object.getOwnPropertyNames(obj).includes(value)){//Se o objeto possuir o atributo que se está a verificar então recebe o valor retornado da query da base de dados
            obj[value] = object[value];
            console.log(obj[value]);
        }
    });
    return obj;
}

var Tag = require('../Models/Tag.js');
var Movie = require('../Models/Movie.js');
var Actor = require('../Models/Actor.js');
var Director = require('../Models/Director.js');

//Insert
router.post('/Tag', function (req, res) {
    //Insert
    var obj = mapping(req.body, Tag);
    console.log(JSON.stringify(obj));
    obj.save(function(err) {
        console.log(err);
        res.sendStatus(200);
    });
});

//Read All
router.get('/Tag', function (req, res) {
    Tag.all(function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
        res.json(rows);
    });
});

//Read One
router.get('/Tag/:id', function (req, res) {
 //read by id
    if(req.params.id){
        Tag.get(req.params.id , function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
            res.json(rows);
        });
    }
});

//Update
router.put('/Tag/:id', function (req, res) {
 //Update
    var obj = mapping(req.body, Tag);
    obj.id = req.params.id;
    obj.save(function(err) {
        res.sendStatus(200);
    });
});

//Delete
router.delete('/Tag/:id', function (req, res) {
 //delete
 Tag.delete(req.params.id, function(err){
     console.log(err);
     res.sendStatus(200);
 });
});

router.get('/Tag/:model/:id', function (req, res) {
    Tag.many(req.params.model, req.params.id, function (rows) {
        res.json(rows);
    });
});

//Insert
router.post('/Movie', function (req, res) {
    //Insert
    var obj = mapping(req.body, Movie);
    console.log(JSON.stringify(obj));
    obj.save(function(err) {
        console.log(err);
        res.sendStatus(200);
    });
});

//Read All
router.get('/Movie', function (req, res) {
    Movie.all(function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
        res.json(rows);
    });
});

//Read One
router.get('/Movie/:id', function (req, res) {
 //read by id
    if(req.params.id){
        Movie.get(req.params.id , function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
            res.json(rows);
        });
    }
});

//Update
router.put('/Movie/:id', function (req, res) {
 //Update
    var obj = mapping(req.body, Movie);
    obj.id = req.params.id;
    obj.save(function(err) {
        res.sendStatus(200);
    });
});

//Delete
router.delete('/Movie/:id', function (req, res) {
 //delete
 Movie.delete(req.params.id, function(err){
     console.log(err);
     res.sendStatus(200);
 });
});

router.get('/Movie/:model/:id', function (req, res) {
    Movie.many(req.params.model, req.params.id, function (rows) {
        res.json(rows);
    });
});

//Insert
router.post('/Actor', function (req, res) {
    //Insert
    var obj = mapping(req.body, Actor);
    console.log(JSON.stringify(obj));
    obj.save(function(err) {
        console.log(err);
        res.sendStatus(200);
    });
});

//Read All
router.get('/Actor', function (req, res) {
    Actor.all(function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
        res.json(rows);
    });
});

//Read One
router.get('/Actor/:id', function (req, res) {
 //read by id
    if(req.params.id){
        Actor.get(req.params.id , function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
            res.json(rows);
        });
    }
});

//Update
router.put('/Actor/:id', function (req, res) {
 //Update
    var obj = mapping(req.body, Actor);
    obj.id = req.params.id;
    obj.save(function(err) {
        res.sendStatus(200);
    });
});

//Delete
router.delete('/Actor/:id', function (req, res) {
 //delete
 Actor.delete(req.params.id, function(err){
     console.log(err);
     res.sendStatus(200);
 });
});

router.get('/Actor/:model/:id', function (req, res) {
    Actor.many(req.params.model, req.params.id, function (rows) {
        res.json(rows);
    });
});

//Insert
router.post('/Director', function (req, res) {
    //Insert
    var obj = mapping(req.body, Director);
    console.log(JSON.stringify(obj));
    obj.save(function(err) {
        console.log(err);
        res.sendStatus(200);
    });
});

//Read All
router.get('/Director', function (req, res) {
    Director.all(function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
        res.json(rows);
    });
});

//Read One
router.get('/Director/:id', function (req, res) {
 //read by id
    if(req.params.id){
        Director.get(req.params.id , function (rows) { //função de callback que quando for retornado os dados na base de dados
 //, os mesmos serão enviados em json
            res.json(rows);
        });
    }
});

//Update
router.put('/Director/:id', function (req, res) {
 //Update
    var obj = mapping(req.body, Director);
    obj.id = req.params.id;
    obj.save(function(err) {
        res.sendStatus(200);
    });
});

//Delete
router.delete('/Director/:id', function (req, res) {
 //delete
 Director.delete(req.params.id, function(err){
     console.log(err);
     res.sendStatus(200);
 });
});

router.get('/Director/:model/:id', function (req, res) {
    Director.many(req.params.model, req.params.id, function (rows) {
        res.json(rows);
    });
});


module.exports = router;