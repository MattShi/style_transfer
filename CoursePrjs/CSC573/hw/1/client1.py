from socket import *
import pickle

serverName = 'localhost'
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
clientSocket.close()



#######################################################################################
#peer  class, two part 1)peer client, for down stream
#                      2)peer server for up stream

TASK_TYPE_REGISTER = 1
TASK_TYPE_LEAVE = 2
TASK_TYPE_PQUERY = 3
TASK_TYPE_KEEPALIVE = 4
TASK_TYPE_RFCQUERY = 5

import socket
import threading
import thread
import p2pfileoper
import messageoper
import time

class P2pPeer:
    #######################################################
    #need register server ip addrs and port
    def __init__(self , serverport, serverhost):
        self.rserverport = int(serverport)
        self.rserverhost = serverhost
        self.dpeerlist = {}
        self.tasklist = []

    def __initconn(self):
        self.localhost = socket.gethostname()
        self.socketconn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # for network and connectness

    #################################################################
    #run client, 1st, thread for conn register server
    #            2nd, thread for local up stream server ,waite for conn
    def run(self):
        self.conregisterserver()
        self.runlocalserver()

    ##################################################################
    #looping for dealing with register server
    #register flow : 1 c->rserver: server returns a port ;
    #                2 server listen on the port and c connect to the port
    #                3 exchange msg
    ##################################################################

    ###################################################################
    #1)conn register server
    def conregisterserver(self):
        rsock = socket.socket(AF_INET, SOCK_STREAM)
        try:
            rsock.connect((self.serverhost, self.serverport))
            self.connport = int(rsock.rev(512))
        finally:
            rsock.close()
        thread.start_new_thread(self.run_registerserver, (self.rserverhost,self.connport))

    #######################################################################
    #implement the register server ,like register ,leave,heartbeat(keep alive) and  query peer list
    def run_registerserver(self,connhost,connport):
        rsock = socket.socket(AF_INET, SOCK_STREAM)
        rsock.connect((connhost, connport))
        while self.exit != True:
            if len(self.tasklist) > 0:
                if self.tasklist[0] == TASK_TYPE_REGISTER:
                    #do register
                    rqmsg = messageoper().build_register_req(connport)
                    rsock.send(rqmsg)
                    rtdata = self.recv_timeout(rsock)
                    datamsg = messageoper().analysis_msg(rtdata)
                    if datamsg[messageoper().DEF_P2P_OPCODE] != 200:
                        #debug
                    del self.tasklist[0]
                elif self.tasklist[0] == TASK_TYPE_LEAVE:
                    #do leave
                    rqmsg = messageoper().build_leave_req(connport)
                    rsock.send(rqmsg)
                    rtdata = self.recv_timeout(rsock)
                    datamsg = messageoper().analysis_msg(rtdata)
                    if datamsg[messageoper().DEF_P2P_OPCODE] != 200:
                        #debug
                    del self.tasklist[0]
                elif self.tasklist[0] == TASK_TYPE_PQUERY:
                    #do query
                    rqmsg = messageoper().build_pquery_req(connport)
                    rsock.send(rqmsg)
                    rtdata = self.recv_timeout(rsock)
                    datamsg = messageoper().analysis_msg(rtdata)
                    if datamsg[messageoper().DEF_P2P_OPCODE] != 200:
                        #debug
                    else:
                        #analysis peer list and start to connect
                    del self.tasklist[0]
                elif self.tasklist[0] == TASK_TYPE_KEEPALIVE:
                    # do keep alive
                    rqmsg = messageoper().build_keepalive_req(connport)
                    rsock.send(rqmsg)
                    rtdata = self.recv_timeout(rsock)
                    datamsg = messageoper().analysis_msg(rtdata)
                    if datamsg[messageoper().DEF_P2P_OPCODE] != 200:
                        # debug
                    del self.tasklist[0]

    ###########################################################################
    #waite for data till time out
    def recv_timeout(connsocket, timeout = 2):
        connsocket.setblocking(0)
        total_data = []
        data = ''
        begin = time.time()
        while 1:
            if total_data and time.time() - begin > timeout:
                break
            elif time.time() - begin > timeout * 2:
                break
            try:
                data = connsocket.recv(8192)
                if data:
                    total_data.append(data)
                    begin = time.time()
                else:
                    time.sleep(0.1)
            except:
                pass
        return ''.join(total_data)

    #####################################################################
    # upload data till finish or exit ,more than 1
    def run_upstream(self,localport):
        try:
            ussock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            ussock.bind((ussock.gethostname(), localport))
            ussock.listen(2)
            usconn, remoteaddr = ussock.accept()
            fpath = "1.txt"  # finish this later
            foper = p2pfileoper(fpath)
            bfinished = False
            while self.exit != True or bfinished == True:
                data = foper.readdata()
                ussock.send(data)
        finally:
            foper.close()
            ussock.close()

    #####################################################################
    #download data till finish or exit ,more than 1
    def run_downstream(self,remotehost,remoteport):
        fpath = "1.txt"  # finish this later
        foper = p2pfileoper(fpath)
        #get channel port 1st ,remoteport is for public ,not for streaming
        connport = self.getdownstreamingport(remotehost,remoteport)
        try:
            dssock = socket.socket(AF_INET, SOCK_STREAM)
            dssock.connect((remotehost, connport))
            bfinishall = False
            while self.exit != True or  bfinishall == True:
                data = self.recv_timeout(dssock)
                foper.writedata(data)

        finally:
            dssock.close()
            foper.close()

    ########################################################################
    #get port for streaming
    def getdownstreamingport(self,remotehost,remoteport):
        try:
            sock = socket.socket(AF_INET, SOCK_STREAM)
            sock.connect((remotehost, remoteport))
            data = self.recv_timeout(sock)
        finally:
            sock.close()
        return int(data)

    ########################################################################
    def runlocalserver(self):
        thread.start_new_thread(self.run_upstreamserver, (12000))#finish this later

    ####################################################################
    #server in peer ,waite for conn from other peers
    #within this part, it will return a local port to the remote, and waite for conn on that port
    def run_upstreamserver(self,localport):
        try:
            lssock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            lssock.bind((lssock.gethostname(), localport))
            lssock.listen(2)
            while self.exit != True:
                usconn, remoteaddr = lssock.accept()
                tmpport = 11313 #finish it later
                lssock.send(tmpport)
        finally:
            lssock.close()