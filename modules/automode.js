module.exports = function(client, db) {
    function setMode(who, mode, channel) {
        client.send('MODE', channel, mode, who);
    };

    client.addListener('message', function (from, to, message) {
        if (!/^!op \w+/.test(message))
            return;

        var who = message.substr(4).trim();
        setMode(who, '+o', to);
    });

    client.addListener('message', function (from, to, message) {
        if (!/^!halfop \w+/.test(message))
            return;

        var who = message.substr(8).trim();
        setMode(who, '+h', to);
    });

    client.addListener('message', function (from, to, message) {
        if (!/^!deop \w+/.test(message))
            return;

        var who = message.substr(6).trim();
        setMode(who, '-o', to);
        setMode(who, '-h', to);
    });

    client.addListener('message', function (from, to, message) {
        if (!/^!voice \w+/.test(message))
            return;

        var who = message.substr(7).trim();
        setMode(who, '+v', to);
    });

    client.addListener('message', function (from, to, message) {
        if (!/^!unvoice \w+/.test(message))
            return;

        var who = message.substr(9).trim();
        setMode(who, '-v', to);
    });
};
