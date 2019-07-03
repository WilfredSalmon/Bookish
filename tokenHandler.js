"use strict";
exports.__esModule = true;
var jwt = require('jsonwebtoken');
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var TokenHandler = /** @class */ (function () {
    function TokenHandler() {
    }
    TokenHandler.getToken = function (username) {
        return jwt.sign({ username: username }, 'theCakeIsALie');
    };
    TokenHandler.validateToken = function (db) {
        var options = {
            'secretOrKey': 'theCakeIsALie',
            'jwtFromRequest': function (req) { return req.query.token; }
        };
        return passport.use(new JwtStrategy(options, function (jwt_payload, done) {
            db.any('SELECT * FROM public."Users" WHERE username = $1', [jwt_payload.username])
                .then(function (data) {
                if (data.length > 0) {
                    done(null, jwt_payload.username);
                }
                else {
                    done(null, false);
                }
            })["catch"](function (e) { return done(e); });
        }));
    };
    return TokenHandler;
}());
exports["default"] = TokenHandler;
