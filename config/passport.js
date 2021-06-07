const db = require("../models")
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = db.Admins;

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        {
        usernameField: 'username',
        passswordField: 'password'
    },
        (username, password, done) => {
            User.findOne({
                where: {
                    username: username
                }
            })
            .then((user) => {
                // console.log(user);
                if (!user) {
                    return done(null, false, {message: 'credentials not found'});
                }
                // const newHash = bcrypt.hashSync(password, 10);
                // console.log(newHash);
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err;
                    }
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        console.log("event");
                        return done(null, false,{message: 'credentials not found'});
                    }
                })
            })
            .catch((err) => {
                console.log(err)
            })
        })
    )

    passport.serializeUser((user, done) => {
        console.log(user);
        done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        // User.findOne({
        //      where: {
        //         id: id
        //     }
        // })
        User.findByPk(id)
        .then((user) => {
            done(null, user);
        }).catch(done);
    })
}
