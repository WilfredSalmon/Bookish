import TokenHandler from './tokenHandler';
const fs = require('fs');
const request = require('request');

function addBookAlreadyInCatalogue(db,numberToAdd:number = 1,ISBN:string,res) {

    const query = `INSERT INTO public."Books" ("ISBN",available) VALUES ($1,true) RETURNING id`;

    const barcodePromises = [];

    for(let i =0;i<numberToAdd;i++) {
        barcodePromises.push(db.any(query, ISBN)
            .then( id => {
                return new Promise(resolve => {
                    console.log(`http://barcodes4.me/barcode/c128b/${id[0].id}-${ISBN}.png`);
                    request(`http://barcodes4.me/barcode/c128b/${id[0].id}-${ISBN}.png`,{encoding: 'binary'}, (error, response, body) => /*{res.send(body , {encoding: 'binary'});*/resolve(body))
                    }
                )
            })
            .catch(e => console.log(e)))
    }

    // Promise.all(barcodePromises).then( images => images.map( image => new Buffer(image, 'base64') ).then(() => res.end());
    res.contentType('application/json');
    Promise.all(barcodePromises).then( images => res.send(images));

}

function addNewBook(db, numberToAdd:number = 1, ISBN:string, title:string, authors:string[], res) {
    const registerBookType:string = 'INSERT INTO public."BookInfo" ("ISBN", title) VALUES ($1, $2)'

    db.any(registerBookType, [ISBN, title])
        .then ( addAuthorInfo(db,ISBN, authors) )
        .catch ( e => console.log(e) )
        .then ( () => {addBookAlreadyInCatalogue ( db, numberToAdd, ISBN, res )});
}

function addAuthorInfo ( db, ISBN:string, authors:string[] ) {
    const addAuthorInfo:string = 'INSERT INTO public."AuthoredBy" ("ISBN", "authorName") VALUES ($1, $2)';
    const authorPromises = authors.map(author=>db.any(addAuthorInfo,[ISBN,author]));
    return Promise.all(authorPromises); 
}

function checkConsistency(req, bookInfo: any,res) {
    let consistent = true;
    if (req.query.title && req.query.title != bookInfo.title) {
        consistent = false;
        res.send(`Inconsistent titles. Query= ${req.query.title}, bookInfo= ${bookInfo.title}`);
    }

    if (req.query.authors && !compareAuthorArrays(req.query.authors, bookInfo.authors)) {
        consistent = false;
        res.send(`Inconsistent authors. Query= ${req.query.authors}, bookInfo= ${bookInfo.authors}`);
    }
    return consistent;
}

export default function createAddBookEndpoint ( app, db ) : void {
    app.get('/add', TokenHandler.tokenAuthentication, (req,res) => {
        const ISBN = req.query.ISBN;

        bookExists(db, ISBN)
            .then ( (bookInfo:any) => {
                //The book already exists

                if (checkConsistency(req, bookInfo,res)) {
                    addBookAlreadyInCatalogue(db,req.query.numberToAdd,bookInfo.ISBN,res);
                }


            }, () => {
                //The book does not exist
                if ( req.query.ISBN && req.query.title && req.query.authors ) {
                    addNewBook(db, req.query.numberToAdd, req.query.ISBN, req.query.title, req.query.authors, res);
                }
            });
    })
}





function bookExists(db, ISBN) {
    return new Promise ((resolve,reject) => {
        const isBookKnown : string = `
            SELECT bookinfo."ISBN", title, ARRAY_AGG(authoredby."authorName") as authors  
            FROM public."BookInfo" as bookinfo
            JOIN public."AuthoredBy" as authoredby ON authoredby."ISBN" = bookinfo."ISBN"
            WHERE bookinfo."ISBN" = $1
            GROUP BY bookinfo."ISBN", title`;

        db.any(isBookKnown,[ISBN])
            .then ( bookWithISBN => {
                if ( bookWithISBN.length > 0 ) {
                    if(bookWithISBN.length > 1) {
                        console.log('More than one book with this ISBN in bookInfo? Taking first instance')
                    }
                    resolve(bookWithISBN[0]);
                } else {
                    reject()
                }
            })
            .catch(e=>console.log(e));
    });
}

function compareAuthorArrays(arr1, arr2) {
    return (arr1.sort().join() === arr2.sort().join());
}