const jwt = require('jsonwebtoken');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;

export default class TokenHandler {

    private static readonly encryptionKey: string = 'theCakeIsALie';

    static getToken(username: string): string {
        return jwt.sign({username:username},this.encryptionKey);
    }

    static setUpPassportVerification(db): void {
        const options = {
            'secretOrKey': this.encryptionKey,
            'jwtFromRequest': req => req.query.token
        };

        passport.use( new JwtStrategy(options, (jwt_payload, done) => {
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

        console.log('Passport set up');
    }

    static authenticateToken() {
        return passport.authenticate('jwt',{session: false})
    }
}