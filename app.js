var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');

var app = express();

//setup custom config
var config = require('./config');

//setup mongoose
mongoose.connect(config.mongodb.url);
app.db = mongoose.connection;
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function callback () {
  console.log('MongoDB connected.');
});

//config data models schema
require('./models')(app, mongoose);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//route requests
require('./routes')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//global locals
app.locals.projectName = config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = config.companyName;
app.locals.cacheBreaker = 'br34k-01';

http.createServer(app).listen(3000, function(){
    console.log('Express server lisening on port 3000');
});

module.exports = app;
