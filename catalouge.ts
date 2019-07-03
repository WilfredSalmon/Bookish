import { Router } from 'express';
import TokenHandler from './tokenHandler';

class Catalogue {
    public router;
    public db;

    constructor() {
        this.router = Router();
        this.router.get('/', TokenHandler.tokenAuthentication, this.displayCatalogue.bind(this));
        this.router.get('/:ISBN', TokenHandler.tokenAuthentication, this.displayBookCopies.bind(this));
    }

    displayCatalogue(req,res) {
        const query : string = `
            SELECT title, STRING_AGG(Authored."authorName", ', ') as authors, isbn, available, total
            FROM (
                SELECT title, book."ISBN" as isbn, sum(case when available then 1 else 0 end) as available, count(*) as total
                FROM public."BookInfo" as book
                JOIN public."Books" as books
                    ON books."ISBN" = book."ISBN"
                GROUP BY title, book."ISBN"
            ) as catalogue
            JOIN public."AuthoredBy" as authored
                ON catalogue.isbn = authored."ISBN"
            GROUP BY title, isbn, available, total
            ORDER BY title`;
        
        this.db.any(query).then ( json => res.send(json) ).catch( error => { console.log(error); res.send(error) } );
    }

    displayBookCopies(req,res) {
        res.send((req.params.ISBN));
    }

    updateDataBase(db) {
        this.db = db;
    }

}

export default new Catalogue();