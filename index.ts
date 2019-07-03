import TokenHandler from './tokenHandler';
import createLoansEndpoint from './loans';

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

createLoansEndpoint(app,db);

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));