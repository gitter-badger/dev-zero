var players = {};

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!equip /.test(message))
            return;

        players[from] = message.substr(7);
    });

    client.addListener('message', function(from, to, message) {
        if (!/^!attack /.test(message))
            return;

        var damage = Math.round(Math.random() * 20 + 5);
        var who = message.substr(8);
        var weapon = players[from];

        client.say(to, from + ' attacks ' + who + ' with ' + weapon + ' for ' + damage + ' points of damage');
    })
};
