import os
import json
from runner import Runner

class Sandbox(object):
	"""runs code in a sandbox for a question""" 

	def __init__(self, basepath, runuser):
		super(Sandbox, self).__init__()
		self.__basepath__ = basepath
		self.__runner__ = Runner()
		self.__runner__.confine(runuser)

	def Run(self, question, code):
		direc = os.path.join(self.__basepath__, question)
		if not os.path.exists(direc):
			return json.dumps({'status':-1,'error':'Question not found!'})
		ctr = [0, 0]
		result = []
		for files in os.listdir(direc):
			if files.endswith(".in"):
				answerfile = files[0:-3] + ".ans"
				inputData = open( os.path.join(direc, files), 'r')
				outputData = open( os.path.join(direc, answerfile), 'r')
				data = self.__runner__.Run( code, inputData.read(), outputData.read() )
				print data
				result.append(data)
				inputData.close()
				outputData.close()
				if 'error' not in data:
					ctr[0] = ctr[0] + 1
				ctr[1] = ctr[1] + 1
	
		return json.dumps({
			'status': ctr[0] == ctr[1]
			,'info': ctr
			,'data': result
			})
