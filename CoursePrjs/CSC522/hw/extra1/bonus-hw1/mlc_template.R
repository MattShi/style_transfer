########
# Maximum Likelihood Classifier
# Student Name:fangyuan shi
# Student Unity ID:fshi4
######


# Do not clear your workspace
# Do not set working directory in the code

require(mixtools) #for bivariate density plots/ellipses


# Run startup script to load functions to read geotiff files
source('./startup.R')

start.time <- Sys.time()
# Read data for training and testing
data <- readCSV()

# tr contains training data, first element of data
# te contains testing data, second element of data
tr <- data[[1]]
te <- data[[2]]

# Read the image(Geotiff file)
img <- readTif()

# Count the number of training instances
ntraining <- nrow(tr)

# Count the number of features
nfeatures <- ncol(tr) - 1

# Count the number of classes
nclasses <- length(unique(tr$Class))

# tr_splits is a list, where each element of the list contains 
# information pertaining a single class
tr_splits <- split(tr, tr$Class)

# HINT: For the next three methods, see how split() and lapply() work
# This will give you insight into writing code for the following functions

# Function to compute the mean of each feature in a data frame
# Args: 
# A data frame 'df' of training data pertaining to a single class of size
# (nrows x (nfeatures + 1))
# Returns: 
# A data frame containing means of each feature of size (1 x nfeatures)
# Don't forget to ignore class label column when computing mean 
###
compute_means <- function(df){
  rmeans<- colMeans(df)
  return(rmeans[1:3])
}
# Function to compute the covariance matrix between features in a data frame
# Args:
# A data frame 'df' of training data pertaining to a single class of size
# (nrows x (nfeatures + 1))
# Returns:
# Covariance matrix of size nfeatures * nfeatures
# Don't forget to ignore class label column when computing covariance matrix
###
compute_covs <- function(df){
    return(cov(df[,1:3]))
}

# Args:
# A data frame 'df' of training data pertaining to a single class of size
# ntraining, the number of training data points
# Returns:
# Probability of class contained in df
###
compute_apriori <- function(df, ntraining){
  return(length(df[,4])/ntraining) 
}

# tr_means is a list containing mean vector of attributes per class. 
tr_means <- lapply(tr_splits, compute_means) 

# tr_covs is a list containing covariance matrices of attributes per class. 
tr_covs <- lapply(tr_splits, compute_covs) 

# tr_apriori is a list containing prior probabilities per class.
tr_apriori <- lapply(tr_splits, compute_apriori, ntraining) 

# function to implement bivariate density plots (ellipses)
# Plot the training data points using only feat1 and feat2
# Using the means and covs you calculated in the previous steps, 
# plot ellipses for feat1 and feat2.
# You are expected to generate 5 ellipses in the same plot, one for each class
# Distinguish ellipses corresponding to classes using the colors variable
# You should also generate a legend, indicating colors assigned to each class.
# Label x and y axes and provide a descriptive plot title.
# Here's an example for ellipse() usage: 
# ellipse(mu = [mean vector of size 1 x 2],
#   sigma = [covariance matrix of size 2 x 2],
#   col = colors[class])
# An example plot has been provided in the PDF.
###
bvd <- function(feat1, feat2, means, covs,cls){
  labs <-c('R','G','B')
  #
  plot(te[,feat1],te[,feat2], pch = 19, cex = 1.3,xlab = labs[feat1],ylab = labs[feat2])
  
  l = length(means)
  for(i in 1:l)
  {
    mud<-c(means[[i]][feat1],means[[i]][feat2])
    sigmad = matrix(c(covs[[i]][feat1,feat1], covs[[i]][feat1,feat2],covs[[i]][feat2,feat1],covs[[i]][feat2,feat2]),2,2)
    ellipse(mu = mud,sigma = sigmad,col = cls[i],lwd=2)
  }
  
}

# Call the bvd density plot.
# 'feat1','feat2' variables refers to the dimensions
# Input dimension numbers. For eg: bvd(1, 2) refers to bvd 
# over the first two features R and G.
bvd(1, 3, tr_means, tr_covs, colors)

# Implement MLC
# Note: The method must work for any number of dimensions 
# Your code might be tested with an image with more than 3 features.
# Args:
# means - list containing mean vectors for each class
# covs - list containing covariance matrices for each class
# aprioris - list comprising of apriori probabilities for each class
# tedata - data frame of test data without the labels column
# Returns:
# predicted_cl - Vector of class assignments of length nrow(tedata) 
# You should implement MLC manually, do not use any library
###
MLC <- function(means, covs, aprioris, tedata){
    
    # vector to store predicted classes for each instance in test
    predicted_cl <- rep(0, nrow(tedata))
    

    #for Mahalanobis dis
    l = length(tedata[[1]])
    for ( i in 1:l)
    {
       clen = length(aprioris)
       cl_p <- rep(0, clen)
       for (j in 1:clen)
       {
         ivcovs = solve(covs[[j]])
         cr = (unlist(tedata[i,],FALSE,FALSE) - unlist(means[j],FALSE,FALSE))
         cl_p[j]= cr%*%ivcovs%*%cr
         cl_p[j] = sqrt(cl_p[j])*aprioris[[j]]
       }
       predicted_cl[i] = which.min(cl_p)
       
    }
    
    # Return the vector of predicted labels
    return(predicted_cl)
}

pred_te_labels <- MLC(tr_means, tr_covs, tr_apriori, te[, -ncol(te)])

# Generate confusion matrix - Variable 'tab' stores this confusion matrix
tab <- table(as.factor(te$Class), as.factor(pred_te_labels))

# Using the confusion matrix tab, compute overall accuracy
###
compute_overall_accuracy <- function(tab)
{
  aq <- vector()
  aq <- c(aq, sum(diag(tab)) / sum(tab))
  return (aq[1])
}

# Compute accuracy of a particular class using 'tab'
# Args:
# class - refers to the class number
# tab - confusion matrix
# Keep track of whether your actual and predicted labels are in rows or columns
# of tab
###
compute_class_accuracy <- function(class, tab){
    
  aq <- vector()
  aq <- diag(tab)/colSums (tab)
  return (aq)  
}

# Call overall class accuracy computation function
overall_te_accuracy <- compute_overall_accuracy(tab)

# Compute individual class accuracy for all classes
individual_te_accuracy <- sapply(1:nclasses, compute_class_accuracy, tab)

#Naïve Bayes
library(e1071)
library("caret")

set.seed(3456)
fit1 <- naiveBayes(tr[, -ncol(tr)], tr$Class, type="raw")
pred1 <- predict(fit1, te[,-ncol(te)], type="class")
confusionMatrix(pred1, te$Class)

#MLP
library(RSNNS)
#mlpm <- mlp(tr[, -ncol(tr)], tr[, ncol(tr)], size=5, learnFuncParams=c(0.1), maxit=50, inputsTest=tr[, -ncol(tr)], targetsTest=tr$targetsTest)

#DTREE
library("party")


# Now, let's do it on the whole image
# This will take a few minutes (or longer, depending upon your implementation)
pred_img_labels <- MLC(tr_means, tr_covs, tr_apriori, img)
end.time <- Sys.time()
time.taken <- end.time - start.time

# Plot the classification result on entire image
# Check your working directory for 'mlc.tif'!
plotTif(pred_img_labels)