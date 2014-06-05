var http = require('http');
var irc = require('irc');
var crypto = require('crypto');
var querystring = require('querystring');

module.exports = function(client, config) {
    http.createServer(function (req, res) {
        if(req.method == "POST"){
            var body = '';
            req.on('data', function(data){
                body += data;
                //In case of very big data, kill the request so it won't kill us
                if(body.length > 1e6){ 
                    res.writeHead(413, {'Content-Type': 'text/plain'})
                    res.end('Request entity too large\n');
                    req.connection.destroy();
                }
            });
            req.on('end', function(){
                try{
                    var service = req.url.substr(1, 6);
                    var reponame = req.url.substr(8);
                    if(service == "github"){

                        var sentSecret = req.headers['x-hub-signature'].substr(5);
                        var realSecret = crypto.createHmac('sha1', config.hooksecret).update(body).digest('hex');

                        if(sentSecret != realSecret){
                            res.writeHead(403, {'Content-Type': 'text/plain'})
                            res.end('Invalid secret\n');
                            return;
                        }

                        var data;
                        if(req.headers['content-type'] == "application/json"){
                            data = JSON.parse(body);
                        }else{
                            res.writeHead(400, {'Content-Type': 'text/plain'});
                            res.end('Please use application/json as the content type on GitHub.\n');
                        }
                        var e = req.headers['x-github-event'];
                        
                        if(e == "push"){
                            shortenUrl(data.compare, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.pusher.name);
                                str = str + " pushed " + irc.colors.wrap('gray', data.commits.length);
                                str = str + " commit";
                                if(data.commits.length != 1){
                                    str = str + "s";
                                }
                                str = str + " to ";
                                str = str + irc.colors.wrap('light_red', data.ref.substr(11)) + " ";
                                str = str + shortened;
                                client.say("#server", str);

                                for(var i = 0; i < data.commits.length; i++){
                                    var c = data.commits[i];
                                    str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                    str = str + irc.colors.wrap('cyan', c.committer.name) + " ";
                                    str = str + irc.colors.wrap('orange', c.id.substr(0, 7)) + " - " + c.message;
                                    client.say("#server", str);
                                }
                            });
                        }else if(e == "ping"){
                            var str = irc.colors.wrap('gray', '[' + reponame + '] ') + irc.colors.wrap('cyan', '[GitHub] ') + data.zen;
                            client.say("#server", str);
                        }else if(e == "issues"){
                            shortenUrl(data.issue.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action + ' issue ' + irc.colors.wrap('orange', '#' + data.issue.number) + ': ' + data.issue.title + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "issue_comment"){
                            shortenUrl(data.comment.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' commented on issue ' + irc.colors.wrap('orange', '#' + data.issue.number) + ': ' + data.issue.title + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "commit_comment"){
                            shortenUrl(data.comment.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' commented on commit ' + irc.colors.wrap('orange', data.comment.commit_id.substr(0, 7)) + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "create"){
                            shortenUrl(data.repository.url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' created ' + data.ref_type;
                                if(data['ref']){
                                    str = str + ' ' + irc.colors.wrap('orange', data.ref);
                                }
                                str = str + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "delete"){
                            shortenUrl(data.repository.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' deleted ' + data.ref_type + ' ' + irc.colors.wrap('orange', data.ref) + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "pull_request"){
                            shortenUrl(data.pull_request.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action + ' pull request ' + irc.colors.wrap('orange', '#' + data.num) + ': ' + data.title + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "pull_request_review_comment"){
                            shortenUrl(data.comment.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' reviewed pull request ' + irc.colors.wrap('orange', '#' + data.num) + ' commit - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "gollum"){
                            client.say("#server", "Someone updated a wiki. I don't know how to format this yet. Please go bug jk-5 about this");
                        }else if(e == "watch"){
                            shortenUrl(data.sender.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' starred ' + irc.colors.wrap('cyan', data.repository.name) + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "release"){
                            shortenUrl(data.release.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action + ' ' + irc.colors.wrap('cyan', data.release.tag_name + ' | ' + data.release.name) + ' - ' + shortened;
                                client.say("#server", str);
                            });
                        }else if(e == "fork"){
                            shortenUrl(data.forkee.owner.html_url, function(shortened){
                                var str = irc.colors.wrap('gray', '[' + reponame + '] ');
                                str = str + irc.colors.wrap('cyan', data.sender.login) + ' forked the repository - ' + shortened;
                                client.say("#server", str);
                            });
                        }
                    }
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('OK\n');
                }catch(e){
                    console.error("Error while processing commithook:");
                    console.error(e);

                    res.writeHead(500, {'Content-Type': 'text/plain'})
                    res.end('Internal Server Error. See the log for details\n');
                }
            });
        }else{
            res.writeHead(405, {'Content-Type': 'text/plain'});
            res.end('Method not allowed\n');
        }
    }).listen(config.commithookport, "0.0.0.0");
};

function shortenUrl(url, callback){
    var done = false;
    try{
        var data = querystring.stringify({
            'url': url
        });
        var options = {
            host: 'git.io',
            port: '80',
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };
        var req = http.request(options, function(res){
            console.log(res.statusCode);
            done = true;
            if(res.statusCode == 100) return;
            if(res.statusCode != 201){ //Something is wrong. Return the old url
                callback(url);
            }else{
                callback(res.headers.location);
            }
        });
        req.on('socket', function(socket){
            socket.setTimeout(4000); //Use a short socket timeout for fast messages when something derps up.
            socket.on('timeout', function(){
                req.abort();
                if(!done) callback(url);
            })
        })
        req.write(data);
        req.end();
    }catch(e){
        if(!done) callback(url);
    }
}
