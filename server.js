var express = require("express");
var app = express();
var PORT = 3000;
var path = require("path");

app.use(express.json());
app.use(express.static('static'))

let users = [];

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
});

app.post('/login', function (req, res) {
    res.setHeader('content-type', 'application/json');
    let username = req.body.username;

    if (users.length == 2) {
        res.send({ success: false, message: "2 users are already playing" })
        return;
    }

    if (users.includes(username)) {
        res.send({ success: false, message: "User with given username is alredy playing" })
        return;
    }

    users.push(username);

    if (users.length == 1) res.send({ success: true, message: "waiting" })
    if (users.length == 2) res.send({ success: true, message: "starting" })
});

app.post('/waitingForSecondPlayer', function (req, res) {
    res.setHeader('content-type', 'application/json');

    if (users.length == 2) {
        res.send({ startGame: true })
    } else {
        res.send({ startGame: false })
    }
});

app.post('/getUsernamesList', function (req, res) {
    res.setHeader('content-type', 'application/json');

    for (user of users) {
        if (user != req.body.username) {
            res.send({ username: user })
            return
        }
    }
});

app.post('/resetUsers', function (req, res) {
    users = [];
});

// module.exports = app;

app.listen(PORT, function () {
    console.log("Start serwera na porcie - " + PORT);
});