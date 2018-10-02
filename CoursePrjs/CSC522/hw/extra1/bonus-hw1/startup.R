#########
# Startup script to setup the environment and functions to load the image
#########

require(rgeos) # to read geotiff files
require(rgdal) # to read geotiff files


# Environment variables to be used across the mlc code
colors <- c('red', 'blue', 'green', 'yellow', 'black') #color to represent 
# each class (from 1 to 5)
features <- c('R', 'G', 'B') # Feature names


readTif <- function(){
    # make your changes to the path here
    data_path <- 'ilk-3b.tif'
    myImg <- readGDAL(data_path) # read the tif file
    myImgData <- myImg@data # read the corresponding image information
    colnames(myImgData) <- c('R', 'G', 'B')
    return(myImgData)
}

readCSV <- function(){
    # make your changes to the path here
    tr_path <- 'ilk-tr-xy.txt' # path to training dataset
    te_path <- 'ilk-te-xy.txt' # path to test dataset
    tr <- read.csv(tr_path, header=T)
    te <- read.csv(te_path, header=T)
    colnames(tr) <- c('R', 'G', 'B', 'Class')
    colnames(te) <- c('R', 'G', 'B', 'Class')
    return(list(tr,te))
}

# Assign colors: Source: Visualization work done by BharathKumar Ramachandra
col = matrix(0, nrow = 6, ncol = 3)
col[1, ] = c(255, 0, 0) # red
col[2, ] = c(0, 0, 255) # blue
col[3, ] = c(0, 255, 0) # green
col[4, ] = c(255, 255, 0) # yellow
col[5, ] = c(0, 0,0 ) # black 


# Source: Bharathkumar Ramachandra
# Function to assign colors to each pixel in the image
colorize <- function(d)
{
    for(i in 1:3)
        d[, i] <- rep(col[d[1, ]$Class, i], nrow(d))
    return(d)
}

# Source: Bharathkumar Ramachandra
plotTif <- function(classified){
    # read original image
    myImg<-readGDAL('ilk-3b.tif')
    classified <- cbind(myImg@data, classified)
    colnames(classified) <- c('R', 'G', 'B', 'Class') 
    classified$ID <- seq(1:nrow(classified))
    t <- split(classified,classified$Class ,drop = T) # split by class
    t <- lapply(t, FUN = colorize) # Apply color to each class
    x <- do.call("rbind", t)
    x <- x[order(x$ID), ] # Reorder data in original order
    x <- x[, -c(4,5)] # Remove unnecessary columns
    myImg@data <- x
    writeGDAL(myImg, fname = "./mlc.tif") # write GDAL file
}