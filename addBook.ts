import TokenHandler from './tokenHandler';

export default function createAddBookEndpoint ( app, db ) : void {
    app.get('/add', TokenHandler.tokenAuthentication, (req,res) => {
        const ISBN = req.query.ISBN;

        const isBookKnown : string = `
            SELECT *
            FROM public."BookInfo"
            WHERE "ISBN" = $1`;

        db.any(isBookKnown,[ISBN])
            .then ( data => data.length > 0 )
            .catch ( e => console.log(e) )
            .then ( (existing : boolean) => {
                if ( existing ) {
                    checkBookDetailsConsistent (req.query)
                        .then ( () => {

                        }, () => {
                            
                        })
                } else {

                }
            });
    } );
}