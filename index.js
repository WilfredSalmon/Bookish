"use strict";
exports.__esModule = true;
var tokenHandler_1 = require("./tokenHandler");
var express = require('express');
var pgp = require('pg-promise')();
var app = express();
var port = 3000;
var link = 'postgres://bookish:tabletennis@localhost:5432/bookish';
var db = pgp(link);
console.log('logged into db');
app.get('/catalogue', function (req, res) {
    tokenHandler_1["default"].validateToken(db)
        .then(function (valid) {
        if (valid) {
            return db.any('SELECT * FROM public."Books"');
        }
        else {
            throw new Error('Invalid token');
        }
    }, function (error) {
        throw error;
    })
        .then(function (data) { return res.send(data); })["catch"](function (error) { return res.send(error); });
});
app.get('/login', function (req, res) {
    var username = req.query.username;
    var password = req.query.password;
    db.any('SELECT * FROM public."Users" WHERE username = $1 AND password = $2', [username, password])
        .then(function (data) {
        if (data.length > 0) {
            res.send("token is " + tokenHandler_1["default"].getToken(username));
        }
        else {
            res.send('invalid username and password');
        }
    })["catch"](function (e) { return console.log(e); });
});
app.listen(port, function () { return console.log("Bookish listening on port " + port + "!"); });
