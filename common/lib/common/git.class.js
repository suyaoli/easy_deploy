const SimpleGit = require('simple-git');
var File = require('./file.class');



class Git {



    constructor(user, pass, log) {


        this.log = log;
        this.user = user;
        this.pass = pass;
        this.file = new File(log);


    }



    clone(repo, local_path,callback) {

        let then = this;
        const remote = `https://${this.user}:${this.pass}@${repo}`;

        console.log(remote);


        this.file.mkDir(local_path, 777, function () {
            SimpleGit()
                .clone(remote, local_path, function () {


                    then.log.info('clone finished');

                    callback(local_path);

                });

        });

    }

    checkout(local_path,params){

        let then = this;

        SimpleGit(local_path).checkout(params,function(){

            then.log.info('checkout branch '+params+' finished');

        });




    }


    pull(local_path){


        let then = this;

        SimpleGit(local_path).pull(function(){

            then.log.info('pull finished');

        });

    }


}


module.exports = Git;
