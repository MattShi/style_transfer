/**
 * Created by F on 10/10/2016.
 */

class Texture
{
    constructor(u,v)
    {
        this.u = u;
        this.v = v;
    }
}

class Material
{
    constructor(ambient,diff,specular,spfactor,trans,picutre)
    {
        this.amb = ambient;
        this.dif = diff;
        this.spc = specular;
        this.spf = spfactor;
        this.tra = trans;
        this.pic = picutre;
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
    constructor(vpnts,vtriangles,vnormal,vVUS,center)
    {
        this.buf_pnts = vpnts;
        this.buf_trgs = vtriangles;
        this.buf_normal = vnormal;
        this.buf_center = center;
        this.buf_vus = vVUS;
    }
    
    setMaterial(m)
    {
        this.material = m;
    }
}
