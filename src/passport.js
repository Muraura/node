const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const keys = require("../config/keys");
const opts = {};
(opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()),
  (opts.secretOrKey = keys.secretKey);

const { PersonnelController } = require("./controllers");

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      PersonnelController.findById(jwt_payload.id, (err, personnel) => {
        if (err) {
          return done(err, null);
        } else {
          return done(null, personnel);
        }
      });
    })
  );
};
