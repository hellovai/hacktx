import argparse
import numpy.random as nprnd
import math

def get_array(length, max_val = 1000, sort = False):
	array = nprnd.randint(max_val, size=length)
	if sort:
		array.sort()
	return array

def get_integer(max_val = 1e25):
	return nprnd.randint(max_val)

def get_num(number):
	return number

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Create input test case files')
	parser.add_argument('number', metavar='N', type=int, default=1,
										help='total number to generate')
	parser.add_argument('--max', type=int, default=1000,
										help='largest possible number')

	parser.add_argument('--array', type=int,
                   help='max length of array')
	
	parser.add_argument('--equal', action='store_const', const=True, default=False,
										help='equal number of items in each array')
	
	parser.add_argument('--no_print_length', dest='allow_print', action='store_const',
										const=False, default=True,
										help='do not print length of array')
	
	parser.add_argument('--sorted', action='store_const',
                   const=True, default=False,
                   help='sort output array')

	args = parser.parse_args()
	N = args.number
	max_num = args.max

	if args.array:
		print N
		get_len = get_integer
		if args.equal:
			get_len = get_num

		for _ in xrange(0, N):
			A = get_array( get_len(args.array) + 1, max_val=max_num, sort=args.sorted )
			if args.allow_print:
				print len(A), 
			for a in A:
				print a,
			print ""
	else:
		if args.allow_print:
			print N
		for _ in xrange(0, N):
			print get_integer(max_val=max_num)