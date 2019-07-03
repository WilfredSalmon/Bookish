import { Router } from 'express';
import TokenHandler from './tokenHandler';
import Book from './book';

class Catalogue {
    public router;
    public db;

    constructor() {
        this.router = Router();
        this.router.get('/', TokenHandler.tokenAuthentication, this.displayCatalogue.bind(this));
    }

    displayCatalogue(req,res) {
        this.db.any('SELECT * FROM public."Books"')
            .then( jsonOfBooks => {
                    const promisesOfTitles = jsonOfBooks.map(book => this.db.any('SELECT title FROM public."BookInfo" WHERE "ISBN" = $1', book.ISBN));
                     return Promise.all(promisesOfTitles)
                })
            .then(listOfBooks => res.send(listOfBooks.map(book => book[0].title).filter( (title,index,self) => (self.indexOf(title) === index)).sort().join(', ')));
            // .then(bookList => res.send(bookList.map( book => book.title))
            //     , ()=>  {throw new Error('Cannot map the books')});
    }

    updateDataBase(db) {
        this.db = db;
    }

}

export default new Catalogue();