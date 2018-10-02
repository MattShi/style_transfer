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

class Objectdata
{
    constructor(vpnts,vtriangles,vnormal,center)
    {
        this.buf_pnts = vpnts;
        this.buf_trgs = vtriangles;
        this.buf_normal = vnormal;
        this.buf_center = center;
    }
    
    setMaterial(m)
    {
        this.material = m;
    }
}
