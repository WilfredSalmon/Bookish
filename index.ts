import TokenHandler from './tokenHandler';

const express = require('express');
const pgp = require('pg-promise')();

const app = express();
const port = 3000;

const link = 'postgres://bookish:tabletennis@intwilsal.zoo.lan:5432/bookish';

const db = pgp(link);
console.log('logged into db');

TokenHandler.setUpPassportVerification(db);

app.get('/catalogue',TokenHandler.tokenAuthentication, (req,res) => {
    db.any('SELECT * FROM public."Books"')
        .then( data => res.send(data));
});

app.get('/login', (req,res) => {
    const username : string = req.query.username.toLowerCase();
    const password : string = req.query.password;

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

app.get('/search', TokenHandler.tokenAuthentication, (req,res) => {
    const title : string = req.query.title;
    const author : string = req.query.author;

    let condition : string;
    if ( title === undefined ) {
        if ( author === undefined ) {
            res.error('No search parameters');
            return;
        } else {
            condition = `author LIKE '${author}'`;
        }
    } else {
        if ( author === undefined ) {
            condition = `title LIKE '${title}'`;
        } else {
            condition = `author LIKE '${author}' AND title LIKE '${title}'`;
        }
    }

    let sql : string = `SELECT * FROM public."BookInfo" as book JOIN public."AuthoredBy" as authored ON authored."ISBN" = book."ISBN" WHERE ${condition}`;

    db.any(sql)
        .then(data => {
            let result = new Object();
            for ( let item of data ) {
                if ( result[item.ISBN] === undefined ) {
                    result[item.ISBN] = { title : item.title, authors : [item.authorName] };
                } else {
                    result[item.ISBN].authors.push(item.authorName);
                }
            }
            res.json(result);
        })
        .catch(e=>console.log(e));

});

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));