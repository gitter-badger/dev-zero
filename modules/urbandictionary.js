var http = require('http');

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!ud (\w)+/.test(message))
            return;

        var term = encodeURIComponent(message.substring(4));

        http.get({ host: 'api.urbandictionary.com',
                   port: 80,
                   path: '/v0/tooltip?term=' + term },
            function(req) {
                req.on('data', function(chunk) {
                    try {
                        data = JSON.parse(chunk);

                        var output = data.string.split('\n')[6];
                        output = decodeURIComponent(output);
                        output = output.replace(/<(\/)?b>/g, '');
                        output = output.replace(/&#39;/g, '\'');
                        output = output.replace(/&quot;/g, '"');
                        output = output.replace(/&amp;/g, '&');
                        output = output.replace(/<br\/>/g, '\n');

                        client.say(to, message.substring(4) + ':' + output);

                        client.say(to, 'http://www.urbandictionary.com/define.php?term=' + term);
                    } catch (e) {
                        client.say(to, message.substring(4) + ' is not defined.');
                    }
                });
            }
        );
    });
};
