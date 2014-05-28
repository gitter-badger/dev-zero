var google = require('google');

google.resultsPerPage = 1;

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!g /.test(message))
            return;

        var term = message.substring(3);

        google(term, function(err, next, links) {
            var item = links[0];

            client.say(to, item.title + ' - ' + item.link);
        });
    });
};
