import { Router } from 'express';
import TokenHandler from './tokenHandler';
const moment = require('moment-timezone');

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
            SELECT title, STRING_AGG(authored."authorName", ', ') as authors, isbn, available, total
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
        const queryForLoans = `SELECT username, "endDate" FROM public."Loans" as Loans
                       JOIN public."Books" as books ON books.id = Loans."bookId"
                       WHERE books."ISBN" = $1 AND NOT books.available`;

        const loans: Promise<Array<any>> = this.db.any(queryForLoans,req.params.ISBN)
            .then ( json => json.map((loan) => {
                const endDateFormatted = moment.tz(loan.endDate, "UTC").tz("Europe/London").format('YYYY-MM-DD');
                return {username: loan.username, endDate: endDateFormatted};
            })).catch( error => { console.log(error); res.send(error) } )

        const queryForTotalAvailable: string = `SELECT count(*) as total, sum(case when available then 1 else 0 end) as available 
                                                FROM (
                                                SELECT * FROM public."Books" WHERE "ISBN" = $1) 
                                                as copies GROUP BY copies."ISBN"`;
        const totalAndAvailibilty: Promise<Array<any>> = this.db.any(queryForTotalAvailable,req.params.ISBN)

        Promise.all([totalAndAvailibilty,loans])
            .then( (listOfBookInfo)=> res.send({total: listOfBookInfo[0][0].total, available: listOfBookInfo[0][0].available, loans: listOfBookInfo[1]}))
    }

    updateDataBase(db) {
        this.db = db;
    }

}

export default new Catalogue();