var messages = [
    'Pardon me miss, I seem to have lost my phone number, could I borrow yours?',
    'You’re like a candy bar: half sweet and half nuts.',
    'I lost my teddy bear, will you sleep with me instead?',
    'If I could rearrange the alphabet, I\'d put U and I together.',
    'Are your legs tired? Because you\'ve been running through my mind all day.',
    'Is it hot in here? Or is it just you?'
];

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!flirt/.test(message))
            return;

        var n = Math.floor(Math.random() * messages.length);
        client.say(to, from + ': ' + messages[n]);
    });
};
