import TokenHandler from './tokenHandler';

export default function ( app, db ) {
    app.get('/login', (req,res) => {
        const username : string = req.query.username.toLowerCase();
        const password : string = req.query.password;

        db.any('SELECT * FROM public."Users" WHERE LOWER(username) = $1 AND password = $2',[username,password])
            .then(data=> {
                res.send(data.length > 0
                    ? `token is ${TokenHandler.getToken(username)}`
                    : 'invalid username and password'
                );
            })
            .catch( e => console.log(e));
    } );
};