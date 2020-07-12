var express = require('express');
var router = express.Router();

const authMiddleware = require('./auth');
const { token } = require('morgan');
const { storagePath } = require('../config.json');
const path = require('path');
const filesize = require('filesize');
const moment = require('moment');
router.use('/mkdir', authMiddleware);
router.use('/download', authMiddleware);
router.use('/delete', authMiddleware);
router.use('/deletedir', authMiddleware);
router.use('/rename', authMiddleware);
function GetDirectoryInfo(pos) {
  var fs = require('fs');
  var filelist = [];
  if(pos === undefined || pos === "") {
    var files = fs.readdirSync(storagePath);
    for(var i in files)
    {
      var fileinfo = fs.lstatSync(storagePath + files[i]);
      if(fileinfo.isDirectory())
      {
        filelist.push({name: files[i], isFolder: true});
      }
      else 
      {
        filelist.push({name: files[i], isFolder: false, size: filesize(fileinfo.size), lastModified: moment(fileinfo.mtime).locale('ko').fromNow()});
      }
    }
  }
  else {
    var files = fs.readdirSync(storagePath + pos);
    for(var i in files)
    {
      var fileinfo = fs.lstatSync(storagePath + pos + "/" + files[i]);
      if(fileinfo.isDirectory())
      {
        filelist.push({name: files[i], isFolder: true});
      }
      else 
      {
        filelist.push({name: files[i], isFolder: false, size: filesize(fileinfo.size), lastModified: moment(fileinfo.mtime).locale('ko').fromNow()});
      }
    }
  }
  return filelist;
}

router.get('/login', function(req, res, next) {
  var fs = require('fs');
  if(req.query.retry === true)
  {
    res.render('login', {isRetry: true});
  }
  else 
  {
    res.render('login', {isRetry: false});
  }
});



router.get('/logout', function(req, res, next) {
  if(req.session) req.session.destroy(() => res.redirect('/login'));
});

router.get('/signup', function(req, res, next) {
  var fs = require('fs');
  if(req.query.retry === true)
  {
    res.render('signup', {isRetry: true});
  }
  else 
  {
    res.render('signup', {isRetry: false});
  }
});

router.post('/signup', function(req, res, next) {
  var fs = require('fs');
  var users = require('../users.json');
  if(users.find(user => user.username === req.body.username)) return res.redirect('/signup?retry=true');
  var crypto = require('crypto');
  crypto.pbkdf2(req.body.password, "bA+VjJVGTmBHLAV/U6USzkDsLeOW9feqW1HuRzK7lOlMn+0JVhSCE9s1JnTggklKGHSYLmv1TIEnyNAqBBhecA==", 100000, 64, 'sha512', (err, key) => {
    users.push({ username: req.body.username, password: key.toString('base64') });
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.redirect('/login');
  });
});

router.post('/login', function(req, res, next) {
  var fs = require('fs');
  var users = require('../users.json');
  var crypto = require('crypto');
  var jwt = require('jsonwebtoken');
  var user = users.find(user => user.username === req.body.username);
  var session = req.session;
  if(!user) return res.redirect('/login?retry=true');
  crypto.pbkdf2(req.body.password, "bA+VjJVGTmBHLAV/U6USzkDsLeOW9feqW1HuRzK7lOlMn+0JVhSCE9s1JnTggklKGHSYLmv1TIEnyNAqBBhecA==", 100000, 64, 'sha512', (err, key) => {
    if(user.password === key.toString('base64')) {
      jwt.sign({
        username: user.username
      },
      "vault-secret",
      {
        expiresIn: '7d',
        issuer: 'velopert.com',
        subject: 'userInfo'
    }, (err, token) => {
        if (err) return console.log(err);
        session.token = token;
        return res.redirect('/');
    });
    } 
    else {
      return res.redirect('/login?retry=true');
    }
  });
});

router.get('/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  if(req.query.pos == undefined || req.query.pos == "/") req.query.pos = "";
  else if(req.query.pos.startsWith("../")) return res.redirect('/?pos=/');
  var jwt = require('jsonwebtoken');
  jwt.verify(req.session.token, "vault-secret", (err, decoded) => {
    if(err) return res.redirect('/login');
    res.render('index', {data: GetDirectoryInfo(req.query.pos), position: req.query.pos + "/", username: decoded.username});
  })
});

router.get('/download/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var path = require('path');
  var file = req.query.pos;
  var filepath = storagePath  + file;
  res.download(filepath);
});

router.get('/back/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var path = require('path');
  req.query.path = req.query.path.replace('\\', '/');
  var paths = req.query.path.split('/');
  var newpath = "/";
  for(var i = 0; i < paths.length - 1; i++)
  {
    if(i > 1) newpath += '/';
    newpath += paths[i];
  }
  if(newpath === "/") res.redirect('/');
  else res.redirect("/?pos=" + newpath);
});

router.post('/mkdir/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  fs.mkdirSync(storagePath + req.body.path, {recursive: true});
  res.redirect(req.get('referer'));
});

router.post('/rename/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  fs.renameSync(storagePath + req.body.path, path.join(storagePath + req.body.newname));
  res.redirect(req.get('referer'));
});

router.get('/delete/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  var file = req.query.pos;
  fs.unlinkSync(storagePath + file);
  res.redirect(req.get('referer'));
});

router.get('/deletedir/', function(req, res, next) {
  if(!req.session.token) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  var pos = req.query.pos;
  deleteFolderRecursive(storagePath + pos);
  res.redirect(req.get('referer'));
});

var deleteFolderRecursive = function(pos) {
  var fs = require('fs');
  var path = require('path');
  if (fs.existsSync(pos)) {
    fs.readdirSync(pos).forEach((file, index) => {
      var curPath = path.join(pos, file);
      if (fs.lstatSync(curPath).isDirectory()) { 
        deleteFolderRecursive(curPath);
      } else { 
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pos);
  }
};

module.exports = router;
