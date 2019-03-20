var Client = require('ssh2-sftp-client');
var File = require('./file.class');
var path = require("path")


class Upload {

    constructor(host, port, username, password, log) {


        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.log = log;
        this.file = new File(log);
        this.sftp = new Client();
        this.conn = this.sftp.connect({
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password
        });


    }


    _putDir(index, remote_dir_list, callback) {

        let then = this;

        var remote_dir = remote_dir_list[index];


        then.mkDir(remote_dir, function () {


            index++;

            if (index >= remote_dir_list.length) {

                callback();
            } else {

                then._putDir(index, remote_dir_list, callback);
            }


        });

    }

    _put(index, local_file_list, localPath, remotePath, callback) {

        let then = this;

        var local_file_path = local_file_list[index];


        var remote_file_path = local_file_path.replace(localPath, remotePath);

        then.put(local_file_path, remote_file_path, function () {

            index++;

            if (index >= local_file_list.length) {

                callback();

            } else {

                then._put(index, local_file_list, localPath, remotePath, callback);
            }


        });

    }

    putDir(localPath, remotePath, exclude, include) {

        let then = this;

        var local_file_list = [];

        var remote_dir_list = [];

        then.log.info('extract local path...')



        then.file.walkDir(localPath, function (data, local_file_path) {



            if (include != null) {

                var include_items = include.find(item => {

                    return local_file_path.indexOf(item) != -1;

                });

                if (include_items) {

                    local_file_list.push(local_file_path);
                    then.log.info(local_file_path);


                } else {

                    return;
                }
            }else if (exclude != null && include == null) {

                var exclude_items = exclude.find(item => {

                    return local_file_path.indexOf(item) != -1;


                });

                if (!exclude_items) {

                    local_file_list.push(local_file_path);

                    then.log.info(local_file_path);

                } else {

                    return;
                }
            }else{

                local_file_list.push(local_file_path);


            }






            var remote_file_path = local_file_path.replace(localPath, remotePath);


            var remote_dir = path.dirname(remote_file_path);


            var items = remote_dir_list.find(item => {

                return item == remote_dir;

            });

            if (!items) {
                remote_dir_list.push(remote_dir);

            }






        }, function () {

            then.log.info('upload to remote ...')

            if (remote_dir_list.length > 0) {


                then._putDir(0, remote_dir_list, function () {

                    then._put(0, local_file_list, localPath, remotePath, function () {

                        then.log.info("finish upload");
                        then.sftp.end();


                    });


                });
            } else {

                then.log.info("not find any files");
                then.sftp.end();


            }

        });



    }


    mkDir(remotePath, callback) {

        let then = this;
        this.conn.then(() => {
            return then.sftp.mkdir(remotePath, true);
        }).then(() => {
            // then.log.info("upload success");
            then.log.info('mkdir ' + remotePath + ' success');
            callback();
        }).catch((err) => {
            //then.log.error(err);
            then.log.info('dir ' + remotePath + ' has exists');
            callback();

        });
    };





    put(localPath, remotePath, callback) {
        let then = this;
        this.conn.then(() => {
            return then.sftp.put(localPath, remotePath);
        }).then(() => {
            then.log.info(remotePath + " upload success");
            callback();
        }).catch((err) => {
            then.log.error(err);
        });
    }

    list(path) {


        let then = this;

        this.conn.then(() => {
            return then.sftp.list(path);
        }).then((data) => {
            then.log.info(data);
        }).catch((err) => {
            then.log.error(err);
        });



    }

}

module.exports = Upload;
