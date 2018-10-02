
class debuglog(object):
    @staticmethod
    def log(s,bprint = False):
        if bprint == True:
            print(s)

    @staticmethod
    def logtime(s,bprint = True):
        if bprint == True:
            print(s)