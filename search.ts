import TokenHandler from './tokenHandler';

export default function createSearchEndpoint ( app, db ) : void {
    app.get('/search', TokenHandler.tokenAuthentication, (req,res) => {
        const title : string = req.query.title;
        const author : string = req.query.author;
    
        let condition : string;
        if ( title === undefined ) {
            if ( author === undefined ) {
                res.error('No search parameters');
                return;
            } else {
                condition = `"authorName" LIKE UPPER('%${author.toUpperCase()}%')`;
            }
        } else {
            if ( author === undefined ) {
                condition = `title LIKE UPPER('%${title.toUpperCase()}%')`;
            } else {
                condition = `"authorName" LIKE UPPER('%${author.toUpperCase()}%') AND title LIKE UPPER('%${title.toUpperCase()}%')`;
            }
        }
    
        let sql : string = `
            SELECT book."ISBN", book.title, ARRAY_AGG(authored."authorName") as authors
            FROM public."BookInfo" as book 
            JOIN public."AuthoredBy" as authored 
                ON authored."ISBN" = book."ISBN" 
            WHERE ${condition}
            GROUP BY book."ISBN", book.title`;
    
        db.any(sql)
            .then(data => res.json(data) )
            .catch(e=>console.log(e));
    });
}