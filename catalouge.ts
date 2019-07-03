import { Router } from 'express';
import TokenHandler from './tokenHandler';

class Catalogue {
    public router;
    public db;

    constructor() {
        this.router = Router();
        this.router.get('/', TokenHandler.tokenAuthentication, this.displayCatalogue.bind(this));
    }

    private displayCatalogue(req,res) {
        this.db.any(`SELECT Books."id", Books."ISBN", Books.available, BookInfo.title, AuthoredBy."authorName" 
                            FROM public."Books" as Books 
                            INNER JOIN public."BookInfo" as BookInfo ON Books."ISBN" = BookInfo."ISBN"
                            INNER JOIN public."AuthoredBy" as AuthoredBy ON Books."ISBN" = AuthoredBy."ISBN"
                            `)
            .then((listOfBooks) => res.send(
                listOfBooks.reduce((acc,book) => {
                    if ( acc.filter( (bookInList) => bookInList.id === book.id).length >0 ) {
                        acc.find( (bookInList) => book.id === bookInList.id).authorName += ', ' + book.authorName;
                    } else {
                        acc.push(book);
                    }

                    return acc;
                },[])
                    .reduce((acc,book) => {
                        if (acc.filter((bookInList) => bookInList.ISBN === book.ISBN).length > 0) {
                            const bookInList = acc.find((bookInList) => book.ISBN === bookInList.ISBN);
                            bookInList.total += 1;
                            if (book.available) {bookInList.available += 1}
                        } else {
                            acc.push({ISBN: book.ISBN, title: book.title, author: book.authorName, total:1, available: 1});
                        }
                        return acc;
                    },[])

            ));
    }

    updateDataBase(db) {
        this.db = db;
    }

}

export default new Catalogue();