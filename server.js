var express = require("express");
var app = express();
var PORT = 3000;
var path = require("path");

app.use(express.json());
app.use(express.static('static'))


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
});

// module.exports = app;

app.listen(PORT, function () {
    console.log("Start serwera na porcie - " + PORT);
});