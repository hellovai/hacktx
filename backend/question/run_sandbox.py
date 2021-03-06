#!/usr/bin/env python

import sys
from sandbox import Sandbox, SandboxConfig
import json
# import exceptions

if __name__ == "__main__":
	'''
	Will run a given code in sandbox (stream stdio from cmd)
	arg[1] = code given
	to run
	python run_python_secure.py <code>  < inputfile 
	'''
	if len(sys.argv) != 2:
		print "Not enough args"
		print sys.argv
		sys.exit()
	args = sys.argv
	code = sys.argv[1]
	try:
		sandbox = Sandbox(SandboxConfig('stdin','stdout'))
		sandbox.execute(code)
	except Exception, e:
		sys.stderr.write(e)
		# if(type(e) == exceptions.MemoryError):
		# 	print "Out of memory error"
		# else:
		# 	print e