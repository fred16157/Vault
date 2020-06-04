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

router.get('/', function(req, res, next) {
  if(req.query.pos == undefined || req.query.pos == "/") req.query.pos = "";
  res.render('index', {data: GetDirectoryInfo(req.query.pos), position: req.query.pos + "/"});
});

router.get('/download/', function(req, res) {
  var path = require('path');
  var file = req.query.pos;
  var filepath = path.join(__dirname, '../storage/' + file);
  res.download(filepath);
});

router.get('/back/', function(req, res) {
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

router.post('/mkdir/', function(req, res) {
  var fs = require('fs');
  var path = require('path');
  
  fs.mkdirSync(path.join(__dirname, "../storage" + req.body.path), {recursive: true});
  res.redirect(req.get('referer'));
});

router.post('/rename/', function(req, res) {
  var fs = require('fs');
  fs.renameSync(req.query.path, req.query.newpath);
});

router.get('/delete/', function(req, res) {
  var fs = require('fs');
  var path = require('path');
  var file = req.query.pos;
  fs.unlinkSync(path.join(__dirname, "../storage/" + file));
  res.redirect('/');
});

router.get('/deletedir/', function(req, res) {
  var fs = require('fs');
  var path = require('path');
  var pos = req.query.pos;
  deleteFolderRecursive(path.join(__dirname, "../storage/" + pos));
  res.redirect(req.get('referer'));
});

var deleteFolderRecursive = function(path) {
  var fs = require('fs');
  var path = require('path');
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      var curPath = path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = router;
