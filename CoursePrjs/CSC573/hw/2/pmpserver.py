from socket import *
from ackmessages import ackmessages
from debuglog import  debuglog
from fileoperator import  fileOperator

import random
import sys
import datetime
import time

class p2mpServer:
    def __init__(self, nport,sfile,np):

        self.localport = int(nport)
        self.localfilepath = sfile
        self.p = float(np)

        self.maxbufsize = 5120 +64
        self.seq = 0
        self.f = open(self.localfilepath, 'wb')
        self.connect()
        self.debugprint = True

    def getsize(self,fpath):
        return os.path.getsize(fpath)

    def connect(self):
        try:
            self.ssocket = socket(AF_INET, SOCK_DGRAM)
            self.ssocket.bind(('', self.localport))
            headersize = ackmessages().getheadersize()

            debuglog().log("server bind on " + str(('', self.localport)) +" waiting \n")
            btimeprint = True
            ttime = time.time()

            while True:
                sentence, addr = self.ssocket.recvfrom(self.maxbufsize)

                if btimeprint == True:
                    ttime = time.time()
                    debuglog.logtime("server rev file " + self.localfilepath + str(datetime.datetime.now()))
                    btimeprint = False

                if random.uniform(0, 1) >= self.p:
                    ackmsg = sentence[0:headersize]
                    nseq = ackmessages().isvalidackmsg(ackmsg,self.seq)
                    debuglog().log("server rev from " + str(addr) + " seq = " + str(nseq) + "\n")

                    if nseq >= self.seq:
                        self.seq += 1
                        self.f.write(sentence[headersize:])
                    else:
                        debuglog().log ("discarded packet from " + str(addr) + " seq = " + str(nseq) + " by wrong seq\n")

                    strsend = ackmessages().generateackmsg(self.seq)
                    self.ssocket.sendto(strsend,addr)
                    debuglog().log("server send to " + str(addr) + " seq = " + str(self.seq) + "\n")

                    if headersize == len(sentence):
                        debuglog().log("server rev from " + str(addr) + " with file " + self.localfilepath +" finished \n")
                        break

                else:
                    debuglog().log ("discarded packet " + str(self.seq) + " by chance \n")
                    sentence = self.ssocket.recv(self.maxbufsize)

            ttime = time.time() - ttime;
            debuglog.logtime("server finished file " + self.localfilepath + " with time "+ str(datetime.datetime.now()))
            debuglog.logtime("trans time (sec) " + str(ttime))

            self.ssocket.close()

        except socket.error as e:
            debuglog().log(e)


if __name__ == '__main__':
    reload(sys)
    try:
        sys.setdefaultencoding('utf8')
        p2mpServer(sys.argv[1],sys.argv[2],sys.argv[3])
    except IndexError:
        print 'Usage: %s <port> <file> <p>' % sys.argv[0]

#p2mpServer("12003 ./1.pdf 0.2")