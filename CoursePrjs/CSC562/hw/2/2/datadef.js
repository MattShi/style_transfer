/**
 * Created by F on 10/10/2016.
 */

class Frameinfo
{
    constructor(s)
    {
        this.s = s;
        this.at = [];
        this.all = 0;
    }
    pushdata(t)
    {
        this.at.push(t);
        this.all += t;
        if(this.at.length > this.s)
        {
            this.all -= this.at.shift();
        }
        return Math.round(this.all /this.at.length);
    }


}

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
    constructor(vpnts,vtriangles,vnormal,vVUS)
    {
        this.buf_pnts = vpnts;
        this.buf_trgs = vtriangles;
        this.buf_normal = vnormal;
        this.buf_vus = vVUS;
    }
    
    setMaterial(m)
    {
        this.material = m;
    }
}

class Cell
{
    constructor(l,r,b,f,i)
    {
        //front bottom right back left top
        this.l = l;
        this.r = r;
        this.b = b;
        this.f = f;
        this.objs = [];
        this.render_objs = [];
        this.sx = 0.1;
        this.sz = 0.1;
        this.rid = i;
        this.sy = 2;
        this.attachobj = null;

        this.r_x = 0;
        this.r_y = 0;
        this.r_z = 0;
        this.rendered = 0;
        this.connectroom = [];
    }

    isvalid()
    {
        return ((this.attachobj != null) || (this.rid === 's') || (this.rid === 'p'));
    }

    setpos(x,y,z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getpos()
    {
        return {"x":this.x,"y":this.y,"z":this.z};
    }

    getcenterpos()
    {
        return [this.x + this.sx*0.5, this.y + this.sy*0.5,this.z + this.sz*0.5];
    }

    getsize()
    {
        return [this.sx/2,this.sy/2,this.sz/2];
    }

    setscale(sx,sy,sz)
    {
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
    }

    updatepntspos()
    {
        try
        {
            for (var vrender = 0 ; vrender < this.render_objs.length; vrender++)
            {
                this.render_objs[vrender].buf_pnts[0] = this.sx*this.render_objs[vrender].buf_pnts[0] + this.x;
                this.render_objs[vrender].buf_pnts[3] = this.sx*this.render_objs[vrender].buf_pnts[3] +this.x;
                this.render_objs[vrender].buf_pnts[6] = this.sx*this.render_objs[vrender].buf_pnts[6] +this.x;
                this.render_objs[vrender].buf_pnts[9] = this.sx*this.render_objs[vrender].buf_pnts[9] +this.x;
                this.render_objs[vrender].buf_pnts[1] = this.sy*this.render_objs[vrender].buf_pnts[1] +this.y;
                this.render_objs[vrender].buf_pnts[4] = this.sy*this.render_objs[vrender].buf_pnts[4] +this.y;
                this.render_objs[vrender].buf_pnts[7] = this.sy*this.render_objs[vrender].buf_pnts[7] +this.y;
                this.render_objs[vrender].buf_pnts[10] = this.sy*this.render_objs[vrender].buf_pnts[10] +this.y;
                this.render_objs[vrender].buf_pnts[2] = this.sz*this.render_objs[vrender].buf_pnts[2] +this.z;
                this.render_objs[vrender].buf_pnts[5] = this.sz*this.render_objs[vrender].buf_pnts[5] +this.z;
                this.render_objs[vrender].buf_pnts[8] = this.sz*this.render_objs[vrender].buf_pnts[8] +this.z;
                this.render_objs[vrender].buf_pnts[11] = this.sz*this.render_objs[vrender].buf_pnts[11] +this.z;
            }
        }
        catch(e)
        {

        }
    }

    setobjs(objs)
    {
        this.objs = objs;
        if(this.rid === 's')
        {
            this.render_objs.push(objs[0]);
            this.render_objs.push(objs[2]);
            this.render_objs.push(objs[3]);
            this.render_objs.push(objs[4]);
        }
        this.updatepntspos();
    }

    getobjs()
    {
        return this.objs;
    }

    getrenderobjs()
    {
        return this.render_objs;
    }

    setconnectroom(a)
    {
        if(a != "s")
        {
            this.connectroom.push(a);
        }
    }

}


class Furniture
{
    constructor(rid,x,y,z,type,idx)
    {
        this.rid = rid;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.idx = idx;
        this.r = false;
    }
    setrenderable(r)
    {
        this.r = r;
    }
}


class RoomInfo
{
    constructor(id)
    {
        this.id = id;
        this.cells = [];
    }
    sets(s)
    {
        this.s =s;
    }
    sete(e)
    {
        this.e = e;
    }
    getcenterpos()
    {
        return [Math.floor((this.s[0]+this.e[0])/2),Math.floor((this.s[1]+this.e[1])/2),Math.floor((this.s[2]+this.e[2])/2)];
    }
    addcell(p)
    {
        this.cells.push(p);
    }

}

class Octtree
{
    constructor(s,e)
    {
        this.s = s;
        this.e = e;
        this.lt = null;
        this.rt = null;
        this.lb = null;
        this.rb = null;
        this.isleaf = false;
    }
    setlt(lt)
    {
        this.lt = lt;
    }
    setrt(rt)
    {
        this.rt = rt;
    }
    setlb(lb)
    {
        this.lb = lb;
    }
    setrb(rb)
    {
        this.rb = rb;
    }
    setcenter(c)
    {
        this.c = c;
    }
    getcenter()
    {
        return this.c;
    }
    setisleaf(isleaf)
    {
        this.isleaf = isleaf;
    }
    getisleaf()
    {
        return this.isleaf;
    }
}

/*http://blog.csdn.net/liuchuang_mfc/article/details/49834681
 http://www.rastertek.com/dx11tut16.html
* */
function getfrustumplanes(proj,viewmtx)
{
    var   clip = new Array(16);

    clip[ 0] = viewmtx[ 0] * proj[ 0] + viewmtx[ 1] * proj[ 4] + viewmtx[ 2] * proj[ 8] + viewmtx[ 3] * proj[12];
    clip[ 1] = viewmtx[ 0] * proj[ 1] + viewmtx[ 1] * proj[ 5] + viewmtx[ 2] * proj[ 9] + viewmtx[ 3] * proj[13];
    clip[ 2] = viewmtx[ 0] * proj[ 2] + viewmtx[ 1] * proj[ 6] + viewmtx[ 2] * proj[10] + viewmtx[ 3] * proj[14];
    clip[ 3] = viewmtx[ 0] * proj[ 3] + viewmtx[ 1] * proj[ 7] + viewmtx[ 2] * proj[11] + viewmtx[ 3] * proj[15];

    clip[ 4] = viewmtx[ 4] * proj[ 0] + viewmtx[ 5] * proj[ 4] + viewmtx[ 6] * proj[ 8] + viewmtx[ 7] * proj[12];
    clip[ 5] = viewmtx[ 4] * proj[ 1] + viewmtx[ 5] * proj[ 5] + viewmtx[ 6] * proj[ 9] + viewmtx[ 7] * proj[13];
    clip[ 6] = viewmtx[ 4] * proj[ 2] + viewmtx[ 5] * proj[ 6] + viewmtx[ 6] * proj[10] + viewmtx[ 7] * proj[14];
    clip[ 7] = viewmtx[ 4] * proj[ 3] + viewmtx[ 5] * proj[ 7] + viewmtx[ 6] * proj[11] + viewmtx[ 7] * proj[15];

    clip[ 8] = viewmtx[ 8] * proj[ 0] + viewmtx[ 9] * proj[ 4] + viewmtx[10] * proj[ 8] + viewmtx[11] * proj[12];
    clip[ 9] = viewmtx[ 8] * proj[ 1] + viewmtx[ 9] * proj[ 5] + viewmtx[10] * proj[ 9] + viewmtx[11] * proj[13];
    clip[10] = viewmtx[ 8] * proj[ 2] + viewmtx[ 9] * proj[ 6] + viewmtx[10] * proj[10] + viewmtx[11] * proj[14];
    clip[11] = viewmtx[ 8] * proj[ 3] + viewmtx[ 9] * proj[ 7] + viewmtx[10] * proj[11] + viewmtx[11] * proj[15];

    clip[12] = viewmtx[12] * proj[ 0] + viewmtx[13] * proj[ 4] + viewmtx[14] * proj[ 8] + viewmtx[15] * proj[12];
    clip[13] = viewmtx[12] * proj[ 1] + viewmtx[13] * proj[ 5] + viewmtx[14] * proj[ 9] + viewmtx[15] * proj[13];
    clip[14] = viewmtx[12] * proj[ 2] + viewmtx[13] * proj[ 6] + viewmtx[14] * proj[10] + viewmtx[15] * proj[14];
    clip[15] = viewmtx[12] * proj[ 3] + viewmtx[13] * proj[ 7] + viewmtx[14] * proj[11] + viewmtx[15] * proj[15];


    /* Extract the numbers for the RIGHT plane */
    var planes = new Array();

    var vr = [clip[ 3] - clip[ 0],clip[ 7] - clip[ 4],clip[11] - clip[ 8],clip[15] - clip[12]];
    planes.push(vr);

    /* Extract the numbers for the LEFT plane */
    var vl = [clip[ 3] + clip[ 0],clip[ 7] + clip[ 4],clip[11] + clip[ 8],clip[15] + clip[12]];
    planes.push(vl);

    /* Extract the BOTTOM plane */
    var vb = [clip[ 3] + clip[ 1],clip[ 7] + clip[ 5],clip[11] + clip[ 9],clip[15] + clip[13]];
    planes.push(vb);

    /* Extract the TOP plane */
    var vt =  [clip[ 3] - clip[ 1],clip[ 7] - clip[ 5],clip[11] - clip[ 9],clip[15] - clip[13]];
    planes.push(vt);

    /* Extract the FAR plane */
    var vf =  [clip[ 3] - clip[ 2],clip[ 7] - clip[ 6],clip[11] - clip[10],clip[15] - clip[14]];
    planes.push(vf);

    /* Extract the NEAR plane */
    var ve =  [ clip[ 3] + clip[ 2],clip[ 7] + clip[ 6],clip[11] + clip[10],clip[15] + clip[14]];
    planes.push(ve);

    return planes;
}

function planesdotpoint(vplane,vp)
{
    return  vplane[0]*vp[0] + vplane[1]*vp[1] + vplane[2]*vp[2] + vplane[3]*1;
}

function checkpntisinsideofplanes(planes,p)
{
    for(var viplane =0; viplane < planes.length; viplane++)
    {
        if(planesdotpoint(planes[viplane],p[0],p[1],p[2]) < 0)
        {
            return false;
        }
    }
    return true;
}

function checkcellisvisible(planes,x,y,z,xlen,ylen,zlen)
{
    for(var viplane =0; viplane < planes.length; viplane++)
    {
        if(planesdotpoint(planes[viplane], [(x - xlen), (y - ylen), (z - zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane],[(x + xlen), (y - ylen), (z - zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane],[(x - xlen), (y + ylen), (z - zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane],[(x - xlen), (y - ylen), (z + zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane], [(x + xlen), (y + ylen), (z - zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane], [(x + xlen), (y - ylen), (z + zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane], [(x - xlen), (y + ylen), (z + zlen)]) >= 0.0)
        {
            continue;
        }

        if(planesdotpoint(planes[viplane],[(x + xlen), (y + ylen), (z + zlen)]) >= 0.0)
        {
            continue;
        }

        return false;
    }

    return true;
}

