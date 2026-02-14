const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const providerAvatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // Always update avatar from Google on each login
                    if (providerAvatar) {
                        user.avatar = providerAvatar;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Check if user exists with this email
                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    // Link the accounts and update avatar
                    user.googleId = profile.id;
                    if (providerAvatar) user.avatar = providerAvatar;
                    await user.save();
                    return done(null, user);
                }

                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: email,
                    avatar: providerAvatar,
                });

                done(null, user);
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const providerAvatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    // Always update avatar from GitHub on each login
                    if (providerAvatar) {
                        user.avatar = providerAvatar;
                        await user.save();
                    }
                    return done(null, user);
                }

                // GitHub emails might be private, so handle that case
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

                if (email) {
                    // Check if user exists with this email
                    user = await User.findOne({ email });
                    if (user) {
                        // Link the accounts and update avatar
                        user.githubId = profile.id;
                        if (providerAvatar) user.avatar = providerAvatar;
                        await user.save();
                        return done(null, user);
                    }
                }

                user = await User.create({
                    githubId: profile.id,
                    displayName: profile.displayName || profile.username,
                    email: email, // Note: Without email scope, this might be null.
                    avatar: providerAvatar,
                });

                done(null, user);
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
