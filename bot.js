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

require('./modules/nickserv.js')(client, config.nickserv);

require('./modules/whale.js')(client, db);
require('./modules/8ball.js')(client, db);
require('./modules/urbandictionary.js')(client, db);
require('./modules/google.js')(client, db);
require('./modules/flirt.js')(client, db);
require('./modules/equip.js')(client, db);
require('./modules/timer.js')(client, db);
require('./modules/commithook.js')(client, config);
require('./modules/mcpmappings.js')(client);
