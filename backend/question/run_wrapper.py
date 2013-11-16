import sys, os
import glob
from subprocess import Popen, PIPE
import json

def main(pid, code):
	print pid, code
	problem = os.path.dirname(os.path.realpath(__file__)) + "/data/" + str(int(pid))
	result = []
	command = "./question/run_sandbox.py '" + code + "'".replace('\n', '\\n').replace('\t', '  ')
	for item in glob.glob(problem + "/*.in"):
		with open(item,'r') as inf:
			proc = Popen(command, stdout=PIPE,stdin=inf, shell=True)
			(stdout, stderr) = proc.communicate()
			output = open(item.replace(".in", ".ans"),'r').read()
			data = {
				"status": stdout == output,
				"output": stdout,
				"stderr": stderr,
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
