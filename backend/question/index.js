var questions = [
	"QUESTIONS BRA",
	"Qs"
	];

module.exports.get = function () {
	return questions[Math.floor(Math.random() * questions.length)];
}