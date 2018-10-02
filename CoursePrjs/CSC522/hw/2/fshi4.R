######
# Bisecting K-Means
#####
rm(list = ls(all = T))

library(RColorBrewer)

# set seed to ensure consistent results
set.seed(100)

# Read data file
# When	submitting, ensure that the path to this file is just "hw2-data.csv" 
# and doesn't point	to a path on your machine 
data.df <- read.csv('hw2-data.csv')

# TODO: Implement bisecting k means.
# Input:
# data.df: data frame based on hw2-data.csv
# trials.max: Max. number of trials for kmeans, as per Algorithm 8.2 in textbook. 
# You are allowed to use the pre-defined kmeans() function.
# k: Number of clusters to find in bisecting k-means

# Output:
# Your output/function return value will be a list containing 2 elements
# first element of the list is a vector containing cluster assignments (i.e., values 1 to k assigned to each data point)
# second element of the list is a vector containing SSE of each cluster
# Additional Information:
# When identifying which cluster to split, choose the one with maximum SSE
# When performing kmeans, pick two random points the cluster with largest SSE as centers at every iteration. 
# Be mindful that there might be duplicates in the data.
# terminating condition: when k clusters have been found
data.vec<-cbind(data.df[,2],data.df[,3])
data.vec.len<-length(data.df[,1])


kmeans.cluters.num=1
kmeans.sse=vector("numeric", data.vec.len) #vector of sse
kmeans.clusters.id=vector("numeric", data.vec.len) #each value in this vector shows the clusterid which it belongs in,length(this vector) should be lengthof(data set)
kmeans.clusters.c=-cbind(vector("numeric", data.vec.len),vector("numeric", data.vec.len))#each ele is the center of a cluster


distance.fourparameters<-function(x1,x2,y1,y2)
{
    return ((x1 - y1)*(x1 - y1) + (x2 - y2)*(x2 - y2))
}

sse.cluster.kkmeans<-function(cl,orgidx)
{
    cl.vec.index = 1
    cl.total.sse <-c(0,0)
    for (i in 1:data.vec.len)
    {
        if(kmeans.clusters.id[i] == orgidx)  #filter data 1st
        {
            cl.center = cl$cluster[cl.vec.index]
            cl.total.sse[cl.center] = cl.total.sse[cl.center] + distance.fourparameters(data.vec[i,1],data.vec[i,2],cl$centers[cl.center,1],cl$centers[cl.center,2])
            cl.vec.index = (cl.vec.index +1)
        }
    }
    return (cl.total.sse)
}

#cal sse
sse.clusters.kkmeans<-function(cls,bisectk)
{
    return(cal2clustersse(cls,bisectk))
}


createvec.kkmeans<-function(bisectk)
{
    vec<-which(kmeans.clusters.id == bisectk)
    vec.lengh <- length(vec)
    vec.total.len<- data.vec.len
    vec1=vector("numeric", vec.lengh)
    vec2=vector("numeric", vec.lengh)
    vec.idex<-1
    for(i in 1:vec.total.len)
    {
        if(!is.na(vec[vec.idex]))
        {
            if(vec[vec.idex] == i)
            {
                vec1[vec.idex] = data.vec[i,1]
                vec2[vec.idex] = data.vec[i,2]
                vec.idex <- (vec.idex+1)
            }
        }
    }
    return (cbind(vec1,vec2))
}

split.kkmeans<-function(clusterids,centers,sses,bisectk)
{
  knumber = kmeans.cluters.num
  knumber<- (knumber+1)
  vclustindex<-1
  for(i in 1:data.vec.len)
  {
      if(!is.na(kmeans.clusters.id[i]))
        {
            if(kmeans.clusters.id[i] == bisectk)
            {
               if(clusterids[vclustindex] != 1)
                {
                    kmeans.clusters.id[i] <<- knumber;
                }
                vclustindex<-(vclustindex+1)
            }
        }
  }
  kmeans.clusters.c[bisectk,] <<- c(centers[1],centers[2])
  kmeans.clusters.c[knumber,] <<- c(centers[3],centers[4])
  kmeans.sse[bisectk] <<- sses[1]
  kmeans.sse[knumber] <<- sses[2]
  return (knumber)
}

getinitialcenter.kkmeans<-function(vecs)
{
   xc<-mean(vecs[,1])
   yc<-mean(vecs[,2])

   len<-length(vecs[,1])
   sses<-vector("numeric", len)
   for(i in 1:len)
   {
       sses[i] = distance.fourparameters(vecs[i,1],vecs[i,2],xc,yc)
   }
    ssemax1 = sses[1]
    ssemax1pps = 1
    ssemax2 = sses[1]
    ssemax2pps = 1
   for( i in 1:len)
   {
      if(ssemax1 < sses[i])
        {
            ssemax1 = sses[i]
            ssemax1pps = i
        }
   }

    for( i in 1:len)
    {
        if((ssemax2 < sses[i]) && (i !=  ssemax1pps))
        {
            ssemax2 = sses[i]
            ssemax2pps = i
        }
    }
    return (rbind(vecs[ssemax1pps,],vecs[ssemax2pps,]))
}

recursive.bkmeans <- function(trials.max,k)
{
    # start your implementation here
    bisectk = 1
    while(kmeans.cluters.num < k)
    {
        vec.split<-createvec.kkmeans(bisectk)
        #get data
        # for clusterid
        vec.cluster.ids<-vector("numeric", length(vec.split))
        vec.cluster.centers<-vector("numeric", 4)
        vec.cluter.mininum.sse<-c(0,0)
        kmeans.minsse = -1
        if(length(vec.split) >= 2)
        {
#browser()
            centerpos <- getinitialcenter.kkmeans(vec.split)
            for(i in 1:trials.max)
            {
                kmeans.tmp.result<-kmeans(vec.split,centerpos)
                ssetmp<-sse.cluster.kkmeans(kmeans.tmp.result,bisectk)
                totalsse = ssetmp[1] + ssetmp[2]
                if(kmeans.minsse < 0)
                {
                    vec.cluster.ids<-kmeans.tmp.result$cluster
                    vec.cluster.centers[1] = kmeans.tmp.result$centers[1,1]
                    vec.cluster.centers[2] = kmeans.tmp.result$centers[1,2]
                    vec.cluster.centers[3] = kmeans.tmp.result$centers[2,1]
                    vec.cluster.centers[4] = kmeans.tmp.result$centers[2,2]
                    kmeans.minsse = ssetmp[1] + ssetmp[2]
                    vec.cluter.mininum.sse[1] = ssetmp[1]
                    vec.cluter.mininum.sse[2] = ssetmp[2]
                }
                else if(kmeans.minsse < totalsse)
                {
                    kmeans.minsse = ssetmp[1] + ssetmp[2]
                    vec.cluter.mininum.sse[1] = ssetmp[1]
                    vec.cluter.mininum.sse[2] = ssetmp[2]

                vec.cluster.ids<-kmeans.tmp.result$cluster
                vec.cluster.centers[1] = kmeans.tmp.result$centers[1,1]
                vec.cluster.centers[2] = kmeans.tmp.result$centers[1,2]
                vec.cluster.centers[3] = kmeans.tmp.result$centers[2,1]
                vec.cluster.centers[4] = kmeans.tmp.result$centers[2,2]
                }
            }
            #find the mininum one 2-kmeans
            kmeans.cluters.num <<-split.kkmeans(vec.cluster.ids,vec.cluster.centers,vec.cluter.mininum.sse,bisectk)
            bisectk<- which.max(kmeans.sse)
        }
    }
}


bisectingkmeans <- function(data.df,trial,k){
    # start your implementation here
    #initial
    for(i in 1:data.vec.len)
    {
        kmeans.clusters.id[i]<<-1
    }
    kmeans.sse[1]<<-0
    recursive.bkmeans(trial,k)

    outputsse =vector("numeric", kmeans.cluters.num)
    for(i in 1:kmeans.cluters.num)
    {
        outputsse[i] = kmeans.sse[i]
    }
    return (list(kmeans.clusters.id,outputsse))
}


allsse.cluster.kkmeans<-function(cl)
{
    cl.total.sse <-vector("numeric", length(cl$center[,1]))
    for (i in 1:data.vec.len)
    {
        cl.center = cl$cluster[i]
        cl.total.sse[cl.center] = cl.total.sse[cl.center] + distance.fourparameters(data.vec[i,1],data.vec[i,2],cl$centers[cl.center,1],cl$centers[cl.center,2])
    }
    return (cl.total.sse)
}

ex.kmeans <- function(k)
{
    # start your implementation here
    kmeans.center<-rbind(data.vec[210,], data.vec[247,], data.vec[265,], data.vec[278,], data.vec[288,])
    kmeans.result<-kmeans(data.vec,kmeans.center)
    kmeans.result.sse<-allsse.cluster.kkmeans(kmeans.result)
    return (list(kmeans.result$cluster,kmeans.result.sse))
}

# Write code for comparing result from bisecting kmeans here - Part b
kmeans_comparison <- function(data.df, result, k){
    resultk<-ex.kmeans(k)
    diff.cluster<-(result[[1]]-resultk[[1]])
    diff.sse<-(result[[2]]-resultk[[2]])

    #plot(data.df[, -1], col = brewer.pal(k, "Set3")[resultk[[1]]], pch = '.',
    #cex = 3)
}

# Don't edit anything beyond this line
# Please note, TA will test with different configurations of trails.max and k.
k=5
iter.max = 25
result <- bisectingkmeans(data.df, iter.max, k)
plot(data.df[, -1], col = brewer.pal(k, "Set3")[result[[1]]], pch = '.',
  cex = 3)

kmeans_comparison(data.df, result, k)

