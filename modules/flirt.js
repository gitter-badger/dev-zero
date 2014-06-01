var messages = [
    'Pardon me miss, I seem to have lost my phone number, could I borrow yours?',
    'You\'re like a candy bar: half sweet and half nuts.',
    'I lost my teddy bear, will you sleep with me instead?',
    'If I could rearrange the alphabet, I\'d put U and I together.',
    'Are your legs tired? Because you\'ve been running through my mind all day.',
    'Is it hot in here? Or is it just you?'
];

var fs = require('fs');

module.exports = function(client, db) {
    var messages = fs.readFileSync('flirts', 'utf-8').toString().split('\n');

    client.addListener('message', function(from, to, message) {
        if (!/^!flirt (\w)+/.test(message))
            return;

        var name = message.substring(7);

        var n = Math.floor(Math.random() * messages.length);
        client.say(to, from + ' ' + messages[n].replace('%s', name));
    });
};
