var Client = require('ssh2').Client;

class Ssh {


    constructor(host, port, username, password, log) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.log = log;
        this.client=new Client();
       


    }

    _connect(){

        this.client.connect({

            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password

        });
    }

    exec(cmd){

        var then=this;

        this.client.on('ready', function() {

            then.client.exec(cmd, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(code, signal) {
                  then.log.info('finish, code: ' + code);
                  then.client.end();
                }).on('data', function(data) {
                  then.log.info(' '+ data);
                }).stderr.on('data', function(data) {
                  then.log.info(' '+data);
                });
              });

        });
        this._connect();


    }




}


module.exports = Ssh;
