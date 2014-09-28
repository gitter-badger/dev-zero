var http = require('http');

module.exports = function(client) {
    client.addListener('message', function(from, to, message) {
        if (!/^!mappings/.test(message))
            return;
        
        try{
            var options = {method: 'HEAD', host: 'mcpbot.bspk.rs', port: 80, path: '/testcsv/params.csv'};
            var req = http.request(options, function(res) {
                var modified = new Date(Date.parse(res.headers['last-modified']));
                var current = new Date();
                client.say(to, from + ": Mappings have been updated " + secondsToTimeString((current.getTime() - modified.getTime()) / 1000) + " ago");
            });
            req.end();
        }catch(e){
            client.say(to, from + ": The testcsv server looks down from here. Try again later");
        }
    });
};

function secondsToTimeString(secs) {
    var hours   = Math.floor(secs / 3600);
    var minutes = Math.floor((secs - (hours * 3600)) / 60);
    var seconds = Math.floor(secs - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}
