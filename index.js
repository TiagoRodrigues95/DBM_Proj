var express = require("express");
var serverGenerator = require("./Server/server.js");

var app = express();

app.use(express.static('public'));


app.post("/generate", function (req, res) {
    serverGenerator.generate();
    setTimeout(function() {
        res.redirect("http://localhost:8082/");
      }, 2000);
    
});

var server = app.listen(8081, function () {
    var host = server.address().address === "::" ? "localhost" :
        server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});