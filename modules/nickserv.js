module.exports = function(client, password) {
    if (!password)
        return;

    client.addListener('connect', function() {
        setTimeout(function() {
            client.say('NickServ', 'IDENTIFY ' + password);
        }, 2000);
    });
};
