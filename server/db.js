var mongojs = require('mongojs')
	, config = require('./config').mongo;

var databaseUrl = config.username + ":" + config.password + "@" + config.host + "/" + config.db;
// "username:password@example.com/mydb"

var collections = ["questions"];
var db = mongojs.connect(databaseUrl, collections);

module.exports = db;