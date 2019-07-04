import TokenHandler from './tokenHandler';

export default function createLoansEndpoint ( app, db ) : void {
    app.get('/loans', TokenHandler.tokenAuthentication, (req,res) => {
    const username : string = req.user;
    const query : string = `
        SELECT title, "startDate", "endDate"
        FROM public."Loans" as loans
        JOIN public."Books" as books
            ON books.id = loans."bookId"
        JOIN public."BookInfo" as book
            ON book."ISBN" = books."ISBN"
        WHERE username = $1`;
    
    db.any(query, [username])
        .then( data => {
            res.send(data);
        })
        .catch ( e => console.log(e) );
});
}