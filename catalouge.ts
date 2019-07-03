import { Router } from 'express';
import TokenHandler from './tokenHandler';

class Catalogue {
    public router;
    public db;

    constructor() {
        this.router = Router();
        this.router.get('/', TokenHandler.tokenAuthentication, this.displayCatalogue.bind(this));
    }

    // displayCatalogue(req,res) {
    //     this.db.any('SELECT * FROM public."Books"')
    //         .then( jsonOfBooks => {
    //             console.log(jsonOfBooks);
    //             const promisesOfTitles = jsonOfBooks.map(book => 
    //                 this.db.any('SELECT * FROM public."BookInfo" WHERE "ISBN" = $1', book.ISBN)
    //             );
    //             return Promise.all(promisesOfTitles);
    //         })
    //         .then( listOfBooks => res.send(
    //             listOfBooks
    //                 .map(book => book[0].title)
    //                 .filter( (title,index,self) => (self.indexOf(title) === index) )
    //                 .sort()
    //                 .join(', '))
    //         );
    // }

    displayCatalogue(req,res) {
        const query : string = `
            SELECT title, book."ISBN", STRING_AGG(Authored."authorName", ', ') as authors, sum(case when available then 1 else 0 end) as available, count(*) as total
            FROM public."BookInfo" as book
            JOIN public."Books" as books
                ON books."ISBN" = book."ISBN"
            JOIN public."AuthoredBy" as authored
                ON book."ISBN" = authored."ISBN"
            GROUP BY title, book."ISBN"`

        const nestedQuery : string = `
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
            `;
        this.db.any(nestedQuery).then ( json => res.send(json) ).catch( error => { console.log(error); res.send(error) } );
    }

    updateDataBase(db) {
        this.db = db;
    }

}

export default new Catalogue();