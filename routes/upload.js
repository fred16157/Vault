var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');

router.post('/create', function (req, res, next) {
    var singleFile;
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        var fileArry = files.file_input;

        for (i = 0; i < fileArry.length; i++) {
            newPath = path.join(__dirname.replace('routes', '') + "/storage" + fields.path[0]);
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
            console.log("File uploaded to  :" + newPath);
        });
    });
}

module.exports = router;