import xml.etree.ElementTree as ET
import pickle
import os
import csv
import shutil
import struct
import imghdr
from os import listdir, getcwd
from os.path import join

classes = ["addedLane", "curveRight", "dip", "intersection", "laneEnds", "merge", "pedestrianCrossing", "signalAhead", "slow", "stopAhead", "thruMergeLeft", "thruMergeRight", "turnLeft",
           "turnRight", "yieldAhead", "doNotPass", "keepRight", "rightLaneMustTurn", "speedLimit15", "speedLimit25", "speedLimit30", "speedLimit35", "speedLimit40", "speedLimit45",
           "speedLimit50", "speedLimit55", "speedLimit65", "truckSpeedLimit55","speedLimit15", "speedLimit25", "speedLimit30", "speedLimit35", "speedLimit40", "speedLimit45", "speedLimit50",
           "speedLimit55", "speedLimit65", "speedLimitUrdbl","speedLimit15", "speedLimit25", "speedLimit30", "speedLimit35", "speedLimit40", "speedLimit45", "speedLimit50",
           "speedLimit55", "speedLimit65"]

wd = getcwd()

notationnewpath = wd + "/Dataset/"
notationfilename = "frameAnnotations.csv"

csv_filename = 'Filename'
csv_notation = "Annotation tag"
csv_upper_left_corner_x = "Upper left corner X"
csv_upper_left_corner_y = "Upper left corner Y"
csv_upper_right_corner_x = "Lower right corner X"
csv_upper_right_corner_y = "Lower right corner Y"



def get_image_size(fname):
    '''Determine the image type of fhandle and return its size.
    from draco'''
    with open(fname, 'rb') as fhandle:
        head = fhandle.read(24)
        if len(head) != 24:
            return
        if imghdr.what(fname) == 'png':
            check = struct.unpack('>i', head[4:8])[0]
            if check != 0x0d0a1a0a:
                return
            width, height = struct.unpack('>ii', head[16:24])
        elif imghdr.what(fname) == 'gif':
            width, height = struct.unpack('<HH', head[6:10])
        elif imghdr.what(fname) == 'jpeg':
            try:
                fhandle.seek(0) # Read 0xff next
                size = 2
                ftype = 0
                while not 0xc0 <= ftype <= 0xcf:
                    fhandle.seek(size, 1)
                    byte = fhandle.read(1)
                    while ord(byte) == 0xff:
                        byte = fhandle.read(1)
                    ftype = ord(byte)
                    size = struct.unpack('>H', fhandle.read(2))[0] - 2
                # We are at a SOFn block
                fhandle.seek(1, 1)  # Skip `precision' byte.
                height, width = struct.unpack('>HH', fhandle.read(4))
            except Exception: #IGNORE:W0703
                return
        else:
            return
        return width, height

def trafolder(rootDir):
    for lists in os.listdir(rootDir):
        path = os.path.join(rootDir, lists)
        if os.path.isdir(path):
            trafolder(path)
        if path == notationfilename:
            transnotation(path,rootDir)

def convert(size, box):
    dw = 1./size[0]
    dh = 1./size[1]
    x = (box[0] + box[1])/2.0
    y = (box[2] + box[3])/2.0
    w = box[1] - box[0]
    h = box[3] - box[2]
    x = x*dw
    w = w*dw
    y = y*dh
    h = h*dh
    return (x,y,w,h)

def extractfilename(str):
    lstr = str.split('/')
    rstr = lstr[len(lstr)-1].split('.')
    name = lstr[len(lstr)-1][:-4]
    return name


def transnotation(notationfilepath,dir):
    try:
        with open(notationfilepath, 'rb') as f:
            reader = csv.DictReader(f, delimiter=';')
            next(reader, None)

            if not os.path.exists(notationnewpath):
                os.makedirs(notationnewpath)

            lfolder = '%s/labels/'%(notationnewpath) #for labels folder
            if not os.path.exists(lfolder):
                os.makedirs(lfolder)

            imgdst = notationnewpath + "/JPEGImages/" #for image folder
            if not os.path.exists(imgdst):
                os.makedirs(imgdst)

            for row in reader:
                picname = extractfilename(row[csv_filename])
                labelfile = '%s/labels/%s.txt' % (notationnewpath, picname)
                out_file = open(labelfile, 'a')

                cls_id = -1;
                try:
                    cls_id = classes.index(row[csv_notation])
                except ValueError:
                    "Do nothing"
                else:
                    cls_id = classes.index(row[csv_notation])

                b = (float(row[csv_upper_left_corner_x]), float(row[csv_upper_right_corner_x]), float(row[csv_upper_left_corner_y]),
                     float(row[csv_upper_right_corner_y]))
                width,height = get_image_size(dir + "/" + row[csv_filename])
                bb = convert((width, height), b)
                out_file.write(str(cls_id) + " " + " ".join([str(a) for a in bb]) + '\n')
                out_file.close()

                cfrom = dir + "/" + row[csv_filename]  #copy image
                shutil.copy(cfrom, imgdst)

                out_file_list = open('%s/list.txt' % (notationnewpath), 'a')
                out_file_list.write(row[csv_filename] + '\n')
                out_file_list.close()
    except:
        print("error")

transnotation('allAnnotations.csv',wd)