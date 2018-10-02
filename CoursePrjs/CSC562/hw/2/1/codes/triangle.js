/**
 * Created by stone on 15/09/2016.
 */
///<reference path="vector3.js" />
///<reference path="ray.js" />
/*
this part from http://www.cs.virginia.edu/~gfx/Courses/2003/ImageSynthesis/papers/Acceleration/Fast%20MinimumStorage%20RayTriangle%20Intersection.pdf
in this passage,it shows how to decide whether a line and a triangle is intersect.
just use the algorithm ,not codes
* */
class TriangleObj
{
    constructor(pts,triangles)
    {
        this.pts = pts;
        this.triangles = triangles;
    }

    setMaterial(m)
    {
        this.materials = m;
    }

    hittriangle(r,vvertexs)
    {

        var ve1 = minus(this.pts[vvertexs.b],this.pts[vvertexs.a]);
        var ve2 = minus(this.pts[vvertexs.c],this.pts[vvertexs.a]);
        var vt = minus(r.ray_start,this.pts[vvertexs.a]);
        var vp = cross(r.ray_direction,ve2);
        var vq = cross(vt,ve1);
        var vpe1 = dot(vp,ve1);
        var vu = dot(vp,vt)/vpe1;
        var vv = dot(vq,r.ray_direction)/vpe1;


        if( (vu > g_minnum_zero ) && (vv > g_minnum_zero) && ((vu + vv ) < 1))
        {
            this.hitedtriangle = vvertexs;
            var vintersect = dot(vq ,ve2)/vpe1;
            return vintersect;
        }
        else
        {
            return g_location_farthest;
        }

    }

    checkhittingtimes(r,minnum, maxnum)
    {
        return 0;
        var ve2 = minus(this.pts[vvertexs.c],this.pts[vvertexs.a]);
        var vt = minus(r.ray_start,this.pts[vvertexs.a]);
        var vp = cross(r.ray_direction,ve2);
        var vq = cross(vt,ve1);
        var vpe1 = dot(vp,ve1);
        var vu = dot(vp,vt)/vpe1;
        var vv = dot(vq,r.ray_direction)/vpe1;


        if( (vu < g_minnum_zero ) || (vv < g_minnum_zero))
        {
;
            return 0;
        }
        var vroot = 1 - (vv + vu);
    }


    hitChecking(r)
    {
        try
        {
            var vpntsize = this.pts.length;
            var vtrianglesize = this.triangles.length;
            var vmin = g_location_farthest;

            while(vtrianglesize > 0)
            {
                vtrianglesize--;
                var vtmp = this.hittriangle(r,this.triangles[vtrianglesize]);
                if(vtmp < vmin)
                {
                    vmin = vtmp;
                }

            }
            return vmin;
        }
        catch(e)
        {
            console.log(e);
        }

    }

    setrendertag()
    {
        this.renderparam = this.hitedtriangle;
    }

    getnormalat(vp)
    {
        try
        {
            var vv = minus(this.pts[this.renderparam.b],this.pts[this.renderparam.a]);
            var vw = minus(this.pts[this.renderparam.c],this.pts[this.renderparam.a]);
            var vnormal = cross(vw,vv);
            return unit_vector3(vnormal);
        }
        catch (e)
        {
            console.log(e);
        }

    }

    getrandomvalue()
    {
        return (Math.random()*2 -1);
    }

    getrandomdirection(ppos,indrection)
    {
        var vn = this.getnormalat(ppos);
        var vx = this.getrandomvalue();
        var vy = 1 - Math.abs(vx);
        if((vx*vx + vy*vy) > 1)
        {
          return this.getrandomdirection(ppos);
        }
        var vz = Math.sqrt(1 - (vx*vx + vy*vy));
        var vdirection = new Vector3(vx,vy,vz);
        return vdirection;
    }

}