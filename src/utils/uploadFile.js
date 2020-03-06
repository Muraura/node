const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

module.exports = function uploadFile(req, result) {
    console.log(req.files);
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {

        if (err) {
            result(err, null);
        }

        const oldpath = files.filetoupload.path;
        const newpath = path.join(__dirname, '..', 'uploads', files.filetoupload.name);

        fs.rename(oldpath, newpath, (err) => {

            if (err) {
                result(err, null);
            }

            result(null, {
                message: "Success"
            });
        });
    });
}