var q = 'test';

var open = require('amqplib').connect({
    hostname: '106.15.40.167',
    port: '5672',
    username: 'admin',
    password: 'sfewcd123s'
});

function sleep(milliSeconds) {
    var StartTime = new Date().getTime();
    let i = 0;
    while (new Date().getTime() < StartTime + milliSeconds);

}

// Publisher
open.then(function (conn) {
    return conn.createChannel();
}).then(function (ch) {
    return ch.assertQueue(q).then(function (ok) {
        ch.sendToQueue(q, Buffer.from('stop'));
        return ch.sendToQueue(q, Buffer.from('something to do'));
    });
}).catch(console.warn);

// Consumer
open.then(function (conn) {
    return conn.createChannel();
}).then(function (ch) {
    return ch.assertQueue(q).then(function (ok) {
        return ch.consume(q, function (msg) {
            if (msg !== null) {
                console.log(msg.content.toString());
                if (msg.content.toString() == 'stop') {
                    sleep(5000)
                    console.log('finish stop');
                    ch.ack(msg);
                }else{
                    ch.ack(msg);
                }
            }
        });
    });
}).catch(console.warn);