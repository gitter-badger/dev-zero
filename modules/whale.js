module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/!whale( [0-9]{1,2})?/.test(message))
            return;

        var length = 5;
        if (message.indexOf(' ') >= 0)
            length = parseInt(message.split(' ')[1]);

        var whale = '-';

        for (var i=0; i<length; ++i)
            whale += '_';

        whale += '-';

        client.say(to, whale);
    });
};
