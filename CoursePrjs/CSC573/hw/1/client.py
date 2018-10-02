from socket import *
import socket as skt
import os
from random import *
import pickle
import time
from time import sleep
import thread
#s=storer()
def create_srequest():
	t=randint(60000,60100)
	message="redirect port :"+str(t)
	return message,t

class creator:
        def create_first(self,hostname,portnum):
                hname = "hostname: "+hostname
                port = "port: "+str(portnum)
                return hname+port
        def create_request(self,hostname,cookie=None,option=None):
                hname = "hostname: "+hostname
                if cookie==None:
                        rtype = " rtype: "+"register"
                        return hname+rtype
                if option == 1:
                        rtype = " rtype: "+"leave"
                elif option == 2:
                        rtype = " rtype: "+"query"
                elif option == 3:
                        rtype = " rtype: "+"keepalive"
                else:
                        rtype=" rtype: invalid option passed"
                cookie = " cookie: "+str(cookie)
                return hname+rtype+cookie
        

def cload():
	s=storer() #print "cload just executed"
	if os.path.isfile("rfc_list"):
		l=s.retobj("rfc_list")
	else:
		l=-1
		t=[]
		s.storeobj("rfc_file",t)
	return l

rfc_list=[]

def change():
	s2=socket(AF_INET,SOCK_DGRAM)
	s2.connect(("10.0.0.1",80))
	ip=s2.getsockname()[0]
        while 1:
                #print "working\n"
                if len(rfc_list)==0:
                        sleep(2)
                else:
                        to_remove=[]
                        h_name=ip
                        for x in range(len(rfc_list)):
                                if rfc_list[x][2]<=0:
                                        to_remove.append(x)
                                else:
                                        if rfc_list[x][1]!=h_name:
                                                rfc_list[x][2]=rfc_list[x][2]-1
                        for x in to_remove:
                                rfc_list.remove(x)
                        sleep(2)
def handler(portno):
        serverPort = int(portno)
        serverSocket = socket(AF_INET,SOCK_STREAM)
        serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        serverSocket.bind(('',serverPort))
        serverSocket.listen(1)
	s=storer()
        connectionSocket, addr = serverSocket.accept()
        sentence = connectionSocket.recv(1024)
        while "exit" not in sentence:
                if "query" in sentence:
			oly=s.retobj("rfc_list")
			print oly
			print "creating object stream"
			print len(s.cstream(oly))
                        connectionSocket.send(s.cstream(rfc_list))
                elif "get" in sentence:
                        filename = sentence[sentence.find("get")+3:]
                        r=open("./rfc_files/"+filename)
                        cont = r.read(1024)
                        while (cont):
				connectionSocket.send(cont)
				cont = r.read(1024)
                                print "sent a chunk"
			connectionSocket.send(cont)	                        
			r.close()
			print "file transfer completed on my side"
			#sleep(0.1)
                        connectionSocket.send("file exit_code completed")
                sentence = connectionSocket.recv(1024)
		print sentence
	#print "closing socket"
	connectionSocket.close()
        print "socket closed"
	return

def updater():
	s2=socket(AF_INET,SOCK_DGRAM)
	s2.connect(("10.0.0.1",80))
	ip=s2.getsockname()[0]
        while 1:
		print "executing updater"
                sleep(21)
                for f in os.listdir("./rfc_files"):
                        if [f,ip,7200] not in rfc_list:
                                rfc_list.append([f,ip,7200])

def writer():
        s=storer()
        while 1:
                sleep(19.1)
		print "wrote objects",rfc_list
                print "saving objects"
                s.storeobj("rfc_list",rfc_list)

def my_server(portnum,rfc_list=[]):
        serverPort = portnum #should be between 65400-65500
        serverSocket = socket(AF_INET,SOCK_STREAM)
        serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        t=cload()
        if t==-1:
                set_my_dir("cscommon")
                os.mkdir("rfc_files")
                c=0
                for f in os.listdir("./rfc_files"):
                        rfc_list.append([f,socket.gethostname(),7200])
        else:
                print "previous configuration found, loading....."
                rfc_list=t
        
        thread.start_new_thread(writer,())
	thread.start_new_thread(updater,())
        thread.start_new_thread(change,())
        serverSocket.bind(('',serverPort))
        serverSocket.listen(1)
        print "load completed"
        print 'The server is ready to receive'
        while 1:
                connectionSocket, addr = serverSocket.accept()
                sentence,newport=create_srequest()
                connectionSocket.send(sentence)
                thread.start_new_thread(handler,(newport,))
                connectionSocket.close()

def set_my_dir(folder):
        if os.getcwd()!="/home/shub/":
                os.chdir("/home/shub/")
        if not os.path.exists(folder):
                os.mkdir(folder)
        os.chdir("/home/shub/"+folder+"/")
        return 1

class storer:
        def storeobj(self,des_file,obj_list):
                output = open(des_file, 'wb')
                pickle.dump(obj_list,output)
                output.close()

        def retobj(self,des_file):
                pkl_file=open(des_file,'rb+')
                data=pickle.load(pkl_file)
                pkl_file.close()
                return data
            
        def cstream(self,obj):
                pkl_file=open("temp",'wb+')
                pickle.dump(obj,pkl_file)
                pkl_file.close()
                output = open("temp", 'r')
                x = output.read()
		output.close()
		return x

def load():
    s=storer()
    if os.path.isfile("peerindex"):
        t=s.retobj("peerindex")
        d=s.retobj("cookie")
    else:
        t=[]
        d=-1
        s.storeobj("peerindex",t)
        s.storeobj("cookie",d)
    return t,d

hostname=skt.gethostname()
c1 = creator()
s=storer()
set_my_dir("cscommon")
index,cookie = load()
while 1:
        op = raw_input("enter 1 to contact registration server, 2 to contact peers")
        #op=int(op)
        if op =="1":
                serverName = '10.0.0.2' #public well known name
                serverPort = 12003 #default given port number
                clientSocket = socket(AF_INET, SOCK_STREAM)
                clientSocket.connect((serverName,serverPort))
                if cookie==-1:
                        pno = randint(65400,65500)
                        thread.start_new_thread(my_server,(pno,rfc_list,))
                        request = c1.create_first(hostname,pno)
                        clientSocket.send(request)
                        cookie = clientSocket.recv(1024)
                        print cookie
                        s.storeobj("cookie",int(cookie))
                        print "auto-registered"
                else:
                        op1=raw_input("1.Leave,2.Query,3.Keep-alive")
                        #op1=int(op1)
                        request="empty"
                        if op1=="1":
                                request = c1.create_request(hostname,cookie,1)
                                clientSocket.send(request)
                                reply = clientSocket.recv(1024)
                                print reply
                        elif op1=="2":
                                request = c1.create_request(hostname,cookie,2)
                                clientSocket.send(request)
                                reply = clientSocket.recv(4096)
                                f=open("temp","wb")
                                f.write(reply)
                                f.close()
                                peerlist=s.retobj("temp")
                                j=0
                                for x in peerlist:
                                        if x not in index:
                                                j+=1
                                                index.append(x)
                                print "fetched "+str(j)+" objects\n"
                        elif op1=="3":
                                request = c1.create_request(hostname,cookie,3)
                                clientSocket.send(request)
                                reply = clientSocket.recv(1024)
                                print reply
			else:
				clientSocket.send("cookie: voided")
				print rfc_list
				print index
                comment_1="""f=open("temp","w")
                f.write(reply)
                s.retobj("temp")"""
                clientSocket.close()
        elif op=="2":
		bt=0
                filename=raw_input("type the number of the rfc file (ex:1234):\n")
                filename="rfc"+filename+".txt"
		for x in index:
			if index[0]==filename:
				bt=1
		if bt==1:
			break
                for x in index:
			#print x 
			flg2=0
                        serverName = x[0] #public well known name
                        serverPort = x[4] #default given port number
                        clientSocket = socket(AF_INET, SOCK_STREAM)
			#print serverName,serverPort
                        clientSocket.connect((serverName,serverPort))
                        reply=clientSocket.recv(1024)
                        clientSocket.close()
                        start=reply.find(":")
                        rport=int(reply[start+1:])
                        serverPort = rport
                        sleep(0.1)
			print serverName, serverPort
			clientSocket = socket(AF_INET, SOCK_STREAM)
                        clientSocket.connect((serverName,serverPort))
			print "connection success"
                        clientSocket.send("query:"+filename)
                        oblist=clientSocket.recv(4096)
			print "objects fetched",oblist
                        f=open("temp2",'wb')
                        f.write(oblist)
                        f.close()
                        oblist=s.retobj("temp2")
                        #rfc_list=s.retobj("rfc_list")
                        rfc_list+=oblist
                        s.storeobj("rfc_list",rfc_list)
                        flg=0
                        for x in rfc_list:
				print filename,x[0]
                                if x[0]==filename and flg==0:
					print filename
                                        clientSocket.send("get "+filename)
                                        f=open(filename,"wb")
                                        flg=1
					flg2=1
                                        while True:
                                                data=clientSocket.recv(1024)
                                                if not data:
                                                        break
						if "exit_code" in data:
							clientSocket.send("exit-ed")
							clientSocket.close()
							print "closing file"
                                        		f.close()
							break
                                                f.write(data)
				if flg==1:
					print "entered this part"
	                        	break					
                	if flg2==1:
				break
			else:
				print "File not found"
	else:
		print "invalid output"

p="""serverName = 'localhost'
serverPort = 12003
clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect((serverName,serverPort))
l=[]
sentence=[1,2,3,4,5,6]
f=open("ftemp","wb+")
pickle.dump(sentence,f)
f.close()
f=open("ftemp","rb+")
t=f.read()
clientSocket.send(t)
#modifiedSentence = clientSocket.recv(1024)
#print 'From Server:', modifiedSentence
clientSocket.close()"""




