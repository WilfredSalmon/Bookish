import TokenHandler from './tokenHandler';

export default function createAddBookEndpoint ( app, db ) : void {
    app.get('/add', TokenHandler.tokenAuthentication, (req,res) => {
        const ISBN = req.query.ISBN;

        bookExists(db, ISBN)
            .then ( (bookInfo:any) => {
                //The book already exists
                let constistent = true;
                if (req.query.title && req.query.title != bookInfo.title) {
                    constistent = false;
                    res.send(`Title is inconsistent. Query= ${req.query.title}, bookInfo= ${bookInfo.title}`);
                } else {
                    res.send('Consistent with title')
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