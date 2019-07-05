import TokenHandler from './tokenHandler';

export default function createSearchEndpoint ( app, db ) : void {
    app.get('/search', TokenHandler.tokenAuthentication, (req,res) => {
        const title : string = req.query.title;
        const author : string = req.query.author;

        const condition = getCondition(title, author);

        if (!condition) {
            res.error('No search parameters');
            return;
        }
    
        let sql : string = `
            SELECT * 
            FROM public."BookInfo" as book 
            JOIN public."AuthoredBy" as authored 
                ON authored."ISBN" = book."ISBN" 
            WHERE ${condition}`;
    
        db.any(sql)
            .then(data => {
                let result = new Object();
                for ( let item of data ) {
                    if ( result[item.ISBN] === undefined ) {
                        result[item.ISBN] = { title : item.title, authors : [item.authorName] };
                    } else {
                        result[item.ISBN].authors.push(item.authorName);
                    }
                }
                res.json(result);
            })
            .catch(e=>console.log(e));
    })

    function getCondition(title, author) {
        if ( title === undefined ) {
            return author === undefined
                ? null
                : `"authorName" LIKE UPPER('%${author.toUpperCase()}%')`;
        }

        return author === undefined
            ? `title LIKE UPPER('%${title.toUpperCase()}%')`
            : `"authorName" LIKE UPPER('%${author.toUpperCase()}%') AND title LIKE UPPER('%${title.toUpperCase()}%')`;
    }
}