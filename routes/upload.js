var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var { storagePath } = require('../config.json');

const authMiddleware = require('./auth');
router.use('/create', authMiddleware);

router.post('/create', function (req, res, next) {
    var singleFile;
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        var fileArry = files.file_input;

        for (i = 0; i < fileArry.length; i++) {
            newPath = path.join(storagePath + fields.path[0]);
            singleFile = fileArry[i];
            newPath += singleFile.originalFilename;
            readAndWriteFile(singleFile, newPath);
        }
        res.redirect('/?pos=' + fields.path[0]);
    });
});

function readAndWriteFile(singleFile, newPath) {
    fs.readFile(singleFile.path, (err, data) => {
        fs.writeFile(newPath, data, (err) => {
            console.log("File uploaded to: " + newPath);
        });
    });
}

module.exports = router;