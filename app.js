var express = require("express");
var app = express();
var db = require('./db');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  }));

app.use(express.static(__dirname + '/view'));

var AuthController = require('./auth/AuthController');
app.use('/', AuthController);

module.exports = app;