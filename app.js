var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fs = require('fs');

var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');

var app = express();

if(!fs.existsSync(require('./config.json').storagePath)) {
  console.log("Wrong path specified to variable storagePath");
  process.exit(-1);
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger(':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'vault-session!@$#*',
  resave: false,
  saveUninitialized: true
 }));

app.use('/', indexRouter);
app.use('/upload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

if(!fs.existsSync('users.json')) fs.writeFileSync('users.json', "[]");

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
