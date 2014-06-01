var http = require('http');
var irc = require('irc');

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

		  		//This is a very hacky way for checking the secret. Maybe replace it with some kind of regex / string split?
		  		var secret = req.url.substr(1, config.hooksecret.length);
		  		var service = req.url.substr(config.hooksecret.length + 2, 6);
		  		var reponame = req.url.substr(config.hooksecret.length + 9);
		  		if(secret != config.hooksecret){
	            	res.writeHead(403, {'Content-Type': 'text/plain'})
	  				res.end('Invalid secret\n');
	  				return;
		  		}
			try {
	        	    var data = JSON.parse(decodeURIComponent(body.substr(8)));
                        } catch(e) { console.log(e); return; }

	        	if(service == "github"){
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
		        	}
	        	}
	        });
    	}else{
	  		res.writeHead(405, {'Content-Type': 'text/plain'});
	  		res.end('Method not allowed\n');
    	}
	}).listen(config.commithookport, "0.0.0.0");
};
