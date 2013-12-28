config = {
	"secret":"ABCD12345DEF",
	"port":3000,
	"host":"localhost",
	"mongo": {
		"username":"username",
		"password":"password",
		"host":"localhost",
		"db":"prepairme"
	},
	"matching": {
		"critical":25,
		"decay":0.90,
		"threshhold": 0.80,
		"roomKeyLen": 10
	},
	"sandbox": {
		"basepath":"/Users/ktheory/github/hacktx/server/question",
		"user":"ktheory"
	},
	"question": {
		"critical":25,
		"decay":0.90,
		"threshhold": 0.80
	},
	"github": {
		"id":YOUR_ID,
		"secret":YOUR_SECRET,
		"repo":NOTNULL,
		"user":NOTNULL
	}
};

module.exports = config;