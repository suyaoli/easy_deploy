var shell = require('shelljs');
var File = require('./file.class')


class Batch {


    constructor(log) {

        this.log = log;
        this.file = new File(this.log);



    }

    _exec(cmds, index, callback) {




        let then = this;



        if (index >= cmds.length) {


            then.log.info('finish');

            if (callback)
                callback();


        }




        var line = cmds[index];


        if (line) {






            if (line.indexOf('#') == 0) {


                then.log.info('note:' + line);
                index++;
                then._exec(cmds, index, callback);



            } else if (line.indexOf('{') == 0) {

                var file = line.substring(line.indexOf("{")+1, line.indexOf("}"));


                then.log.info('file:' + file);

                then.exec(file, callback);

                index++;

                then._exec(cmds, index, callback);


            } else {


                then.log.info('execute:' + line);

                var child = shell.exec(line, { silent: true }, function (code, stdout, stderr) {

                    if (code == 0) {



                        then.log.info('execute success');
                        index++;

                        then._exec(cmds, index, callback);


                    } else {

                        then.log.info('execute fail,error info:' + stderr.trim());
                        index++;
                        // then._exec(cmds, index, callback);

                        return;
                    }

                });

                child.stdout.on('data', function (data) {

                    then.log.info('output:' + data.trim());


                });




            }

        }



    }

    exec(batch_path, callback) {

        let then = this;

        var cmds = [];

        this.file.readLines(batch_path, function (line) {

            if (line.trim().length == 0) {

                return;
            }

            if (line) {


                cmds.push(line);


            }


        }, function (line) {

            if (line) {


                cmds.push(line);


            }

            then.log.info('load cmds:');
            then.log.info(cmds);


            then._exec(cmds, 0, callback);


        });

    }








}




module.exports = Batch;
