import struct

class ackmessages(object):
    @staticmethod
    def bytestoint(bdata,nmode= 2):
        return int(str(bdata),nmode)

    @staticmethod
    def isvalidackmsg(data,nseqnum):
        if len(data) != 64:
            return -1
        data = bytearray(data) #https://stackoverflow.com/questions/7585435/best-way-to-convert-string-to-bytes-in-python-3
        bseqnum = data[0:32]
        bchsum = data[32:48]
        bspc = data[48:]

        if str(bspc) != '0101010101010101':
            return -1
        #if int(str(bseqnum),2) != nseqnum:
        #    return -1
        if (int(str(bseqnum),2)+ int(str(bchsum),2)) != 0xffff:
            return -1

        return int(str(bseqnum),2)

    @staticmethod
    def isvalidackmsg4client(data, nseqnum):
        if len(data) != 64:
            return -1
        data = bytearray(
            data)  # https://stackoverflow.com/questions/7585435/best-way-to-convert-string-to-bytes-in-python-3
        bseqnum = data[0:32]
        bchsum = data[32:48]
        bspc = data[48:]

        if str(bspc) != '0101010101010101':
            return -1
        #if int(str(bseqnum), 2) < nseqnum:
        #    return -1
        if (int(str(bseqnum), 2) + int(str(bchsum), 2)) != 0xffff:
            return -1

        return int(str(bseqnum), 2)

    @staticmethod
    def generateackmsg(seqno):
        bseqnum = format(seqno, '032b')
        bcksum = abs(0xffff- ackmessages.bytestoint(bseqnum[0:16]) - ackmessages.bytestoint(bseqnum[16:]))
        bspc = '0101010101010101'
        sreturn = str(bseqnum)+ format(bcksum, '016b') + bspc

        return sreturn

    @staticmethod
    def getheadersize():
        return 64