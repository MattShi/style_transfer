#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#####################################
###part of code comes from https://github.com/perborgen/LogisticRegression


from numpy import *
import sys

import matplotlib.pyplot as plt

dataset_path = 'testSet.txt'
ig_parameters_num = []

def loadDataSet(fpath):
    dataset, labels = [], []
    with open(fpath, 'r') as f:
        for line in f:
            splited_line = [float(i) for i in line.strip().split(' ')]
            data, label = [1.0] + splited_line[1:], splited_line[0]
            data = filterattrs(data)

            dataset.append(data)
            labels.append(label)
    dataset = array(dataset)
    labels = array(labels)
    return dataset, labels


def filterattrs(data):
    rd = []
    for i in range(len(data)):
        if ig_parameters_num.count(i) == 0:
            rd.append(data[i])

    return rd
#################################################################################

def sigmoid(x):
    return 1/(1+exp(-x))


def gradient_ascent(dataset, labels, max_iter=10000):
    dataset = matrix(dataset)

    vlabels = matrix(labels).reshape(-1, 1)
    m, n = dataset.shape
    w = ones((n, 1))
    alpha = 0.001
    ws = []
    print ("regressioning..." + str(max_iter))
    for i in range(max_iter):
        error = sigmoid(dataset*w) - vlabels
        w -= alpha*dataset.T*error
        ws.append(w.reshape(1, -1).tolist()[0])
    return w



def stocGraAscent(dataMatrix,matLabel,max_iter=10000):
    m,n=shape(dataMatrix)
    matMatrix= mat(dataMatrix)

    print ("regressioning..." + str(max_iter))

    w=ones((n,1))
    alpha=0.001
    num=max_iter
    for i in range(num):
        for j in range(m):
            error=sigmoid(matMatrix[j]*w)-matLabel[j]
            w -= alpha*matMatrix[j].transpose()*error
    return w


def stocGraAscentEx(dataMatrix,matLabel,max_iter=10000):
    m,n=shape(dataMatrix)
    matMatrix=mat(dataMatrix)

    print ("regressioning..." + str(max_iter))
    w=ones((n,1))
    num=max_iter
    setIndex=set([])
    for i in range(num):
        for j in range(m):
            alpha=4/(1+i+j)+0.01

            dataIndex=random.randint(0,100)
            while dataIndex in setIndex:
                setIndex.add(dataIndex)
                dataIndex=random.randint(0,100)
            error=sigmoid(matMatrix[dataIndex]*w)-matLabel[dataIndex]
            w -= alpha*matMatrix[dataIndex].transpose()*error
    return w



def calrg(datasetpath,itertimes,alg = 0):
    dataset, labels = loadDataSet(datasetpath)
    if alg == 0:
        w = gradient_ascent(dataset, labels, max_iter=itertimes)
    elif alg == 1:
        w = stocGraAscent(dataset, labels, max_iter=itertimes)
    elif alg == 2:
        w = stocGraAscentEx(dataset, labels, max_iter=itertimes)
    print (str(itertimes) + " times regression finished ")
    print (w)
    return w


def classifyVector(inX,trainWeights):
    prob=sigmoid(inX*trainWeights)
    print (str(prob) + '\n')

    if prob > 0.5:
        return 1
    else :
        return 0


def calpredict(testpath,trainWeights):
    numTestVec = 0
    errorCount = 0

    with open(testpath, 'r') as f:
        for line in f:

            numTestVec += 1
            splited_line = [float(i) for i in line.strip().split(' ')]
            data, label = [1.0] + splited_line[1:], splited_line[0]

            ##################filter
            data = filterattrs(data)

            if classifyVector(matrix(data), trainWeights) != int(label):
                errorCount += 1

    errorRate = (float(errorCount) / numTestVec)

    print('the error rate of this test is :%f ' % errorRate)
    return errorRate

################################################################################
def create_ig_list():
    if len(ig_parameters_num) == 0:
        ig_parameters_num.append(0)
    else:
        ig_parameters_num[0] += 1

################################################################################
if __name__ == '__main__':
    reload(sys)
    sys.setdefaultencoding('utf8')
    trainingpath = sys.argv[1]
    testpath = sys.argv[2]
    for k in range(10):
        create_ig_list()
        print("ignore " + str(k-1) + " attrs...\n")
        itertimes = [1,100,500,1000]
        algr = [0,1]
        for j in algr:
            for i in itertimes:
                weights = calrg(trainingpath,i,j)
                calpredict(testpath,weights)

    print ("all regression finished ")