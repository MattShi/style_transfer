#p2p file oper
class p2pfileoper:
    def __init__(self,fpath):
        self.fpath = fpath
        self.fhandle = open(fpath,'wb+')
        self.chrunk = 2048

    def writedata(self,bdata):
        self.fhandle.write(bdata)

    def readdata(self):
        return self.fhandle.read(self.chrunk)

    def finish(self):
        self.fhandle.flush()
        self.fhandle.close()