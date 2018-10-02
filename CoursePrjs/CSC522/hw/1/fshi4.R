img.df<- read.csv(file="hw1-data.csv",head=TRUE,sep=",")
img.vec<- unlist(img.df)
img.mean<-sum(img.vec)/length(img.vec)

img.stdDev<-sd(img.vec)


stdfun<-function(x){
vec<-lapply(x,function(x) (x-img.mean)*(x-img.mean))
return (sqrt(sum(unlist(vec)))/length(x))
}
img.std<-stdfun(img.vec)

normalize<-function(x)
{
mm<-max(x)
mn<-min(x)
vec<-lapply(x,function(x) (x-mn)*255/(mm-mn))
return (unlist(vec))
}
img.mm.vec<-normalize(img.vec)

znormalize<-function(x)
{
vec<-lapply(x,function(x) (x-img.mean)/(img.stdDev))
return (unlist(vec))
}
img.zn.vec<-znormalize(img.df)