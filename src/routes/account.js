const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { hashSync } = require('bcryptjs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
// User model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
const User = mongoose.model('User', userSchema);

// Passport.js configuration
passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        })
        .catch(err => done(err));
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});

async function register(req, res) {
    const { username, password } = req.body;
    const hashedPassword = hashSync(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        console.log('User registered successfully');
        await req.login(user, err => {
            if (err) {
                return res.status(500).send('Error logging in new user');
            }
    
            return res.redirect('/');
        });
    } catch (err) {
        console.error('Error registering new user:', err);
        return res.status(400).send('Error registering new user');
    }
}

async function updatePassword(userId, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
        console.error('User not found');
        return false;
    }

    const hashedPassword = hashSync(newPassword, 10);
    user.password = hashedPassword;

    try {
        await user.save();
        console.log('Password updated successfully');
        return true;
    } catch (err) {
        console.error('Error updating password:', err);
        return false;
    }
}


const accFnc = {
    register,
    updatePassword
};

module.exports = { passport, accFnc };