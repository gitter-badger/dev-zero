var http = require('http');
var irc = require('irc');
var crypto = require('crypto');

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
		  		res.writeHead(200, {'Content-Type': 'text/plain'});
		  		res.end('OK\n');

		  		var sentSecret = req.headers['x-hub-signature'].substr(5);
		  		var realSecret = crypto.createHmac('sha1', config.hooksecret).update(body).digest('hex');

		  		if(sentSecret != realSecret){
	            	res.writeHead(403, {'Content-Type': 'text/plain'})
	  				res.end('Invalid secret\n');
	  				return;
		  		}

		  		var service = req.url.substr(1, 6);
		  		var reponame = req.url.substr(8);

	        	if(service == "github"){
	        		var data;
	        		if(req.headers['content-type'] == "application/json"){
	        			data = JSON.parse(body);
	        		}else{
						try{
			        	    data = JSON.parse(decodeURIComponent(body.substr(8)));
		                }catch(e){ console.log(e); return; }
	        		}
		        	var e = req.headers['x-github-event'];
					
		        	if(e == "push"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.pusher.name);
			        	str = str + " pushed " + irc.colors.wrap('gray', data.commits.length);
			        	str = str + " commit";
			        	if(data.commits.length != 1){
			        		str = str + "s";
			        	}
			        	str = str + " to ";
			        	str = str + irc.colors.wrap('light_red', data.ref.substr(11)) + " ";
			        	str = str + data.compare;
			        	client.say("#server", str);

			        	for(var i = 0; i < data.commits.length; i++){
			        		var c = data.commits[i];
			        		str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        		str = str + irc.colors.wrap('cyan', c.committer.name) + " ";
			        		str = str + irc.colors.wrap('orange', c.id.substr(0, 7)) + " - " + c.message.replace(/\+/g, ' ');
			        		client.say("#server", str);
			        	}
		        	}else if(e == "ping"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ') + irc.colors.wrap('cyan', '[GitHub] ') + data.zen;
			        	client.say("#server", str);
		        	}else if(e == "issues"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action + ' issue ' + irc.colors.wrap('orange', '#' + data.issue.number) + ': ' + data.issue.title + ' - ' + data.issue.html_url;
			        	client.say("#server", str);
		        	}else if(e == "issue_comment"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' commented on issue ' + irc.colors.wrap('orange', '#' + data.issue.number) + ': ' + data.issue.title + ' - ' + data.comment.html_url;
			        	client.say("#server", str);
		        	}else if(e == "commit_comment"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' commented on commit ' + irc.colors.wrap('orange', data.commit_id.substr(0, 7)) + ' - ' + data.comment.html_url;
			        	client.say("#server", str);
		        	}else if(e == "create"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' created ' + data.ref_type;
			        	if(data['ref']){
			        		str = str + ' ' + irc.colors.wrap('orange', data.ref);
			        	}
			        	str = str + ' - ' + data.repository.url;
			        	client.say("#server", str);
		        	}else if(e == "delete"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' deleted ' + data.ref_type + ' ' + irc.colors.wrap('orange', data.ref) + ' - ' + data.repository.html_url;
			        	client.say("#server", str);
		        	}else if(e == "pull_request"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action ' pull request ' + irc.colors.wrap('orange', '#' + data.num) + ': ' + data.title + ' - ' + data.pull_request.html_url;
			        	client.say("#server", str);
		        	}else if(e == "pull_request_review_comment"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' reviewed pull request ' + irc.colors.wrap('orange', '#' + data.num) + ' commit - ' + data.comment.html_url;
			        	client.say("#server", str);
		        	}else if(e == "gollum"){
			        	client.say("#server", "Someone updated a wiki. I don't know how to format this yet. Please go bug jk-5 about this");
		        	}else if(e == "watch"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' starred ' + irc.colors.wrap('cyan', data.repository.name) + ' - ' + data.sender.html_url;
			        	client.say("#server", str);
		        	}else if(e == "release"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' ' + data.action + ' ' + irc.colors.wrap('cyan', data.release.tag_name + ' | ' + data.release.name) + ' - ' + data.release.html_url;
			        	client.say("#server", str);
		        	}else if(e == "fork"){
			        	var str = irc.colors.wrap('gray', '[' + reponame + '] ');
			        	str = str + irc.colors.wrap('cyan', data.sender.login) + ' forked the repository - ' + data.forkee.owner.html_url;
			        	client.say("#server", str);
		        	}
	        	}
	        });
    	}else{
	  		res.writeHead(405, {'Content-Type': 'text/plain'});
	  		res.end('Method not allowed\n');
    	}
	}).listen(config.commithookport, "0.0.0.0");
};
