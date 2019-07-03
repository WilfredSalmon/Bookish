import TokenHandler from './tokenHandler';

const express = require('express');
const pgp = require('pg-promise')();

const app = express();
const port = 3000;

const link = 'postgres://bookish:tabletennis@localhost:5432/bookish';

const db = pgp(link);
console.log('logged into db');

app.get('/catalogue', (req,res) => {
    TokenHandler.validateToken(db)
        .then(
            valid => {
                if ( valid ) {
                    return db.any('SELECT * FROM public."Books"');
                } else {
                    throw new Error('Invalid token');
                }
            },
            error => {
                throw error;
            }
        )
        .then(data => res.send(data))
        .catch(error => res.send(error));
});

app.get('/login', (req,res) => {
    const username = req.query.username;
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

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));