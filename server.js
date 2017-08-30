var express = require('express');
var app = express();

// set port
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

// routes
app.get("/", function(request, response) {
	response.render("index");
});

app.use(function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});

app.listen(port, function() {
	console.log("listening to this port:" + port);
});