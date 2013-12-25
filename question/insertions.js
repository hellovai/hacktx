db.questions.insert({
	title:"Fizz Buzz"
	,folder:"Fizz-Buzz"
	,details:"Write a program that prints the numbers from 1 to N. But for multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”. For numbers which are multiples of both three and five print 'FizzBuzz'.<br >N will be provided vai stdin."
	,tags:["easy",]
	,level:1
	,random:Math.random()
})

db.questions.insert({
	title:"Hello World"
	,folder:"Hello-World"
	,details:"Write a program that reads a name from stdin and write 'Hello [name]!'"
	,tags:["easy",]
	,level:1
	,random:Math.random()
})

db.users.insert({
	"name":"John Doe"
	,"github":"awesomeness"
	,"points":9001
	,"questions": {
		"viewed":[]
		,"finished":[]
	}
	,"flairs":[]
})