from socket import *
from random import randint



prob=0.05
l=len(str(prob))
for x in range(2,l):
	prob*=10

filename='rfc2.txt'
serverPort = 12003
try:
    serverSocket = socket(AF_INET,SOCK_DGRAM)
    serverSocket.bind(('',serverPort))
    sentence, addr = serverSocket.recvfrom(2048)
    seq=1
    f=open(filename,'wb')
    while "e_c01" not in sentence:
        l=randint(0,100)
        header1=sentence[:32]
        header1=str(header1)
        hd1=int(header1,2)
        header1=hd1
        header2=sentence[32:48]
        header3=sentence[48:64]
        sentence=sentence[64:]

        if l>prob and seq==header1:
            print "wrote packet ",seq
            f.write(sentence)
            header1=format(seq,'032b')
            header2="0000000000000000"
            header3="1010101010101010"
            seq+=1
            serverSocket.send(header1+header2+header3)
        else:
            print ("discarded packet " + str(seq))
            sentence=serverSocket.recv(1024+64)
        print(sentence)
    header1=format(seq,'032b')
    header2="0000000000000000"
    header3="1010101010101010"
    seq+=1
    serverSocket.send(header1+header2+header3)
    sentence=sentence[64:-5]
    f.write(sentence)
    serverSocket.close()
except:
    print("error")


class p2mpServer:
    def __init__(self, params):
        self.initaugs = params
        self.localport = 10023
        self.localfilepath = 'local.dat'
        self.maxbufsize = 2048
        self.seq = 1
        self.f = open(self.localfilepath, 'wb')
        self.extractParams(params)
        self.connect()

# port# file-name p
    def extractParams(self,params):
        npos = params.find("#")
        self.localport = int(params[0,npos-1])
        nposp = params.find(npos,"#")
        self.localfilepath = params[npos+1, nposp - npos]
        nposp = params.find(npos, " ")
        self.p  = float(params[nposp + 1,])

    def connect(self):
        try:
            self.ssocket = socket(AF_INET, SOCK_DGRAM)
            self.ssocket.bind(('', self.localport))

            while True:
                sentence, addr = serverSocket.recvfrom(self.maxbufsize)
                if l > prob:
                    print "wrote packet "
                    self.f.write(sentence)
                    header1 = format(self.seq, '032b')
                    header2 = "0000000000000000"
                    header3 = "1010101010101010"
                    self.seq += 1
                    self.ssocket.send(header1 + header2 + header3)
                else:
                    print ("discarded packet " + str(self.seq))
                    sentence = serverSocket.recv(self.maxbufsize)
                if len(sentence) < self.maxbufsize:
                    break;

            header1 = format(self.seq, '032b')
            header2 = "0000000000000000"
            header3 = "1010101010101010"
            self.seq += 1
            self.ssocket.send(header1 + header2 + header3)

            serverSocket.close()
        except:
            print("error")


p2mpServer("192.168.1.6 12003# ./1.pdf 2040")
