var mongojs = require('mongojs')
	, config = require('./config').mongo;

var databaseUrl = config.username + ":" + config.password + "@" + config.host + "/" + config.db;
// "username:password@example.com/mydb"

var collections = ["questions", "users"];
var db = mongojs.connect(databaseUrl, collections);

module.exports = db;

// What does a question look like?
// {
// 	"title":"Fizz Buzz"
// 	,"folder":"Fizz-Buzz"
// 	,"details":"Write a program that prints the numbers from 1 to 100. But for multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”. For numbers which are multiples of both three and five print 'FizzBuzz'."
// 	,"tags":["easy", "algorithm",]
// 	,"level":1
// 	,"random":Math.random()
// };

// What does a user look like?
// {
// 	"name":"John Doe"
// 	,"github":"awesomeness"
// 	,"points":9001
// 	,"questions": {
// 		"viewed":[]
// 		,"finished":[]
// 	}
// 	,"flairs":[]
// }
