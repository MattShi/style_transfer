% Max Jaderberg 2014
% Produces character classifier saliency map

addpath(genpath('./'));

imfn = 'data/test/1.JPG';
im = imread(imfn);
img = single(rgb2gray(im));

%% pad
img = padarray(img, [11 11]);

%% preprocess
winsz = 24;
mu = (1/winsz^2) * conv2(img, ones(winsz, winsz, 'single'), 'same');
x_ = (img - mu).^2;
stdim = sqrt((1/winsz^2) * conv2(x_, ones(winsz, winsz, 'single'), 'same'));
data = img - mu;
eps = 1;
data = data ./ (stdim + eps);

%% load model
%%nn = cudaconvnet_to_mconvnet('models/charnet_layers.mat');
%%nn.verbose = 1;
nn = cudaconvnet_to_mconvnet('models/detnet_layers.mat');

%% process
nn = nn.forward(nn, struct('data', data));

%% fig
close all;
fntsz = 20;
figure(1); 
subplot(1,2,1); 
imshow(im);
subplot(1,2,2);
[~,mn] = max(nn.Xout, [], 3);
m = threshhold(mn,10);
%%%this part done

%%%% for RLSA
m = RLSA(m);
%imshow(m);
caxis([1 37]);
subplot(1,2,1);
%%%

%%%for region
cc = bwconncomp(m);
st = regionprops(cc,'BoundingBox');
for k = 1 : length(st)
thisBB = st(k).BoundingBox;
rectangle('Position',[thisBB(1),thisBB(2),thisBB(3),thisBB(4)],'EdgeColor','g','LineWidth',1 );
end

%%% for filltering box
targetbb ={};
%%mininum size fileter
minwidth = 8;
minheight = 8;
for k = 1 : length(st)
thisBB = st(k).BoundingBox;
    if((thisBB(3) > minwidth) && (thisBB(4) > minheight))
        %%rectangle('Position',[thisBB(1),thisBB(2),thisBB(3),thisBB(4)],'EdgeColor','b','LineWidth',1 );
        targetbb{end +1} = thisBB;
    else
        m = RetMatrix(m,0,[thisBB(1),thisBB(2),thisBB(3),thisBB(4)]);%% remove outliers
    end
end

%%%%%%crop image by boundingbox
for i = 1:length(targetbb)
    cbb = targetbb{i};
    cimcp = imcrop(im,[cbb(1),cbb(2),cbb(3),cbb(4)]);%%crop
    cimcp = rgb2gray(cimcp);
    cimcp = imbinarize(cimcp,'adaptive','ForegroundPolarity','dark','Sensitivity',0.4);
    cimcp = scaleto(cimcp,255);
    cimcp = RLSA(cimcp);
    m = SetMatrix(m,cimcp,[cbb(1),cbb(2)]);
    %%image('XData',cbb(1),'YData',cbb(2),'CData',cimcp);
    %%rectangle('Position',[cbb(1),cbb(2),cbb(3),cbb(4)],'EdgeColor','y','LineWidth',1 );
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%connected component again
ccc = bwconncomp(m);
stc = regionprops(ccc,'BoundingBox');
for k = 1 : length(stc)
    thisBB = stc(k).BoundingBox;
    cimcp = imcrop(im,[thisBB(1),thisBB(2),thisBB(3),thisBB(4)]);%%crop
    cl = 'r';
    if(FilterRegionByMeanAndSD(cimcp) < 1)
       cl = 'b';
    end
      rectangle('Position',[thisBB(1),thisBB(2),thisBB(3),thisBB(4)],'EdgeColor',cl,'LineWidth',1 );  
end

subplot(1,2,2);
imshow(m);


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
figure(2); plot(1:length(nn.time), nn.time);
title('Layer timings');
xlabel('Layer #');
ylabel('Time (s)');


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%functions
%%scale to xx
function mt = scaleto(m,s)
    min1=min(min(m));
    max1=max(max(m));
    if(min1 == max1)
        mt = m;
    else
        mt=((m-min1).*s)./(max1-min1);
    end
end

%%%%theshold 
function im = threshhold(m,mx)
    [ml,nl] = size(m); 
    for i=1:ml
        for j = 1:nl
            if(m(i,j) < mx)
              m(i,j)=0;
            else
              m(i,j)=255;  
            end
        end
    end
    im = m;
end

%%%threshhold for the problity
function im = RLSA(u)
    u=double(u);
    %%mean and sd
    uone = reshape(u,1,[]);
    mu = mean(uone);
    sdu = std(uone);
    %% for each row of pixels the mean µ and standard deviation ?
    %% of the spacings between probability peaks are computed and neighboring regions
    %% are connected if the space between them is less than 3µ?0:5?
    maxspace = 3*mu - 0.5*sdu;
    [a b]=size(u);
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    for i=1:a  %%%%%horizion
        c=1;
        for j=1:b
            if u(i,j) == 255
                if (j-c)<= maxspace 
                    u(i,c:j) = 255;
                end
            c=j;
             end
        end
        if (b-c)<= maxspace
            u(i,c:b) = 255;
        end
    end
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % for i=1:b
    %    c=1;
    %    for j=1:a
    %        if u(j,i) == 255
    %            if (i-c)<= maxspace 
    %                u(c:i,j) = 255;
    %            end
    %        c=i;
    %         end
    %    end
    %    if (b-c)<= maxspace
    %        u(c:b,j) = 255;
    %    end
    % end
  im = u;
end

function im = SetMatrix(org,new,pos)
    [ml,nl] = size(new);%%
    posf = [floor(pos(1)),floor(pos(2))];
    for i=1:ml
        for j = 1:nl
         org(posf(2)+i,posf(1)+j) = new(i,j);
        end
    end
    im = org;
end

function im = RetMatrix(org,c,pos)
    ml = pos(3);
    nl = pos(4);
    posf = [floor(pos(1)),floor(pos(2))];
    for i=1:ml
        for j = 1:nl
         org(posf(2)+i,posf(1)+j) = c;
        end
    end
    im = org;
end

function f = FilterRegionByMeanAndSD(rimg)
    rimg = double(rimg);
    rimgone = reshape(rimg,1,[]);
    msd = std(rimgone);
    if(msd <= 15)
       f = 0;
    else
        f = 1;
    end
end