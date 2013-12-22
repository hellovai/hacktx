config = {
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
		"threshhold": 0.80
	},
	"sandbox": {
		"basepath":"/Users/ktheory/github/hacktx/server/question",
		"user":"ktheory"
	},
	"question": {
		"critical":25,
		"decay":0.90,
		"threshhold": 0.80
	}
};

module.exports = config;