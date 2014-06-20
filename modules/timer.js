var timers = [];

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!timer in /.test(message))
            return;

        message = message.substr(10);

        var time = 0;
        if (message.indexOf('h') > -1) {
            var value = message.substr(0, message.indexOf('h'));
            time += parseInt(value) * 3600;

            message = message.substr(message.indexOf('h') + 1);
        }

        if (message.indexOf('m') > -1) {
            var value = message.substr(0, message.indexOf('m'));
            time += parseInt(value) * 60;
        
            message = message.substr(message.indexOf('m') + 1);
        }

        if (message.indexOf('s') > -1) {
            var value = message.substr(0, message.indexOf('s'));
            time += parseInt(value);

            message = message.substr(message.indexOf('s') + 1);
        }

        message = message.trim();

        timers.push(setTimeout(function() {
            client.say(to, 'Timeout: ' + message);
        }, time * 1000));

        client.say(to, 'Set timer for ' + time + 's with label "' + message + '"');
    });
};
