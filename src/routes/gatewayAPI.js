const { passport, accFnc } = require('./account');
const session = require('express-session');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const flash = require('express-flash');

function runSystem()
{
    mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Connected!'));
    // Express.js configuration
    app.use(session({ secret: 'your session secret', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(flash());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../../public/account'));
    // Routes
    app.use('/', router);
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
}
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Redirect to login page
        res.redirect('/login');
    }
}
router.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/textEditor', 'index.html'));
})
router.get('/register', (req, res) => {
    res.render('register', { message: req.flash('message') });
});
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

router.post('/register', (req, res) => {
    console.log(req.body);
    return accFnc.register(req, res);

});

router.post('/login', passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureFlash: { type: 'error', message: 'Invalid username or password.' }
}));
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = { runSystem };
