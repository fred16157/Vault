var express = require('express');
var router = express.Router();

function GetDirectoryInfo(pos) {
  var fs = require('fs');
  var filelist = [];
  if(pos === undefined || pos === "") {
    var files = fs.readdirSync('storage/');
    for(var i in files)
    {
      if(fs.lstatSync('storage/'+ files[i]).isDirectory())
      {
        filelist.push({name: files[i], isFolder: true});
      }
      else 
      {
        filelist.push({name: files[i], isFolder: false});
      }
    }
  }
  else {
    var files = fs.readdirSync('storage' + pos);
    for(var i in files)
    {
      if(fs.lstatSync('storage' + pos + "/" + files[i]).isDirectory())
      {
        filelist.push({name: files[i], isFolder: true});
      }
      else 
      {
        filelist.push({name: files[i], isFolder: false});
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

router.post('/login', function(req, res, next) {
  var fs = require('fs');
  var users = require('../users.json');
  var crypto = require('crypto');
  var user = users.find(user => user.username === req.body.username);
  var session = req.session;
  if(!user) return res.redirect('/login?retry=true');
  crypto.pbkdf2(req.body.password, "bA+VjJVGTmBHLAV/U6USzkDsLeOW9feqW1HuRzK7lOlMn+0JVhSCE9s1JnTggklKGHSYLmv1TIEnyNAqBBhecA==", 100000, 64, 'sha512', (err, key) => {
    if(user.password === key.toString('base64'))
    {
      session.username = user.username;
      return res.redirect('/');
    } 
    else 
    {
      return res.redirect('/login?retry=true');
    }
  });
});

router.get('/logout', function(req, res, next) {
  var fs = require('fs');
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

router.get('/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  if(req.query.pos == undefined || req.query.pos == "/") req.query.pos = "";
  res.render('index', {data: GetDirectoryInfo(req.query.pos), position: req.query.pos + "/", username: req.session.username});
});

router.get('/download/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var path = require('path');
  var file = req.query.pos;
  var filepath = path.join(__dirname, '../storage/' + file);
  res.download(filepath);
});

router.get('/back/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var path = require('path');
  var paths = req.query.path.split('/');
  var newpath = "/";
  for(var i = 0; i < paths.length - 1; i++)
  {
    if(i > 1) newpath += '/';
    newpath += paths[i];
  }
  if(newpath === "/") res.redirect('/');
  else res.redirect("/?pos=" + path.normalize(newpath).replace('\\', '/'));
});

router.post('/mkdir/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  
  fs.mkdirSync(path.join(__dirname, "../storage" + req.body.path), {recursive: true});
  res.redirect(req.get('referer'));
});

router.post('/rename/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  fs.renameSync(path.join(__dirname, "../storage" + req.body.path), path.join(__dirname, "../storage" + req.body.newname));
  res.redirect(req.get('referer'));
});

router.get('/delete/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  var file = req.query.pos;
  fs.unlinkSync(path.join(__dirname, "../storage/" + file));
  res.redirect(req.get('referer'));
});

router.get('/deletedir/', function(req, res, next) {
  if(!req.session.username) return res.redirect('/login');
  var fs = require('fs');
  var path = require('path');
  var pos = req.query.pos;
  deleteFolderRecursive(path.join(__dirname, "../storage/" + pos));
  res.redirect(req.get('referer'));
});

var deleteFolderRecursive = function(pos) {
  var fs = require('fs');
  var path = require('path');
  if (fs.existsSync(pos)) {
    fs.readdirSync(pos).forEach((file, index) => {
      var curPath = path.join(pos, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pos);
  }
};

module.exports = router;
