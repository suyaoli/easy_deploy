var Dictionary = require('../common/dictionary.class');
var File = require('../common/file.class');
var fs = require('fs');
var path = require("path")


class Build {

    constructor(config_file_path, src_path, dist_path, log4js) {

        this.dictionary = new Dictionary(config_file_path, log4js);
        this.src_path = src_path;
        this.dist_path = dist_path;
        this.file = new File(log4js);
        this.log = log4js;
        this.index = 0;

    }

    extract_config(overwrite = 0) {
        let then = this;

        if (!overwrite) {

            then.dictionary.loadFile(this.config_file_path);
        }



        this.file.walkDir(this.src_path, function (data) {
            if (!!data) {
                var match = data.match(/\{[a-zA-Z0-9_]+\}/g);
                if (!!match) {
                    match.forEach(function (mat) {
                        then.dictionary.set(mat);
                    })
                }
            }
        }, function () {
            then.log.info('提取配置 OK');
            then.dictionary.save2File();
        });



    }


    _rename_filename(file_path, callback) {

        let then = this;


        var match = file_path.match(/\{[a-zA-Z0-9_]+\}/g);
        if (!!match) {
            match.map(function (mat) {

                var value = then.dictionary.get(mat);
                file_path = file_path.replace(mat, value)
            });

        }

        callback(file_path);


    }





    replace_config() {

        let then = this;

        then.dictionary.loadFile(function () {
            then.file.walkDir(then.src_path, function (data, pathStr) {

                then.log.info(pathStr);

                var match = data.match(/\{[a-zA-Z0-9_]+\}/g);
                var distpath = pathStr.replace(then.src_path, then.dist_path);

                then._rename_filename(distpath, function (distpath) {

                    if (!!match) {
                        var filter_matchs = [];
                        match.forEach(function (mat) {

                            filter_matchs.push(mat);


                        });


                        filter_matchs.map(function (mat) {

                            var value = then.dictionary.get(mat);
                            data = data.replace(mat, value)
                            then.log.info(pathStr + " replace " + mat + " to " + value);
                        });


                    }

                    then.file.mkDir(path.dirname(distpath), 777, function () {
                        fs.writeFile(distpath, data, { encoding: 'utf8', flag: 'w' }, function (err) {
                            if (err) throw err;
                        });
                    });

                });






            }, function () {
                then.log.info('配置替换 OK');
            })
        });

    }

    

};




module.exports = Build;