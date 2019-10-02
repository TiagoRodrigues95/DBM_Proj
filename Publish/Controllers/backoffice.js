var express = require('express');
var router = express.Router();
var fs = require('fs');
var mustacheExpress = require("mustache-express");

function mapping(object, type) {
    var obj = new type();
    Object.getOwnPropertyNames(object).forEach(function (value){
        if(obj.hasOwnProperty(value)){//Se o objeto possuir o atributo que se 
        //está a verificar então recebe o valor retornado da query da base de dados
            obj[value] = object[value];
        }
    });
    return obj;
}

var Tag = require('../Models/Tag.js');
var TagSchema= require('../Schemas/'+ 'Tag'.toLowerCase() +'-schema.json');
var Movie = require('../Models/Movie.js');
var MovieSchema= require('../Schemas/'+ 'Movie'.toLowerCase() +'-schema.json');
var Actor = require('../Models/Actor.js');
var ActorSchema= require('../Schemas/'+ 'Actor'.toLowerCase() +'-schema.json');
var Director = require('../Models/Director.js');
var DirectorSchema= require('../Schemas/'+ 'Director'.toLowerCase() +'-schema.json');

router.get('/Tag', function (req, res) {

    Tag.all(function(rows){
        res.render('list.mustache', {
            title: "Tag",
            columns: Object.keys(new Tag()),
            searchTerm: TagSchema.searchProperty,
            rows: rows.map(row => {
                return {
                    properties: Object.keys(row).map(key => {
                        return {
                            name:key,
                            value:row[key]
                        }
                    }),
                    actions: [{
                        link: 'Tag/details/' + row.id,
                        image: { src: '/../../images/read.png', alt: 'read' },
                        tooltip: 'Details'
                    }, {
                        link: 'Tag/edit/' + row.id,
                        image: { src: '/../../images/edit.png', alt: 'edit' },
                        tooltip: 'Edit'
                    }, {
                        link: '#',
                        image: { src: '/../../images/delete.png', alt: 'delete' },
                        tooltip: 'Delete',
                        events: [{
                            name: "onclick",
                            function: "deleteRow",
                            args: row.id
                        }]
                    }]
                }
            }),
            schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"./Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"./Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"./Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"./Director"
                    });
                    return array;
                }
        });
    });
});

router.get('/Tag/details/:id', function (req, res) {

    Tag.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('details.mustache', {
                title: "Tag",
                properties: function () {
                    var allProps = Object.getOwnPropertyNames(row);
                    var validProps = [];
                    allProps.forEach(function (prop) {
                        if (TagSchema.properties.hasOwnProperty(prop)) {
                            validProps.push({
                                name: prop,                                  
                                value: row[prop]
                            });
                        }
                    });
                    return validProps;
                },
                references: function () {
                    var allRefs = [];
                    if (TagSchema.references) {
                        TagSchema.references.forEach(function (ref) {
                            allRefs.push({
                                label: ref.label,
                                model: ref.model,
                                values: function(){
                                    return row[(ref.model + "_id").toLowerCase()]
                                }
                            });
                        });
                    }
                    return allRefs;
                },
                get hasReferences() {
                    return this.references().length > 0;
                },
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            })
            
        }
    });
});

router.get('/Tag/insert', function (req, res) {
    var newObj = new Tag();
    res.render('form.mustache', {
        title: "Tag",
        properties:  function () {
                var allProps = Object.getOwnPropertyNames(TagSchema.properties);
                var validProps = [];
                allProps.forEach(function (prop) {
                    if (TagSchema.properties.hasOwnProperty(prop)) {
                        validProps.push({
                            name: prop,                                  
                            value: "",
                            type: function(){
                                if(!TagSchema.properties[prop].type){
                                    return "text";
                                }
                                else{
                                    return TagSchema.properties[prop].type;
                                }
                            },
                            pattern: function(){
                                if(TagSchema.properties[prop].pattern){
                                    return "pattern = "+TagSchema.properties[prop].pattern;
                                }
                            },
                            minlength: function(){
                                if(TagSchema.properties[prop].minLength){
                                    return "minlength = "+TagSchema.properties[prop].minLength;
                                }
                            },
                            maxlength: function(){
                                if(TagSchema.properties[prop].maxLength){
                                    return "maxlength = "+TagSchema.properties[prop].maxLength;
                                }
                            },
                            min: function(){
                                if(TagSchema.properties[prop].minimum){
                                    return "min = "+TagSchema.properties[prop].minimum;
                                }
                            },
                            max: function(){
                                if(TagSchema.properties[prop].maximum){
                                    return "max = "+TagSchema.properties[prop].maximum;
                                }
                            },
                            required: function(){
                                var required = TagSchema.required;
                                if(required.includes(prop)){
                                            return "required";
                                }
                            }
                        });
                    }
                });
                return validProps;
        },
        references: function () {
            var allRefs = [];
            if (TagSchema.references) {
                TagSchema.references.forEach(function (ref) {
                    allRefs.push({
                        label: ref.label,
                        model: ref.model,
                        isMM: (ref.relation === "M-M"),
                        values: []
                    });
                });
            }
            return allRefs;
        },
        get hasReferences() {
            return this.references().length > 0;
        },
        method:"post",
        schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../Director"
                    });
                    return array;
                }
    })
    
});

router.get('/Tag/edit/:id', function (req, res) {
    Tag.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('form.mustache', {
                title: "Tag",
                properties: Object.keys(TagSchema.properties).map(key => {
                    console.log("GET EDIT");
                    return {
                        name: key,
                        value: row[key],
                        type: function(){
                            if(!TagSchema.properties[key].type){
                                return "text";
                            }
                            else{
                                return TagSchema.properties[key].type;
                            }
                        },
                        pattern: function(){
                            if(TagSchema.properties[key].pattern){
                                return "pattern = "+TagSchema.properties[key].pattern;
                            }
                        },
                        minlength: function(){
                            if(TagSchema.properties[key].minLength){
                                return "minlength = "+TagSchema.properties[key].minLength;
                            }
                        },
                        maxlength: function(){
                            if(TagSchema.properties[key].maxLength){
                                return "maxlength = "+TagSchema.properties[key].maxLength;
                            }
                        },
                        min: function(){
                            if(TagSchema.properties[key].minimum){
                                return "min = " +TagSchema.properties[key].minimum;
                            }
                        },
                        max: function(){
                            if(TagSchema.properties[key].maximum){
                                return "max = "+TagSchema.properties[key].maximum;
                            }
                        },
                        required: function(){
                            var required = TagSchema.required;
                            if(required.includes(key)){
                                return "required";
                            }
                        }
                    }
                }),
                method:"put",
                id:req.params.id,
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            });
        }
    });
});
router.get('/Movie', function (req, res) {

    Movie.all(function(rows){
        res.render('list.mustache', {
            title: "Movie",
            columns: Object.keys(new Movie()),
            searchTerm: MovieSchema.searchProperty,
            rows: rows.map(row => {
                return {
                    properties: Object.keys(row).map(key => {
                        return {
                            name:key,
                            value:row[key]
                        }
                    }),
                    actions: [{
                        link: 'Movie/details/' + row.id,
                        image: { src: '/../../images/read.png', alt: 'read' },
                        tooltip: 'Details'
                    }, {
                        link: 'Movie/edit/' + row.id,
                        image: { src: '/../../images/edit.png', alt: 'edit' },
                        tooltip: 'Edit'
                    }, {
                        link: '#',
                        image: { src: '/../../images/delete.png', alt: 'delete' },
                        tooltip: 'Delete',
                        events: [{
                            name: "onclick",
                            function: "deleteRow",
                            args: row.id
                        }]
                    }]
                }
            }),
            schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"./Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"./Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"./Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"./Director"
                    });
                    return array;
                }
        });
    });
});

router.get('/Movie/details/:id', function (req, res) {

    Movie.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('details.mustache', {
                title: "Movie",
                properties: function () {
                    var allProps = Object.getOwnPropertyNames(row);
                    var validProps = [];
                    allProps.forEach(function (prop) {
                        if (MovieSchema.properties.hasOwnProperty(prop)) {
                            validProps.push({
                                name: prop,                                  
                                value: row[prop]
                            });
                        }
                    });
                    return validProps;
                },
                references: function () {
                    var allRefs = [];
                    if (MovieSchema.references) {
                        MovieSchema.references.forEach(function (ref) {
                            allRefs.push({
                                label: ref.label,
                                model: ref.model,
                                values: function(){
                                    return row[(ref.model + "_id").toLowerCase()]
                                }
                            });
                        });
                    }
                    return allRefs;
                },
                get hasReferences() {
                    return this.references().length > 0;
                },
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            })
            
        }
    });
});

router.get('/Movie/insert', function (req, res) {
    var newObj = new Movie();
    res.render('form.mustache', {
        title: "Movie",
        properties:  function () {
                var allProps = Object.getOwnPropertyNames(MovieSchema.properties);
                var validProps = [];
                allProps.forEach(function (prop) {
                    if (MovieSchema.properties.hasOwnProperty(prop)) {
                        validProps.push({
                            name: prop,                                  
                            value: "",
                            type: function(){
                                if(!MovieSchema.properties[prop].type){
                                    return "text";
                                }
                                else{
                                    return MovieSchema.properties[prop].type;
                                }
                            },
                            pattern: function(){
                                if(MovieSchema.properties[prop].pattern){
                                    return "pattern = "+MovieSchema.properties[prop].pattern;
                                }
                            },
                            minlength: function(){
                                if(MovieSchema.properties[prop].minLength){
                                    return "minlength = "+MovieSchema.properties[prop].minLength;
                                }
                            },
                            maxlength: function(){
                                if(MovieSchema.properties[prop].maxLength){
                                    return "maxlength = "+MovieSchema.properties[prop].maxLength;
                                }
                            },
                            min: function(){
                                if(MovieSchema.properties[prop].minimum){
                                    return "min = "+MovieSchema.properties[prop].minimum;
                                }
                            },
                            max: function(){
                                if(MovieSchema.properties[prop].maximum){
                                    return "max = "+MovieSchema.properties[prop].maximum;
                                }
                            },
                            required: function(){
                                var required = MovieSchema.required;
                                if(required.includes(prop)){
                                            return "required";
                                }
                            }
                        });
                    }
                });
                return validProps;
        },
        references: function () {
            var allRefs = [];
            if (MovieSchema.references) {
                MovieSchema.references.forEach(function (ref) {
                    allRefs.push({
                        label: ref.label,
                        model: ref.model,
                        isMM: (ref.relation === "M-M"),
                        values: []
                    });
                });
            }
            return allRefs;
        },
        get hasReferences() {
            return this.references().length > 0;
        },
        method:"post",
        schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../Director"
                    });
                    return array;
                }
    })
    
});

router.get('/Movie/edit/:id', function (req, res) {
    Movie.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('form.mustache', {
                title: "Movie",
                properties: Object.keys(MovieSchema.properties).map(key => {
                    console.log("GET EDIT");
                    return {
                        name: key,
                        value: row[key],
                        type: function(){
                            if(!MovieSchema.properties[key].type){
                                return "text";
                            }
                            else{
                                return MovieSchema.properties[key].type;
                            }
                        },
                        pattern: function(){
                            if(MovieSchema.properties[key].pattern){
                                return "pattern = "+MovieSchema.properties[key].pattern;
                            }
                        },
                        minlength: function(){
                            if(MovieSchema.properties[key].minLength){
                                return "minlength = "+MovieSchema.properties[key].minLength;
                            }
                        },
                        maxlength: function(){
                            if(MovieSchema.properties[key].maxLength){
                                return "maxlength = "+MovieSchema.properties[key].maxLength;
                            }
                        },
                        min: function(){
                            if(MovieSchema.properties[key].minimum){
                                return "min = " +MovieSchema.properties[key].minimum;
                            }
                        },
                        max: function(){
                            if(MovieSchema.properties[key].maximum){
                                return "max = "+MovieSchema.properties[key].maximum;
                            }
                        },
                        required: function(){
                            var required = MovieSchema.required;
                            if(required.includes(key)){
                                return "required";
                            }
                        }
                    }
                }),
                method:"put",
                id:req.params.id,
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            });
        }
    });
});
router.get('/Actor', function (req, res) {

    Actor.all(function(rows){
        res.render('list.mustache', {
            title: "Actor",
            columns: Object.keys(new Actor()),
            searchTerm: ActorSchema.searchProperty,
            rows: rows.map(row => {
                return {
                    properties: Object.keys(row).map(key => {
                        return {
                            name:key,
                            value:row[key]
                        }
                    }),
                    actions: [{
                        link: 'Actor/details/' + row.id,
                        image: { src: '/../../images/read.png', alt: 'read' },
                        tooltip: 'Details'
                    }, {
                        link: 'Actor/edit/' + row.id,
                        image: { src: '/../../images/edit.png', alt: 'edit' },
                        tooltip: 'Edit'
                    }, {
                        link: '#',
                        image: { src: '/../../images/delete.png', alt: 'delete' },
                        tooltip: 'Delete',
                        events: [{
                            name: "onclick",
                            function: "deleteRow",
                            args: row.id
                        }]
                    }]
                }
            }),
            schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"./Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"./Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"./Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"./Director"
                    });
                    return array;
                }
        });
    });
});

router.get('/Actor/details/:id', function (req, res) {

    Actor.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('details.mustache', {
                title: "Actor",
                properties: function () {
                    var allProps = Object.getOwnPropertyNames(row);
                    var validProps = [];
                    allProps.forEach(function (prop) {
                        if (ActorSchema.properties.hasOwnProperty(prop)) {
                            validProps.push({
                                name: prop,                                  
                                value: row[prop]
                            });
                        }
                    });
                    return validProps;
                },
                references: function () {
                    var allRefs = [];
                    if (ActorSchema.references) {
                        ActorSchema.references.forEach(function (ref) {
                            allRefs.push({
                                label: ref.label,
                                model: ref.model,
                                values: function(){
                                    return row[(ref.model + "_id").toLowerCase()]
                                }
                            });
                        });
                    }
                    return allRefs;
                },
                get hasReferences() {
                    return this.references().length > 0;
                },
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            })
            
        }
    });
});

router.get('/Actor/insert', function (req, res) {
    var newObj = new Actor();
    res.render('form.mustache', {
        title: "Actor",
        properties:  function () {
                var allProps = Object.getOwnPropertyNames(ActorSchema.properties);
                var validProps = [];
                allProps.forEach(function (prop) {
                    if (ActorSchema.properties.hasOwnProperty(prop)) {
                        validProps.push({
                            name: prop,                                  
                            value: "",
                            type: function(){
                                if(!ActorSchema.properties[prop].type){
                                    return "text";
                                }
                                else{
                                    return ActorSchema.properties[prop].type;
                                }
                            },
                            pattern: function(){
                                if(ActorSchema.properties[prop].pattern){
                                    return "pattern = "+ActorSchema.properties[prop].pattern;
                                }
                            },
                            minlength: function(){
                                if(ActorSchema.properties[prop].minLength){
                                    return "minlength = "+ActorSchema.properties[prop].minLength;
                                }
                            },
                            maxlength: function(){
                                if(ActorSchema.properties[prop].maxLength){
                                    return "maxlength = "+ActorSchema.properties[prop].maxLength;
                                }
                            },
                            min: function(){
                                if(ActorSchema.properties[prop].minimum){
                                    return "min = "+ActorSchema.properties[prop].minimum;
                                }
                            },
                            max: function(){
                                if(ActorSchema.properties[prop].maximum){
                                    return "max = "+ActorSchema.properties[prop].maximum;
                                }
                            },
                            required: function(){
                                var required = ActorSchema.required;
                                if(required.includes(prop)){
                                            return "required";
                                }
                            }
                        });
                    }
                });
                return validProps;
        },
        references: function () {
            var allRefs = [];
            if (ActorSchema.references) {
                ActorSchema.references.forEach(function (ref) {
                    allRefs.push({
                        label: ref.label,
                        model: ref.model,
                        isMM: (ref.relation === "M-M"),
                        values: []
                    });
                });
            }
            return allRefs;
        },
        get hasReferences() {
            return this.references().length > 0;
        },
        method:"post",
        schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../Director"
                    });
                    return array;
                }
    })
    
});

router.get('/Actor/edit/:id', function (req, res) {
    Actor.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('form.mustache', {
                title: "Actor",
                properties: Object.keys(ActorSchema.properties).map(key => {
                    console.log("GET EDIT");
                    return {
                        name: key,
                        value: row[key],
                        type: function(){
                            if(!ActorSchema.properties[key].type){
                                return "text";
                            }
                            else{
                                return ActorSchema.properties[key].type;
                            }
                        },
                        pattern: function(){
                            if(ActorSchema.properties[key].pattern){
                                return "pattern = "+ActorSchema.properties[key].pattern;
                            }
                        },
                        minlength: function(){
                            if(ActorSchema.properties[key].minLength){
                                return "minlength = "+ActorSchema.properties[key].minLength;
                            }
                        },
                        maxlength: function(){
                            if(ActorSchema.properties[key].maxLength){
                                return "maxlength = "+ActorSchema.properties[key].maxLength;
                            }
                        },
                        min: function(){
                            if(ActorSchema.properties[key].minimum){
                                return "min = " +ActorSchema.properties[key].minimum;
                            }
                        },
                        max: function(){
                            if(ActorSchema.properties[key].maximum){
                                return "max = "+ActorSchema.properties[key].maximum;
                            }
                        },
                        required: function(){
                            var required = ActorSchema.required;
                            if(required.includes(key)){
                                return "required";
                            }
                        }
                    }
                }),
                method:"put",
                id:req.params.id,
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            });
        }
    });
});
router.get('/Director', function (req, res) {

    Director.all(function(rows){
        res.render('list.mustache', {
            title: "Director",
            columns: Object.keys(new Director()),
            searchTerm: DirectorSchema.searchProperty,
            rows: rows.map(row => {
                return {
                    properties: Object.keys(row).map(key => {
                        return {
                            name:key,
                            value:row[key]
                        }
                    }),
                    actions: [{
                        link: 'Director/details/' + row.id,
                        image: { src: '/../../images/read.png', alt: 'read' },
                        tooltip: 'Details'
                    }, {
                        link: 'Director/edit/' + row.id,
                        image: { src: '/../../images/edit.png', alt: 'edit' },
                        tooltip: 'Edit'
                    }, {
                        link: '#',
                        image: { src: '/../../images/delete.png', alt: 'delete' },
                        tooltip: 'Delete',
                        events: [{
                            name: "onclick",
                            function: "deleteRow",
                            args: row.id
                        }]
                    }]
                }
            }),
            schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"./Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"./Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"./Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"./Director"
                    });
                    return array;
                }
        });
    });
});

router.get('/Director/details/:id', function (req, res) {

    Director.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('details.mustache', {
                title: "Director",
                properties: function () {
                    var allProps = Object.getOwnPropertyNames(row);
                    var validProps = [];
                    allProps.forEach(function (prop) {
                        if (DirectorSchema.properties.hasOwnProperty(prop)) {
                            validProps.push({
                                name: prop,                                  
                                value: row[prop]
                            });
                        }
                    });
                    return validProps;
                },
                references: function () {
                    var allRefs = [];
                    if (DirectorSchema.references) {
                        DirectorSchema.references.forEach(function (ref) {
                            allRefs.push({
                                label: ref.label,
                                model: ref.model,
                                values: function(){
                                    return row[(ref.model + "_id").toLowerCase()]
                                }
                            });
                        });
                    }
                    return allRefs;
                },
                get hasReferences() {
                    return this.references().length > 0;
                },
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            })
            
        }
    });
});

router.get('/Director/insert', function (req, res) {
    var newObj = new Director();
    res.render('form.mustache', {
        title: "Director",
        properties:  function () {
                var allProps = Object.getOwnPropertyNames(DirectorSchema.properties);
                var validProps = [];
                allProps.forEach(function (prop) {
                    if (DirectorSchema.properties.hasOwnProperty(prop)) {
                        validProps.push({
                            name: prop,                                  
                            value: "",
                            type: function(){
                                if(!DirectorSchema.properties[prop].type){
                                    return "text";
                                }
                                else{
                                    return DirectorSchema.properties[prop].type;
                                }
                            },
                            pattern: function(){
                                if(DirectorSchema.properties[prop].pattern){
                                    return "pattern = "+DirectorSchema.properties[prop].pattern;
                                }
                            },
                            minlength: function(){
                                if(DirectorSchema.properties[prop].minLength){
                                    return "minlength = "+DirectorSchema.properties[prop].minLength;
                                }
                            },
                            maxlength: function(){
                                if(DirectorSchema.properties[prop].maxLength){
                                    return "maxlength = "+DirectorSchema.properties[prop].maxLength;
                                }
                            },
                            min: function(){
                                if(DirectorSchema.properties[prop].minimum){
                                    return "min = "+DirectorSchema.properties[prop].minimum;
                                }
                            },
                            max: function(){
                                if(DirectorSchema.properties[prop].maximum){
                                    return "max = "+DirectorSchema.properties[prop].maximum;
                                }
                            },
                            required: function(){
                                var required = DirectorSchema.required;
                                if(required.includes(prop)){
                                            return "required";
                                }
                            }
                        });
                    }
                });
                return validProps;
        },
        references: function () {
            var allRefs = [];
            if (DirectorSchema.references) {
                DirectorSchema.references.forEach(function (ref) {
                    allRefs.push({
                        label: ref.label,
                        model: ref.model,
                        isMM: (ref.relation === "M-M"),
                        values: []
                    });
                });
            }
            return allRefs;
        },
        get hasReferences() {
            return this.references().length > 0;
        },
        method:"post",
        schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../Director"
                    });
                    return array;
                }
    })
    
});

router.get('/Director/edit/:id', function (req, res) {
    Director.get(req.params.id,function(rows){
        if(!rows || rows.length!=1){
            res.sendStatus(404); 
        }
        else{
            let row=rows[0];//should do some check
            res.render('form.mustache', {
                title: "Director",
                properties: Object.keys(DirectorSchema.properties).map(key => {
                    console.log("GET EDIT");
                    return {
                        name: key,
                        value: row[key],
                        type: function(){
                            if(!DirectorSchema.properties[key].type){
                                return "text";
                            }
                            else{
                                return DirectorSchema.properties[key].type;
                            }
                        },
                        pattern: function(){
                            if(DirectorSchema.properties[key].pattern){
                                return "pattern = "+DirectorSchema.properties[key].pattern;
                            }
                        },
                        minlength: function(){
                            if(DirectorSchema.properties[key].minLength){
                                return "minlength = "+DirectorSchema.properties[key].minLength;
                            }
                        },
                        maxlength: function(){
                            if(DirectorSchema.properties[key].maxLength){
                                return "maxlength = "+DirectorSchema.properties[key].maxLength;
                            }
                        },
                        min: function(){
                            if(DirectorSchema.properties[key].minimum){
                                return "min = " +DirectorSchema.properties[key].minimum;
                            }
                        },
                        max: function(){
                            if(DirectorSchema.properties[key].maximum){
                                return "max = "+DirectorSchema.properties[key].maximum;
                            }
                        },
                        required: function(){
                            var required = DirectorSchema.required;
                            if(required.includes(key)){
                                return "required";
                            }
                        }
                    }
                }),
                method:"put",
                id:req.params.id,
                schemas: function(){
                    var array = [];
                    array.push({
                        name:"Tag",
                        href:"../../Tag"
                    });
                    array.push({
                        name:"Movie",
                        href:"../../Movie"
                    });
                    array.push({
                        name:"Actor",
                        href:"../../Actor"
                    });
                    array.push({
                        name:"Director",
                        href:"../../Director"
                    });
                    return array;
                }
            });
        }
    });
});

module.exports=router;