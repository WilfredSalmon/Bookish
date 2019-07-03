import TokenHandler from './tokenHandler';

const express = require('express');
const pgp = require('pg-promise')();

const app = express();
const port = 3000;

const link = 'postgres://bookish:tabletennis@intwilsal.zoo.lan:5432/bookish';

const db = pgp(link);
console.log('logged into db');

TokenHandler.setUpPassportVerification(db);

app.get('/catalogue', TokenHandler.tokenAuthentication, (req,res) => {
    db.any('SELECT * FROM public."Books"')
        .then( data => res.send(data));
});

app.get('/login', (req,res) => {
    const username = req.query.username.toLowerCase();
    const password = req.query.password;

    db.any('SELECT * FROM public."Users" WHERE username = $1 AND password = $2',[username,password])
        .then(data=> {
            if (data.length > 0) {
                res.send(`token is ${TokenHandler.getToken(username)}`);
            } else {
                res.send('invalid username and password');
            }
        })
        .catch( e => console.log(e));

});

app.get('/loans', TokenHandler.tokenAuthentication, (req,res) => {
    const username = req.user;
    db.any('SELECT title, "startDate", "endDate" FROM public."Loans" as loans JOIN public."Books" as books ON books.id = loans."bookId" JOIN public."BookInfo" as book ON book."ISBN" = books."ISBN" WHERE username = $1', [username])
        .then( data => {
            res.send(data);
        })
        .catch ( e => console.log(e) );
});

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));