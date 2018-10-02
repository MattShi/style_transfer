from socket import *
import socket as skt
import os
import math
from random import *
import pickle
import time
from time import sleep
import thread
import hashlib
import signal

def handler(signum,frame):
	raise IOError

dval="""def my_handler(ip,port,filename,mss):
	print "started"
	signal.signal(signal.SIGALRM,handler)
	irtt=0.001
	diff=1
	print "executing"
	clientSocket = socket(AF_INET, SOCK_STREAM)
	clientSocket.connect((ip,port))
	f=open(filename,"rb")
	kt=len(f.read())
	segments=math.ceil(kt/500)
	f.seek(0)
	cont="ok"
	seqno=1
	m=hashlib.md5()
	cont=f.read(500)
	while cont:
		ic="ok2"
		#cont=""
		
		m.update(cont)
		s=m.hexdigest()
		s=s[-16:0]
		print cont
		header1=format(seqno,'032b')
		header2=s
		fl=0
		header3="0101010101010101"
		while fl==0:
			try:
				if seqno==segments:
					clientSocket.send(header1+header2+header3+cont+"e_c01")
				else:
					clientSocket.send(header1+header2+header3+cont)
				signal.alarm(irtt+diff/8)			
				reply=clientSocket.recv(64)
				rseq=reply[:16]
				rseq=int(rseq,2)
				if rseq==seqno:
					fl=1
			except IOError:
				diff*=1.5
				print "client timed out"
		signal.alarm(0)
		seqno+=1
		cont=f.read(500)
	print "finished transmitting"
"""

mss=500
filename="rfc5.txt"
serverlist = ['10.0.0.1','10.0.0.3']
signal.signal(signal.SIGALRM,handler)
serverPort = 12003 #default given port number
conarr=[]
for ip in serverlist:
	clientSocket = socket(AF_INET, SOCK_STREAM)
	clientSocket.connect((ip,serverPort))
	conarr.append(clientSocket)
fl2=0
print "starting transmission"
irtt=0.001
diff=1
print conarr
print "executing part"
#clientSocket = socket(AF_INET, SOCK_STREAM)
#clientSocket.connect((ip,port))
f=open(filename,"rb")
kt=len(f.read())
segments=math.ceil(kt/500)
f.seek(0)
while fl2==0:		
	cont="ok"
	seqno=1
	m=hashlib.md5()
	cont=f.read(500)
	while cont!="":
		#ic="ok2"
		#cont=""
		m.update(cont)
		s=m.hexdigest()
		s=s[0:-16]
		#print "hexdigest is ",s
		#print cont
		header1=format(seqno,'032b')
		header2=s
		
		header3="0101010101010101"
		for clientSocket in conarr:
			fl=0
			while fl==0:
				try:
					if seqno==segments+1:
						clientSocket.send(header1+header2+header3+cont+"e_c01")
						fl2=1
					else:
						clientSocket.send(header1+header2+header3+cont)
					tdtime=irtt+diff
					tdtime=int(tdtime)
					#print "alarm set for ",tdtime," seconds"
					signal.alarm(tdtime)	
					#print "waiting for reply"		
					reply=clientSocket.recv(64)
					rseq=reply[:32]
					rseq=int(rseq,2)
					if rseq==seqno:
						fl=1
						diff=max(1,diff-1)
				except IOError:
					diff=1
					print "client timed out"
			signal.alarm(0)
		seqno+=1
		cont=f.read(500)
		#print cont[:50]
	print "finished transmitting"





