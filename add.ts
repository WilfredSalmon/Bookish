import TokenHandler from './tokenHandler';

export default function createAddEndpoint ( app, db ) : void {
    app.get('/add', TokenHandler.tokenAuthentication, (req,res) => {
        const ISBN = req.query.ISBN;

        bookExists(db, ISBN)
            .then ( data => {
                //The book already exists

            }, () => {
                //The book does not exist
                
            })
    }
}

function bookExists(db, ISBN) {
    return new Promise ((resolve,reject) => {
        const isBookKnown : string = `
            SELECT *
            FROM public."BookInfo"
            WHERE "ISBN" = $1`;

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