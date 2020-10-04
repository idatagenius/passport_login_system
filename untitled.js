if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const User = require('./models/user')
const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/todo-app-db", {useNewUrlParser: true, useUnifiedTopology: true});

const {MongoClient} = require('mongodb');

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email ),
    id => users.find(user => user.id === id )
) 

const users = User.find({})

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// Main Page
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

// Login Page
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  });
// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }))
// app.post('/login', (req, res) => {
//     bcrypt.compare(req.body.password, )
// })

// Register Page
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// app.post('/register', checkNotAuthenticated, async (req, res) => {
//     try {
//         const hashedPassword = bcrypt.hash(req.body.password, 10, function(err, hash) {
//             // Store hash in your password DB.
//             User.create({
//                 name: req.body.name,
//                 email: req.body.email,
//                 password: hashedPassword
//             })
//             res.redirect('/login')
//         })
//     } catch {
//         res.redirect('/register')
//     }
//     console.log(users)
// })

app.post('/register', (req, res) => {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
        // returns hash
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash
        })
        res.redirect('/login')
        });
    });
})

// Log Out Page
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

// Database
app.post('/user', function(req, res) { 
    User.create(req.body)
    .then(function(dbUser) {
        // If we were able to successfully create a User, send it back to the client
        res.json(dbUser);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    }); 
})

app.get("/user", function(req,res) {
    User.find({})
    .then(function(dbProducts) {
      res.json(dbProducts);
    })
    .catch(function(err) {
      res.json(err);
    })
  });

app.listen(5000)