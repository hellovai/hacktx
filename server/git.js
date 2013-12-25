var github = require('octonode')
	, qs = require('querystring')
	, config = require('./config').github;


var auth_url = github.auth.config({
  id: config.id,
  secret: config.secret
}).login(['user', 'repo']);

var state = auth_url.match(/&state=([0-9a-z]{32})/i);

function login (data, res) {
	var values = qs.parse(data);
    // Check against CSRF attacks
    if (!state || state[1] != values.state) {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      res.end('Not Allowed ' + state + ' ' + state[1] + ' ' + values.state );
    } else {
      github.auth.login(values.code, function (err, token) {
        res.statusCode = 200;
        res.type('text/plain');
        res.cookie('mycookie', token);
        res.end("<body onLoad=\"window.open('', '_self', '');window.close();\">"+ token +"</body>");
    	});
	}
}


module.exports.login = login;
module.exports.auth_url = auth_url;