/**
 * Created by F on 10/10/2016.
 */

class Material
{
    constructor(ambient,diff,specular,spfactor)
    {
        this.amb = ambient;
        this.dif = diff;
        this.spc = specular;
        this.spf = spfactor;
    }
}

class Light
{
    constructor(pos,acolor,dcolor,scolor)
    {
        this.pos = pos;
        this.amb_color = acolor;
        this.dif_color = dcolor;
        this.spc_color = scolor;
    }
}

class Sphere
{
    constructor(c,r)
    {
        this.c = c;
        this.r = r;
    }
    
    setMaterial(m)
    {
        this.m = m;
    }
}
