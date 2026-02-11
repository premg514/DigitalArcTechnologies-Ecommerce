const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // User exists, update Google ID if not set
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user.avatar = profile.photos[0]?.value || user.avatar;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0]?.value || 'https://via.placeholder.com/150',
                        isVerified: true, // Google users are pre-verified
                        password: Math.random().toString(36).slice(-8), // Random password (won't be used)
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );

    console.log('✓ Google OAuth strategy configured');
} else {
    console.log('⚠ Google OAuth not configured (credentials missing)');
}

module.exports = passport;
