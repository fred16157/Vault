var express = require('express');
var router = express.Router();

function GetDirectoryInfo() {
  var fs = require('fs');
  var files = fs.readdirSync('storage/');
  for(var i in files)
  {
    console.log(files[i]);
  }
  return { files };
}

router.get('/', function(req, res, next) {
  res.render('index', {data: GetDirectoryInfo()});
});

router.get('/download/:id', function(req, res) {
  var path = require('path');
  var file = req.params.id;
  var filepath = path.join(__dirname, '../storage/' + file);
  res.download(filepath);
});

router.get('/delete/:id', function(req, res) {
  var fs = require('fs');
  var path = require('path');
  var file = req.params.id;
  fs.unlinkSync(path.join(__dirname, "../storage/" + file));
  res.redirect('/');
});


module.exports = router;
