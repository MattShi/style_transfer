from socket import *
import os
import pickle
import thread
from threading import Thread
from time import sleep
import datetime
from random import *

def set_my_dir(folder):
        if os.getcwd()!="/home":
                os.chdir("/home")
        if not os.path.exists(folder):
                os.mkdir(folder)
        os.chdir("/home/"+folder+"/")
        return 1
        
class storer:
        def storeobj(self,des_file,obj_list):
                output = open(des_file, 'w')
                pickle.dump(obj_list,output)
                output.close()

        def retobj(self,des_file):
                pkl_file=open(des_file,'rb')
                data=pickle.load(pkl_file)
                pkl_file.close()
                return data
        
        def cstream(self,obj):
                pkl_file=open("temp",'wb+')
                pickle.dump(obj,pkl_file)
                pkl_file.close()
                output = open("temp", 'r')
                return output.read()

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

def dec():
        s1=storer()
        olist=s1.retobj("peerindex")
        for x in range(len(olist)):
                olist[x][3]-=1
        s.wrobj(olist)
        
p_index,c_list=load()

def writer():
        s=storer()
        while 1:
                sleep(60)
                print "saving objects"
                s.storeobj("peerindex",p_index)
                s.storeobj("cookie",c_list)
                
def change():
	t=0
        while 1:
                print ". - . "+str(t)
		t+=1
                if len(p_index)==0:
                        sleep(2)
                else:
                        to_remove=[]
                        for x in range(len(p_index)):
                                if p_index[x][3]<=0:
                                        to_remove.append(x)
                                else:
                                        p_index[x][3]=p_index[x][3]-1
                        for x in to_remove:
                                p_index.remove(x)
                        sleep(2)

serverPort = 12003
serverSocket = socket(AF_INET,SOCK_STREAM)
serverSocket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
s=storer()
#thread.start_new_thread(change,())
try:
   thread.start_new_thread(change,())
except:
   print "Error: unable to start thread"
print "starting server"
serverSocket.bind(('10.0.0.2',serverPort))
serverSocket.listen(1)
set_my_dir("server")
if c_list==-1:
        p_index=[]
        c_list=[]
print "load completed"
print 'The server is ready to receive'
while 1:
        connectionSocket, addr = serverSocket.accept()
        sentence = connectionSocket.recv(1024)
        print sentence
        #print addr
        if "cookie" not in sentence:
		#print sentence[sentence.find("port: ")+5:sentence.find("host")-1]
                p3=int(sentence[sentence.find("port: ")+5:])
                hostname=sentence[sentence.find(":")+1:sentence.find("port")-1]
                #print "connected to" + hostname
                print "client doesn't have cookie"
                x=randint(1,1000)
                flag=True
                while flag:
                        if x in c_list:
                                x=randint(1,1000)
                        flag=False
                c_list.append(x)
                print "sent "+str(x)+ " to client"
                connectionSocket.send(str(x))
                timestamp=datetime.datetime.now()
                temp=[addr[0],x,1,7200,p3,1,timestamp]
                p_index.append(temp)
                print p_index
        elif "voided" in sentence:
		print ""
	else:
                p2=sentence.find("cookie: ")
                cookie = int(sentence[p2+7:])
                l=len(p_index)
                if "leave" in sentence:
                        for x in range(l):
                                if p_index[x][1]==cookie:
                                        p_index[x][2]=0
                        connectionSocket.send("OK")
                elif "keepalive" in sentence:
                        l=len(p_index)
                        for x in range(l):
                                if p_index[x][1]==cookie:
                                        p_index[x][3]=7200
                                        p_index[x][5]+=1
                                        p_index[x][6]=datetime.datetime.now()
                        connectionSocket.send("OK")
                elif "query" in sentence:
                        c_list=[]
                        for x in range(l):
                                if p_index[x][1]==cookie:
                                        p_index[x][5]+=1
                                        p_index[x][6]=datetime.datetime.now()
                        for x in p_index:
                                if x[2]!=0:
                                        c_list.append(x)
                        connectionSocket.send(s.cstream(c_list))
		else:
                        print "client has cookie"
                print p_index                    
        connectionSocket.close()


