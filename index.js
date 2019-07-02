"use strict";
exports.__esModule = true;
var express = require('express');
var pgp = require('pg-promise')();
var app = express();
var port = 3000;
var link = 'postgres://bookish:tabletennis@localhost:5432/bookish';
var db = pgp(link);
console.log('logged into db');
app.get('/catalogue', function (req, res) {
    db.any('SELECT * FROM public."Books"')
        .then(function (data) { return res.send(data); })["catch"](function (error) { return res.send(error); });
});
app.listen(port, function () { return console.log("Bookish listening on port " + port + "!"); });
