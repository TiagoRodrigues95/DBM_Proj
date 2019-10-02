var express = require("express");
var mustacheExpress = require("mustache-express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.engine('mustache', mustacheExpress(__dirname + '/Views'));
app.set('view engine', 'mustache');
app.set('views', __dirname + '/Views');
app.use(express.static(__dirname+'/Public'));

var routes = require('./Controllers/api.js');
var backofficeRoutes =require('./Controllers/backoffice.js');
var frontOfficeRoutes =require('./Controllers/frontoffice.js');
app.use('/api', routes);
app.use('/backoffice',backofficeRoutes);
app.use('/',frontOfficeRoutes);
var server = app.listen(8082,function () {
    var host = server.address().address === "::" ? "localhost" : server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});
 