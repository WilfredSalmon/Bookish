const jwt = require('jsonwebtoken');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;

export default class TokenHandler {

    static getToken(username: string): string {
        return jwt.sign({username:username},'theCakeIsALie');
    }

    static validateToken(db): Promise<boolean> {
        const options = {
            'secretOrKey': 'theCakeIsALie',
            'jwtFromRequest': req => req.query.token
        };

        return passport.use( new JwtStrategy(options, (jwt_payload, done) => {
            db.any('SELECT * FROM public."Users" WHERE username = $1', [jwt_payload.username])
                .then(
                    data => {
                        if ( data.length > 0 ) {
                            done(null,jwt_payload.username);
                        } else {
                            done(null,false);
                        }
                    }
                )
                .catch( e => done(e));
        }));
    }
}