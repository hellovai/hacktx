import workerpool
import urllib2
import os
from bs4 import BeautifulSoup
import json
import random

url = "http://projecteuler.net/problem="
base = "../server/question/"
maxCtr = 454 # 454

def ToSeoFriendly(s, maxlen):
    t = '-'.join(s.split())                                # join words with dashes
    u = ''.join([c for c in t if c.isalnum() or c=='-'])   # remove punctation   
    return u[:maxlen].rstrip('-').lower()                  # clip to maxlen

def mkDir(data):
  if not os.path.exists(base + data["folder"]):
    os.makedirs(base + data["folder"])
  f = open(data["folder"] + '.q', 'w')
  f.write( json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')) )
  f.close()
  print data["title"]

def getQuestion(addr):
   html = urllib2.urlopen( addr ).read()
   soup = BeautifulSoup( html )
   for tag in soup.find_all( "div", { "id" : "content" } ):
      title = tag.find('h2').getText()
      content = tag.find_all("div", {"class": "problem_content"})[0]
      innerhtml = "".join([str(x) for x in content.contents])
      folder = ToSeoFriendly(title, 30)
      data = {
         "title": title,
         "folder": folder,
         "details": innerhtml.replace('\n','').replace('\r',''),
         "tags":[],
         "level": 1,
         "random": random.random()
      }
      mkDir(data)

if __name__ == '__main__':
  pool = workerpool.WorkerPool(size=5)
  jobs = [url + str(x) for x in xrange(1,maxCtr)]
  pool.map(getQuestion, jobs)
  pool.shutdown()
  pool.wait()
