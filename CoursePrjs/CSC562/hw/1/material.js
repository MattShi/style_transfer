/**
 * Created by stone on 12/09/2016.
 */

///<reference path="lights.js" />



class Ambient
{
    constructor(/*l,*/k)
    {
        try
        {
            this.k = k;/* k is a vector ,separately on  R G B ,Coefficient */
            /*this.l = l;*//* l is a vector  of g_lights,separately on  R G B,intensities*/
        }
        catch(e) {
            console.log(e);
        }
    }

    K()
    {
        return this.k;
    }

    /*
    L()
    {
        return this.l;
    }
    */

    getPixelColor(lgts,vp,obj,cam)
    {
        var vrtcolor = new Vector3(0,0,0);
        var vsize = lgts.length;
        while(vsize > 0)
        {
            vsize--;
            vrtcolor = add(vrtcolor,product(product(this.k,lgts[vsize].amb),lgts[vsize].color));
        }
        return vrtcolor;
    }
}

class Diffuse
{
    constructor(k)
    {
        try
        {
            this.k = k; /* k is a vector ,separately on  R G B*/
        }
        catch(e) {
            console.log(e);
        }
    }

    K()
    {
        return this.k;
    }


    getPixelColor(lgts,vp,obj,cam)
    {
        var vrtcolor =  new Vector3(0,0,0);
        var vtemp = vrtcolor;

        var vpnoraml = obj.getnormalat(vp);
        var vsize = lgts.length;
        while(vsize > 0)
        {
            vsize--;
            var vcosin = get_cosin(vpnoraml,unit_vector3(minus(lgts[vsize].location, vp)));
            if (vcosin > 0)
            {
                vtemp = dotnum(product(this.k,lgts[vsize].color),vcosin);
                vrtcolor = add(vrtcolor,vtemp);
            }
        }
        return vrtcolor;
    }

    getcolorByBRDF(lgts,vp,obj,cam)
    {
        var vrtcolor =  new Vector3(0,0,0);
        var vtemp = vrtcolor;

        var vpnoraml = obj.getnormalat(vp);
        var vsize = lgts.length;
        while(vsize > 0)
        {
            vsize--;
            var vcosin = get_cosin(vpnoraml,unit_vector3(minus(lgts[vsize].location, vp)));
            if (vcosin > 0)
            {
                vtemp = dotnum(product(this.k,lgts[vsize].color),vcosin);
                vrtcolor = add(vrtcolor,vtemp);
            }
        }
        return vrtcolor;
    }
}

class Specular
{
    constructor(k,m)
    {
        try
        {
            this.k = k;
            this.m = m;
        }
        catch(e)
        {
            console.log(e);
        }
    }

    K()
    {
        return this.k;
    }

    M()
    {
        return this.m;
    }

    getPixelColor(lgts,vp,obj,cam)
    {
        var vrtcolor =  new Vector3(0,0,0);
        var vtemp = vrtcolor;
        var vpnormal = obj.getnormalat(vp);

        var vsize = lgts.length;
        while(vsize > 0)
        {
            vsize--;
            var lgtdirection = unit_vector3(minus(lgts[vsize].location, vp));
            var vspec = minus(dotnum(dotnum(vpnormal,dot(vpnormal,lgtdirection)),2),lgtdirection);
            vtemp = dotnum(product(this.k,lgts[vsize].color),(Math.pow(dot(vspec,unit_vector3(minus(cam.lookfrom,vp))),this.m)));
            if(vtemp.a < 0)
            {
                vtemp.a = 0;
            }
            if(vtemp.b < 0)
            {
                vtemp.b = 0;
            }
            if(vtemp.c < 0)
            {
                vtemp.c = 0;
            }
            vrtcolor = add(vrtcolor,vtemp);
        }
        return vrtcolor;
    }
}


class Material
{
    constructor(vamk,lts,vdif,vspc,m)
    {
        try
        {
            this.ambient = new Ambient(/*l.value,*/vamk);
            this.diffuse = new Diffuse(vdif);
            this.specular = new Specular(vspc,m);
            this.lights = lts;
        }
        catch(e)
        {
            console.log(e);
        }
    }



    getPixelColor(vp,obj,cam,lgts)
    {
        var vcolor = new Vector3(0,0,0);
        if(0 == g_localillumination_enable)
        {
            vcolor = product(this.diffuse.k,new Vector3(255,255,255));
            return vcolor;
        }
        if(1 == g_ambient_enable)
        {
            vcolor = add(vcolor,this.ambient.getPixelColor(this.lights,vp,obj,cam));
        }
        if(1 == g_diffuse_enable)
        {
            vcolor = add(vcolor,this.diffuse.getPixelColor(lgts,vp,obj,cam));
        }
        if(1 == g_specular_enable)
        {
            vcolor = add(vcolor,this.specular.getPixelColor(lgts,vp,obj,cam));
        }
        return vcolor;
    }

    getPixelColorg(vp,obj,cam,lgts,alllgts)
    {
        var vcolor = new Vector3(0,0,0);
        if(0 == g_localillumination_enable)
        {
            vcolor = product(this.diffuse.k,new Vector3(255,255,255));
            return vcolor;
        }
        if(1 == g_ambient_enable)
        {
            add(vcolor,this.ambient.getPixelColor(alllgts,vp,obj,cam));
        }
        if(1 == g_diffuse_enable)
        {
            vcolor = add(vcolor,this.diffuse.getPixelColor(lgts,vp,obj,cam));
        }
        if(1 == g_specular_enable)
        {
            vcolor = add(vcolor,this.specular.getPixelColor(lgts,vp,obj,cam));
        }
        return vcolor;
    }

    getPixelColor_reflect(vp,obj,cam,visiblelights)
    {
        var c = new Vector3(0,0,0); // init the sphere color to black
        c =  this.diffuse.getPixelColor(visiblelights,vp,obj,cam);

        return(c);
    }
}
