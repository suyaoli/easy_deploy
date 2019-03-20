var fs = require('fs');
var File = require('./file.class');
var path = require("path")




class Dictionary {


  constructor(logPath, log) {
    this.logPath = logPath;
    this.map = [];
    this.log = log;
    this.file = new File(log);
  }

  set(key, val) {

    //this.map[key]=val || '';
    var items = this.map.find(item => {

      return item.key == key;

    });

    if (!items) {

      this.log.info('find config:' + key);

      this.map.push({ key: key, value: (val || '') });

    }
  }

  get(key) {

    var item = this.map.find(item => {

      return item.key == key;

    });

    if (item != undefined) {
      return item.value;
    } else {

      return '';
    }

  }

  save2File() {

    let then = this;

    this.file.mkDir(path.dirname(then.logPath), 777, function () {
      fs.writeFile(then.logPath, JSON.stringify(then.map).replace(/"},{"/g, '"},\r\n{"'), { encoding: 'utf8', flag: 'w' }, function (err) {
        if (err) throw err;
      });
    });


  }

  loadFile(callback) {
    let then = this;

    fs.exists(this.logPath, function (exists) {

      if (exists) {

        fs.readFile(then.logPath, { encoding: 'utf8' }, function (err, data) {
          try {
            then.map = JSON.parse(data);
            if (callback) {
              callback();
            }
          } catch (error) {

            then.log.error(error);

          }

        });
      }
    });


  }
}


module.exports = Dictionary;

