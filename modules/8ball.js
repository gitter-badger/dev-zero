var messages = [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes definitely',
    'You may rely on it',
    'As I see it yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',

    'Reply hazy try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',

    'Don\'t count on it',
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful',

    'You are so full of shit'
];

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!8ball/.test(message))
            return;

        var n = Math.floor(Math.random() * messages.length);
        client.say(to, from + ': ' + messages[n]);
    });
};
