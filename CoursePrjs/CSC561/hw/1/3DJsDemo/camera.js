/**
 * Created by fangyuan shi on 10/09/2016.
 */
///<reference path="vector3.js" />
///<reference path="ray.js" />

class Camera
{
    constructor(vlookfrom,vup,vlookat,horizonlength,verticallength,fviewangle,fscale)
    {
        try
        {

            this.view_wndwidth_px = horizonlength;
            this.view_wndheight_pix = verticallength;

            this.lookfrom = vlookfrom;
            this.vlookat = vlookat;
            this.vdirection = unit_vector3(minus(vlookat,vlookfrom));
            this.vup = vup;

            this.vu = unit_vector3(cross(this.vup,this.vdirection));  /*like x axis*/
            this.vv = unit_vector3(cross(this.vdirection,this.vu)); /*like y axis*/

            this.view_wndcenter = add(this.lookfrom, dotnum(this.vdirection,g_setting_closest_distance));

            var vangle = fviewangle*3.14159/180;
            var vhaflhegiht = g_setting_closest_distance*Math.tan(vangle/2);

            this.view_wndunitratio = 1.0; /*the height normally  is 1.0, but can be more bigger or smaller*/
            this.view_wndwidth2height = fscale; /*the width / height 1.0 is square but can be rectangle*/

            this.view_wndheight = 2*vhaflhegiht;
            this.view_wndwidth = this.view_wndwidth2height*this.view_wndheight;

            var voffset = add(dotnum(this.vu,this.view_wndwidth/2),dotnum(this.vv,this.view_wndheight/2));
            this.view_leftcorner = minus(this.view_wndcenter ,voffset);

        }
        catch (e)
        {
            console.log(e);
        }
    }


    /*vx,vy window pixel 0,o at the top left corner*/
    getRay(vx,vy)
    {
        var vheight = this.view_wndunitratio*(1 - vy/this.view_wndheight_pix);   /*y*/
        var vwidth = this.view_wndunitratio*this.view_wndwidth2height*vx/this.view_wndwidth_px;  /*x*/

        return new Ray(this.lookfrom, unit_vector3(minus(add3(this.view_leftcorner,dotnum(this.vv,vheight),dotnum(this.vu,vwidth)),this.lookfrom)));
    }
}

