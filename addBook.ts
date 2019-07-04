import TokenHandler from './tokenHandler';

function addBookAlreadyInCatalogue(db,numberToAdd:number = 1,ISBN:string,res) {

    const query = `INSERT INTO public."Books" ("ISBN",available) VALUES ($1,true)`;
    for(let i =0;i<numberToAdd;i++) {
        db.any(query, ISBN).catch(e => console.log(e));
    }

    res.send('done')

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
                    addBookAlreadyInCatalogue(db,req.numberToAdd,bookInfo.ISBN,res);
                }


            }, () => {
                //The book does not exist
                res.send("Book does not exist in catalogue")
                
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