addpath(genpath('./'));

%%load pic
%%imfn = 'data/test.jpg';
%%im = imread(imfn);
%%find edge

% Max Jaderberg 2014
% Reproduce classifier results (Table 2)

addpath(genpath('./'));

dset = {};
model = {};
classchans = {};

%% Case-insensitive
dset{end+1} = 'data/icdar2003-chars-test.mat';
model{end+1} = 'models/charnet_layers.mat';
classchans{end+1} = 2:37;  % ignore background class

assert(numel(dset) == numel(model));
for i=1:numel(dset)
    fprintf('Testing %s ...\n', model{i});
    % load model
    nn = cudaconvnet_to_mconvnet(model{i});
    % load data
    % s = load(dset{i});
    [ims_s,labels_s] = transferGTSBRToECCV();
    ims = [];
    labels = [];
    for j=1:numel(labels_s)
        img = transrgbtogray(ims_s{j});
        imp(:,:,j) = img;
        ims = cat(4, ims,imp);
        labels = cat(2, labels, (j)*ones(1,numel(ims_s{j})));
    end
    
    ims = single(ims);
    labels = single(labels);
    % preprocess
    data = reshape(ims, [], size(ims,4));
    mu = mean(data, 1);
    data = data - repmat(mu, size(data,1), 1);
    v = std(data, 0, 1);
    data = data ./ (0.0000001 + repmat(v, size(data,1), 1));
    ims = reshape(data, size(ims));
    clear data;
    
    nn = nn.forward(nn, struct('data', single(ims)));
    
    %% go
    [~,pred] = max(squeeze(nn.Xout(:,:,classchans{i},:)), [], 1);
    err = sum(labels == pred) / numel(pred);
    fprintf('\taccuracy: %.2f percent\n', err*100);
end

function [ims,labels] = transferGTSBRToECCV()

    labels = {};
    ims = {};
    sBasePath = 'C:/Users/stone/Google Drive/NCSU/courses/2017spring/CE792/project/demo/jaderberg-eccv2014_textspotting/data/GTSRB/Final_Training/Images'; 

    for nNumFolder = 0:2
        sFolder = num2str(nNumFolder, '%05d');
        sPath = [sBasePath, '\', sFolder, '\'];

        if isdir(sPath)
            [ImgFiles, Rois, Classes] = readSignData([sPath, '\GT-', num2str(nNumFolder, '%05d'), '.csv']);

            for i = 1:numel(ImgFiles)
                ImgFile = [sPath, '\', ImgFiles{i}];
                Img = imread(ImgFile);

                %fprintf(1, 'Currently training: %s Class: %d Sample: %d / %d\n', ImgFiles{i}, Classes(i), i, numel(ImgFiles));
                labels{end+1} = Classes(i);
                ims{end+1} = Img;
            end
        end
    end
end


function [rImgFiles, rRois, rClasses] = readSignData(aFile)
% Reads the traffic sign data.
%
% aFile         Text file that contains the data for the traffic signs
%
% rImgFiles     Cell-Array (1 x n) of Strings containing the names of the image
%               files to operate on
% rRois         (n x 4)-Array containing upper left column, upper left row,
%               lower left column, lower left row of the region of interest
%               of the traffic sign image. The image itself can have a
%               small border so this data will give you the exact bounding
%               box of the sign in the image
% rClasses      (n x 1)-Array providing the classes for each traffic sign

    fID = fopen(aFile, 'r');
    
    fgetl(fID); % discard line with column headers
    
    f = textscan(fID, '%s %*d %*d %d %d %d %d %d', 'Delimiter', ';');
    
    rImgFiles = f{1}; 
    rRois = [f{2}, f{3}, f{4}, f{5}];
    rClasses = f{6};
    
    fclose(fID);
end

function im  = transrgbtogray(img)
    img = single(rgb2gray(img))
    winsz = 24;
    mu = (1/winsz^2) * conv2(img, ones(winsz, winsz, 'single'), 'same');
    x_ = (img - mu).^2;
    stdim = sqrt((1/winsz^2) * conv2(x_, ones(winsz, winsz, 'single'), 'same'));
    im = img - mu;
    eps = 1;
    im = im ./ (stdim + eps);
end
