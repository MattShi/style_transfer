% open pic
im = imread('Labspace.jpg') ;
%getVanishingPoint_shell(im);
%http://math.stackexchange.com/questions/404440/what-is-the-equation-for-a-3d-line

vp_y = getVanishingPoint_shell(im);
vp_z = getVanishingPoint_shell(im);
vp_x = getVanishingPoint_shell(im);

%horizon line
%choose x and z to get  the horizon line
plot([vp_z(1) vp_x(1)], [vp_z(2) vp_x(2)], 'r')
horizon = real(cross(vp_z', vp_x'));
length = sqrt(horizon(1)^2 + horizon(2)^2);
horizon = horizon/length;

%camera calibration
%The orthocenter of the
%triangle with vertexes in the three vanishing points is
%the intersection of the optical axis and the image plane.
syms u v;
[u_sol, v_sol] = solve((u - vp_y(1))*(vp_z(1) - vp_x(1)) + (v - vp_y(2))*(vp_z(2) - vp_x(2)) == 0, (u - vp_z(1))*(vp_y(1) - vp_x(1)) + (v - vp_z(2))*(vp_y(2) - vp_x(2)) == 0);

%ox * oy = 0
syms f;
[f_sol] = solve((u_sol - vp_x(1))*(u_sol - vp_y(1)) + (v_sol - vp_x(2))*(v_sol - vp_y(2)) + f*f == 0);

f = double(f_sol);
f = f(1);
u = double(u_sol);
v = double(v_sol);


%part C
height_p = 170;


