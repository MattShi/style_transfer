% open pic
im = imread('PolkHall.jpg') ;

vp_y = getVanishingPoint_shell(im,0);
vp_z = getVanishingPoint_shell(im,0);
vp_x = getVanishingPoint_shell(im,0);

%horizon line
%choose x and z to get  the horizon line
plot([vp_z(1) vp_x(1)], [vp_z(2) vp_x(2)], 'r')
horizon = real(cross(vp_z', vp_x'));
length = sqrt(horizon(1)^2 + horizon(2)^2);
horizon = horizon/length;

% select pedestrian 1st  select light and pork hall 2nd and 3rd.
% 1st pedestrian 2nd light 3 hall
lines = zeros(3, 0);
selpos = zeros(3, 0);

while 1
    disp(' ')
    disp('Click first point or q to finish one object ,click e to finish selection bottom points frist')
    [x1,y1,b] = ginput(1);  
    selpos(:, end+1) = [x1,y1,1];
    if b=='q'        
      break;

    end
    disp('Click second point');
    [x2,y2] = ginput(1);
    selpos(:, end+1) = [x2,y2,1];
    plot([x1 x2], [y1 y2], 'b');
    lines(:, end+1) = real(cross([x1 y1 1]', [x2 y2 1]'));
end
  
%hall
%cal intersection between pedestrian->light and horizon
  hegiht_l = cal_height(selpos(:,1:4),lines(:,1:2),horizon,vp_z,170.0);
  hegiht_h = cal_height([selpos(:,1),selpos(:,2),selpos(:,5),selpos(:,6)],lines(:,2:3),horizon,vp_z,170.0);
  
  text(selpos(1,2),selpos(2,2),num2str(170),'HorizontalAlignment','center','VerticalAlignment','middle');
  text(selpos(1,4),selpos(2,4),num2str(hegiht_l),'HorizontalAlignment','center','VerticalAlignment','middle');
  text(selpos(1,6),selpos(2,6),num2str(hegiht_h),'HorizontalAlignment','center','VerticalAlignment','middle');
   
