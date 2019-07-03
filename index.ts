import Book from './book';

const express = require('express');
const pgp = require('pg-promise')();
const app = express();
const port = 3000;

const link = 'postgres://bookish:tabletennis@intwilsal.zoo.lan:5432/bookish';

const db = pgp(link);
console.log('logged into db');

app.get('/catalogue', (req,res) => {
    db.any('SELECT * FROM public."Books"')
        .then((data) => res.send(data))
        .catch((error) => res.send(error));
});

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));


