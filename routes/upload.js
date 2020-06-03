var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname,"../storage/"));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });

router.get("/show", function(req, res, next) {
    res.render('upload');
});

router.post('/create', upload.single('FileInput'), function(req, res, next) {
    var file = req.file;
    var result = {
        FileName: file.originalname,
        Size: file.size,
    }

    res.redirect('/');
});

module.exports = router;