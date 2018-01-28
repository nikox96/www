// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var StringDecoder = require('string_decoder').StringDecoder;

// load up the user model
var User = require('../app/models/user');
var Agent = require('../app/models/agent');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        console.log('serialize: ' + user);
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function (user, done) {
        console.log('deserialize: ' + user);
        done(null, user);
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    // by default, local strategy uses username and password, we will override with email

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'cage',
            passwordField: 'xpwd',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, cage, xpwd, done) {
            // asynchronous
            Agent.find(cage, function (err, res) {
                if (err || res === null)
                    return done(null, false, req.flash('signupMessage', 'Codice agente non censito'));
                else {
                    User.findOne(cage, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);
                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'Codice agente già presente'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = {};
                            // set the user's local credentials
                            newUser.cage = cage;
                            newUser.xpwd = xpwd;
                            newUser.xnome = req.body.xnome;
                            newUser.xcogn = req.body.xcogn;
                            newUser.cuser = req.body.cuser;
                            // save the user
                            User.createUser(newUser, function (err, hash) {
                                if (err)
                                    throw err;
                                newUser.xpwd = hash;
                                return done(null, newUser);
                            });
                        }
                    });
                }
            });
        }));
    // =========================================================================
    // LOCAL LOGIN ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for login
    // by default, if there was no name, it would just be called 'local'
    // by default, local strategy uses username and password, we will override with email

    passport.use('local-login', new LocalStrategy({
            usernameField: 'cage',
            passwordField: 'xpwd',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, cage, xpwd, done) {
            // asynchronous

            User.login(cage, xpwd, function (err, user) {
                // if there are any errors, return the error
                console.log("local-login err " + err);
                console.log("local-login res " + user.cage + " " + user.xnome);
                if (err)
                    return done(null, false, req.flash('loginMessage', err));
                // check to see if theres already a user with that email
                if (user) {
                    var dec = new StringDecoder('utf8');
                    user.xpwd = dec.write(user.xpwd);
                    return done(null, user);
                }
            });
        }));
};