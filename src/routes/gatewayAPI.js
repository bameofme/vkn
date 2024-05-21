const { passport, accFnc } = require('./account');
const textEditor  = require('./textEditor');
const session = require('express-session');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const flash = require('express-flash');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

function runSystem()
{
    mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Connected!'));
    app.use(session({ secret: 'your session secret', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(flash());
    app.set('view engine', 'ejs');
    app.set('views', [
        path.join(__dirname, '../../public/account'),
        path.join(__dirname, '../../public/textEditor')
      ]);
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
    res.render('index', { script: textEditor.getlistScritps(), styles: textEditor.getlistStyles()});
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

router.get('/textEditor/:fileName', ensureAuthenticated, (req, res) => {
    return textEditor.openFile(req, res);
});
router.put('/textEditor/:fileName', ensureAuthenticated, (req, res) => {
    return textEditor.saveFile(req, res);
});
router.get('/textEditor/workspace/:dir', ensureAuthenticated, (req, res) => {
    const files = textEditor.getFiles(req.params.dir);
    res.json(files);
});

router.post('/installApp', ensureAuthenticated, upload.single('file'), (req, res) => {
   return textEditor.installApp(req, res);
});
router.get('/unInstallApp/:appName', ensureAuthenticated, (req, res) => {
    return textEditor.unInstallApp(req, res);
});
router.get('/listInstalls', ensureAuthenticated, (req, res) => {
    return textEditor.getListApp(req, res);
});

module.exports = { runSystem };
