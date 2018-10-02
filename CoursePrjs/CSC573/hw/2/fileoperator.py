#for read and write file
import  os
class fileOperator(object):
    def __init__(self,fpath,packagesize,mode):
        self.fpath = fpath
        self.psize = packagesize
        self.hf = open(self.fpath,mode)

    def read(self):
        return self.hf.read(self.psize)