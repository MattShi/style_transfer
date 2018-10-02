%selpos = [reference bottom,reference top; target bottom, target top]
%horizon line
%lines = [line reference,line target]
function [ height ] = cal_height(selpos,lines,horizon,vpz,hreference)
   line_b = cross(selpos(:,1), selpos(:,3));
   lines_horizon_b = [horizon(1),line_b(1);horizon(2),line_b(2);horizon(3),line_b(3)];
   
   %cal intersect
   horizon_intersect = zeros(3, 1);
   horizon_intersect(1:2) = (lines_horizon_b(1:2,:))'\(-1*lines_horizon_b(3,:))';
   horizon_intersect(3) = 1;
   
   %draw line from bottom of reference to horizon
   plot([horizon_intersect(1) selpos(1,1)],[horizon_intersect(2) selpos(2,1)], 'g');
   
   % line from intersection to upper part of reference
   line_r_t = cross(selpos(:,2), horizon_intersect);
   plot(line_r_t(1), line_r_t(2), 'r');
   
   %line from  horizon to top of target
   plot([horizon_intersect(1) selpos(1,2)],[horizon_intersect(2) selpos(2,2)], 'g');
   % intersection with light
   lines_horizon_b = [line_r_t(1),lines(1,2);line_r_t(2),lines(2,2);line_r_t(3),lines(3,2)];
   target_t_intersect = zeros(3, 1);
   target_t_intersect(1:2) = (lines_horizon_b(1:2,:))'\(-1*lines_horizon_b(3,:))';
   target_t_intersect(3) = 1;
  
   %line from  horizon to the insetersection of upper part of target
   plot(target_t_intersect(1), target_t_intersect(2), '*r')
   plot([horizon_intersect(1) target_t_intersect(1)],[horizon_intersect(2) target_t_intersect(2)], 'g');
   
   syms height;
   [height_sol] = solve( pdist([selpos(:,4)';selpos(:,3)'],'euclidean') * pdist([vpz';selpos(:,2)'],'euclidean') ...
                      /( pdist([selpos(:,1)';selpos(:,2)'],'euclidean') * pdist([vpz';selpos(:,4)'],'euclidean'))== height/hreference);
   height = double(height_sol);          

end

