from sandbox import Sandbox

if __name__ == '__main__':
	pysand = Sandbox("/Users/ktheory/github/hacktx/server/question", "ktheory")
	code = '''
	while(1):
		pass'''
	print pysand.Run("Hello-World", code)

