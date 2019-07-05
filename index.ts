import TokenHandler from './tokenHandler';
import createLoginEndpoint from './login';
import createLoansEndpoint from './loans';
import createSearchEndpoint from './search';
import Catalogue from './catalouge';
import createAddBookEndpoint from "./addBook";

const express = require('express');
const pgp = require('pg-promise')();

const app = express();
const port = 3000;

const link = 'postgres://bookish:tabletennis@intwilsal.zoo.lan:5432/bookish';

const db = pgp(link);
console.log('logged into db');

TokenHandler.setUpPassportVerification(db);

Catalogue.updateDataBase(db
app.use('/Catalogue', Catalogue.router);

createLoginEndpoint(app,db);
createLoansEndpoint(app,db);
createSearchEndpoint(app,db);
createAddBookEndpoint(app,db);

app.listen(port, () => console.log(`Bookish listening on port ${port}!`));