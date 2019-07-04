import TokenHandler from './tokenHandler';

export default function createAddBookEndpoint ( app, db ) : void {
    app.get('/add', TokenHandler.tokenAuthentication, (req,res) => {
        const ISBN = req.query.ISBN;

        bookExists(db, ISBN)
            .then ( data => {
                //The book already exists
                res.send(data)

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
            .then ( data => {
                if ( data.length > 0 ) {
                    resolve(data)
                } else {
                    reject()
                }
            })
            .catch(e=>console.log(e));
    });
}