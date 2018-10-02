######
# kNN
######

# Do not clear your workspace

# load required libraries
require(class) # for kNN classifier
require(caret) # for createDataPartition, train, predict
require(randomForest) # for random forest classifier
require(MASS) # for neural net classifier


# set seed to ensure reproducibility
set.seed(100)

# load in-built dataset
data(iris)

# normalize all predictors, i.e., all but last column species
iris[, -ncol(iris)] <- scale(iris[, -ncol(iris)])

# split the data into training and test sets 70/30 split
# take a partition of the indexes then use the index vectors to subset
###
irisidx = seq(1,length(iris$Species),1)

trainIdx <- createDataPartition(irisidx, p = .7, list = FALSE)
# those Idxs in original data but not in trainIdx will form testIdx
###
testIdx <- setdiff(irisidx, trainIdx)
# subset the original dataset with trainIdx and testIdx, use all but last column
train <- iris[trainIdx, -ncol(iris)]
test <- iris[testIdx, -ncol(iris)]

# create a factor for the training data class variable
###
cl <- factor(iris[trainIdx,5])

# use random forest from randomForest package to predict
###
RFmodel <- train(train[,1:4],iris[trainIdx,5] , method = "rf")
RFpreds <- predict(RFmodel,test )

# create contingency table of predictions against ground truth
###
table(RFpreds, factor(iris[testIdx,5 ]))

# use neural network from MASS package to predict
###
NNmodel <- train(train[,1:4],iris[trainIdx,5], method = "nnet")
NNpreds <- predict(NNmodel,test )

# create contingency table of predictions against ground truth
###
table(NNpreds, factor(iris[testIdx,5]))

# use knn from class package to predict, use 3 nearest neighbors
###
knnPreds <- knn(train,test,cl ,3 ,l =0, prob = TRUE)

# create contingency table of predictions against ground truth
###
table(knnPreds, factor(iris[testIdx,5]))

# implement myknn with manhattan distance, majority vote and 
# resolving ties by priority setosa > versicolor > virginica
myknn <- function(train, test, cl, k)
{
    classes <- vector()
    for(i in 1:nrow(test))
    {
        dists <- vector()
        for(j in 1:nrow(train))
        {
            # implement manhattan distance calculation without using the
            # dist function
            ###
            dists[j] <- sum(abs(train[j,1:4] - test[i,1:4]))
        }
        # implement majority vote and resolving ties by priority to assign class
        # functions order, max, which.max and table could be useful
        ###
        classresult <-vector();
        distsmin <-vector();
        distsidx<-cbind(seq(1,nrow(train),1),dists);
        for(s in 1:k)
        {
          distsmin[s]<-which.min(distsidx[,2])
          distsidx <- distsidx[-c(distsmin[s]),]
          classresult[s]<-cl[distsmin[s]]
        }
        #classes[i] <- levels(cl)[which.max(table(classresult))]
        classes[i] <- levels(cl)[classresult[which.max(table(classresult))]]
    }
    return(factor(classes))
}

# predict using your implemented function
myPreds <- myknn(train, test, cl, k = 3)

# create contingency table of predictions against ground truth
###
table(myPreds, factor(iris[testIdx,5]))

# compare with the knn from class package
table(myPreds, knnPreds)

