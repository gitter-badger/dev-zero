var players = {};

module.exports = function(client, db) {
    client.addListener('message', function(from, to, message) {
        if (!/^!equip /.test(message))
            return;

        var weapon = message.substr(7);
        players[from] = weapon

        client.say(to, from + ' equips ' + weapon);
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
