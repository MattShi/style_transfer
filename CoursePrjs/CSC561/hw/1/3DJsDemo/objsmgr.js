/**
 * Created by matt on 9/14/16.
 */
///<reference path="light.js" />
///<reference path="ray.js" />

class ObjsMgr
{
    constructor(objs)
    {
        this.objs = objs;
    }


    detectone(vfrom,vlightlocation,obj)
    {
        var vray = new Ray(vfrom,minus(vlightlocation,vfrom));
        var vmax = 1;
        if(0 != vlightlocation.a)
        {
            vmax = (vlightlocation.a - vfrom.a)/vray.direction().a;
        }
        else if(0 != vlightlocation.b)
        {
            vmax = (vlightlocation.b - vfrom.b)/vray.direction().b;
        }
        else if(0 != vlightlocation.c)
        {
            vmax = (vlightlocation.c - vfrom.c)/vray.direction().c;
        }


        return checkhittingtimes(vray,obj,g_minnum_zero,vmax);
    }

    detectmutilhitting(objidx,vp,lgts)
    {
        var vreturnlights = new Array();
        var vlgtsize = lgts.length;
        while(vlgtsize > 0)
        {
            var vmax = 2;
            var vtmp = vmax;

            vlgtsize--;

            var vobjsize = this.objs.length;
            var vvisible = 1;
            while(vobjsize > 0)
            {
                vobjsize --;
                if(objidx == vobjsize)
                {
                    continue;
                }

                vtmp = this.detectone(vp,lgts[vlgtsize].location,this.objs[vobjsize]);
                if (vtmp >= 2)           //if the light can arrive at the object, there should have no more than 1 root which is between[0,1]
                {
                    vvisible = 0;
                    break;
                }
            }
            if(vvisible == 1)
            {
                vreturnlights.push(lgts[vlgtsize]);
            }

        }
        return vreturnlights;
    }
}
