var globals = require('../globals');

var python = require('node-python');
os = python.import('os'),
sysp = python.import('sys'),
cwd = os.getcwd(),
sysp.path.append(cwd + "/question");
var runner = python.import('run_wrapper')

var questions = [
{
	"title":"Pairs",
	"details":"Given N integers [N<=10^5], count the total pairs of integers that have a difference of K. [K>0 and K< 1e9]. Each of the N integers will be greater than 0 and at least K away from 2^31-1 (Everything can be done with 32 bit integers)."
},
{
	"title":"FizzBuzz",
	"details":"Write a program that prints the integers from 1 to 100. But for multiples of three print 'Fizz' instead of the number and for the multiples of five print 'Buzz'. For numbers which are multiples of both three and five print 'FizzBuzz'.",
},
{
        "title":"Color RGB Int to Hex",
        "details":"Given three integers rgb, output hexadecimal representation as a string.",
},
{
        "title":"Emulate a MOS 6502 CPU",
        "details":"The challenge is to write your own 6502 CPU emulator. This involves, of course, understanding it's instruction set and it's encoding format. Resources are linked at the bottom of this. The 6502 is one of the easiest real-world processors to emulate. For the purposes of this challenge, you won't need to worry about cycle timing if you don't want to -- but that's always a plus to include!",
},
{
        "title":"Implement division using only addition",
        "details":"What this means is basically: addition is the only operator or function allowed that operates on numbers and returns other numbers (i.e. no subtraction, multiplication, exponentiation, bitwise inversion, etc.). Stuff like if statements, assignment and comparison operators, and for loops are still allowed, provided that within those, you still only use addition.",
},
{
        "title":"Reverse stdin and place on stdout",
        "details":"Take an input on stdin including new lines / carriage returns of unlimited length (only bounded by system memory; that is, there is no inherent limit in the program.) Output the reverse of the input on stdout.",
},
{
        "title":"Build the busiest beaver in x86 machine code in 32 bytes or less",
        "details":"Your task is to write a program in x86 machine language (any version you like) that will run through as many instructions as possible and then halt, using a maximum of 32 bytes of code and starting with zeroed-out registers.",
},
];
var users = globals.users;

module.exports.get = function () {
	return Math.floor(Math.random() * questions.length);
}

module.exports.getByIndex = function(index) {
	return questions[index];
}

module.exports.run = function(socket, code) {
	if(socket.qid >= 0 && socket.qid < questions.length) {
		console.log("SUBMITTING");
		var result = runner.main(socket.qid, code);
		console.log("DONE");
		socket.emit('runRes', result, true);
		if(socket.pid != -1)
			users[socket.pid].emit('runRes', result, false);
	}
}
