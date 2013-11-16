import sys
import glob
from subprocess import Popen, PIPE
import json

def main(pid, code):
	problem = "./question/data/" + str(int(pid))
	code = str(code)
	result = []
	for item in glob.glob(problem + "/*.in"):
		with open(item,'r') as inf:
			(stdout, stderr) = Popen(["python", "run_sandbox.py", code],stdout=PIPE,stdin=inf).communicate()
			output = open(item.replace(".in", ".ans"),'r').read()
			data = {
				"status": stdout == output,
				"output": stdout,
				"input": open(item,'r').read()
			}
			result.append(data);
	return json.dumps(result)

if __name__ == '__main__':
	if len(sys.argv) != 3:
		data = {
			"error":"Not valid config"
		}
		print json.dumps(data)
		quit()
	print main(sys.argv[1], sys.argv[2])
		# print item
