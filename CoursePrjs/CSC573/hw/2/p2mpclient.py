#p2mp client

from socket import *
from ackmessages import ackmessages
from debuglog import debuglog

import sys
import threading
import fileoperator
import socket
import datetime
import os

class p2mpclient:
    def __init__(self,serverlist,port,filepath,mss):
        self.serverslist = serverlist
        self.port = int(port)
        self.MSS = int(mss)
        self.filepath = filepath
        self.conneachServers()


    def conneachServers(self):
        try:
            for info in self.serverslist:
                connthread =  transThread((info, self.port), self.filepath, self.MSS)
                connthread.start();

        except:
            debuglog().log("Error: unable to start thread")


class transThread (threading.Thread):
    def __init__(self, serverinfo,filepath,mss):
        threading.Thread.__init__(self)
        self.serverinfo = serverinfo
        self.fpath = filepath
        self.mss = mss
        self.foper = fileoperator.fileOperator(filepath, mss, "rb")

    def run(self):
        udpsk = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        udpsk.connect(self.serverinfo)
        udpsk.settimeout(1)

        nnextseqnum = 0
        bresend = False
        bfinish = False
        bskip = False
        bprinttime = True

        debuglog.logtime("client start file " + self.fpath + str(datetime.datetime.now()))

        while bfinish != True:

            if bresend == False:
                msg = self.foper.read()

            bresend = False#reset

            if len(msg) == 0:
                bfinish = True

            try:
                ackmsg = ackmessages().generateackmsg(nnextseqnum)
                udpsk.sendto(ackmsg + msg, self.serverinfo)
                debuglog().log("client send to " + str(self.serverinfo) + " seq = " + str(nnextseqnum) +"\n")

            except socket.error as e:
                debuglog().log("client send to " + str(self.serverinfo) + " seq = " + str(nnextseqnum) + "socket error ,resend it again\n")
                debuglog().log(e)
                bresend = True
            except:
                debuglog().log("client send to " + str(self.serverinfo) + " seq = " + str(nnextseqnum) + " unknown error ,resend it again\n")
                bresend = True


            try:
                revackmsg, address = udpsk.recvfrom(ackmessages.getheadersize())
                nrtseqn = ackmessages().isvalidackmsg4client(revackmsg, nnextseqnum)
                debuglog().log("client rev from " + str(self.serverinfo) + " seq = " + str(nrtseqn) + "\n")

                if nrtseqn <= nnextseqnum:
                    bresend = True
                else:
                    nnextseqnum += 1
                    continue

            except socket.error as e:
                debuglog().log("client rev from " + str(self.serverinfo) + " seq = " + str(nnextseqnum) + " socket error ,resend data again\n")
                debuglog().log(e)
                bresend = True
            except:
                print("client rev from " + str(self.serverinfo) + " seq = " + str(nnextseqnum) + " unknown error ,resend data again\n")
                bresend = True

            if bresend:
                continue
            nnextseqnum += 1

        debuglog().log("client send to " + str(self.serverinfo) + " with file " + self.fpath + " finished \n")
        debuglog.logtime("client finished file " + self.fpath + " to " + str(self.serverinfo) + " "+ str(datetime.datetime.now()))


#server-1 server-2 server-3 server-port# file-name MSS
if __name__ == '__main__':
    reload(sys)
    try:
        sys.setdefaultencoding('utf8')
        nlen = len(sys.argv)
        if nlen < 5:
            print '%s <server ip> <port> <file> <mms>' % sys.argv[0]
        else:
            p2mpclient(sys.argv[1:nlen-3],sys.argv[nlen-3],sys.argv[nlen-2],sys.argv[nlen-1])
    except IndexError:
        print '%s <server ip> <port> <file> <mms>' % sys.argv[0]

#p2mpclient("35.196.157.215 12003# ./1.pdf 2048")