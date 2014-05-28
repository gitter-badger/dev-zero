var config = require('./config.json');

var irc = require('irc');
var client = new irc.Client(config.server, config.nick, {
    channels: config.channels,
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});

var Datastore = require('nedb');
var db = new Datastore({ filename: config.datafile, autoload: true });

require('./modules/whale.js')(client, db);
