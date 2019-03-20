var fs = require('fs');
var path = require("path")



class File {

    constructor(log) {

        this.index = 0;
        this.log = log;


    }

    _readFile(pathStr, fileBack, doneBack) {
        let then = this;
        fs.readFile(pathStr, { encoding: 'utf8' }, function (err, data) {
            then.index--;
            if (err) {
                data = "";
                then.log.error(err + " " + pathStr);
            }
            fileBack(data, pathStr);
            if (then.index == 0) {
                doneBack();
            }
        });
    };
    _walkDir(pathStr, fileBack, doneBack) {

        let then = this;

        fs.readdir(pathStr, function (err, files) {
            files.forEach(function (file) {
                if (fs.statSync(pathStr + '/' + file).isDirectory()) {
                    then._walkDir(pathStr + '/' + file, fileBack, doneBack);
                } else {
                    then.index++;
                    then._readFile(pathStr + '/' + file, fileBack, doneBack);
                    // then.log.info(pathStr + "/" + file);
                    return;
                }
            });
        });
    }
    walkDir(pathStr, fileBack, doneBack) {

        let then = this;


        then.index = 0;
        this._walkDir(pathStr, fileBack, doneBack);
    }


    mkDir(dirpath, mode, callback) {

        var then = this;
        fs.exists(dirpath, function (exists) {
            if (exists) {
                callback(dirpath);
            } else {
                //尝试创建父目录，然后再创建当前目录
                then.mkDir(path.dirname(dirpath), mode, function () {
                    fs.mkdir(dirpath, mode, callback);
                });
            }
        });
    };


    delDir(path) {

        var then = this;

        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    then.delDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };




    _readLines(input, line_callback, end_callback) {
        var remaining = '';
        input.on('data', function (data) {
            remaining += data;
            var index = remaining.indexOf('\n');
            while (index > -1) {
                var line = remaining.substring(0, index);
                remaining = remaining.substring(index + 1);
                line_callback(line);
                index = remaining.indexOf('\n');
            }

        });

        input.on('end', function () {

            end_callback(remaining);

        });
    }



    readLines(path, line_callback, end_callback) {

        var input = fs.createReadStream(path);
        this._readLines(input, line_callback, end_callback);
    }






}


module.exports = File;
