/**
 * Created by stone on 2/3/2017.
 */
///<reference path="datadef.js" />

class Material
{
    constructor(a,d,s,n)
    {
        this.a = a;
        this.d = d;
        this.s = s;
        this.n = n;
    }
}


class Sphere
{
    constructor(c,r,m)
    {
        this.c = c;
        this.r = r;
        this.m = m;
    } // end Color constructor
}


class Cube
{
    constructor(c,r)
    {
        this.c = c;
        this.r = r;
        calvertex();
        caltriangles();
    }

    calvertex()
    {
        this.pnts = new Array(); //top to bottom
        this.pnts[0] = new Vector(this.c[0]-this.r,this.c[1]+this.r,this.c[2]-this.r);
        this.pnts[1] = new Vector(this.c[0]+this.r,this.c[1]+this.r,this.c[2]-this.r);
        this.pnts[2] = new Vector(this.c[0]+this.r,this.c[1]+this.r,this.c[2]+this.r);
        this.pnts[3] = new Vector(this.c[0]-this.r,this.c[1]+this.r,this.c[2]+this.r);

        this.pnts[4] = new Vector(this.c[0]-this.r,this.c[1]-this.r,this.c[2]-this.r);
        this.pnts[5] = new Vector(this.c[0]+this.r,this.c[1]-this.r,this.c[2]-this.r);
        this.pnts[6] = new Vector(this.c[0]+this.r,this.c[1]-this.r,this.c[2]+this.r);
        this.pnts[7] = new Vector(this.c[0]-this.r,this.c[1]-this.r,this.c[2]+this.r);
    }

    caltriangles()
    {
        this.tris = new Array();
        this.tris[0] = new Vector(0,1,3);
        this.tris[1] = new Vector(1,2,3);  //top
        //this.tris[2] = new Vector(0,4,5);
        //this.tris[3] = new Vector(4,5,1);  //front dont draw the front side
        this.tris[4] = new Vector(1,5,6);
        this.tris[5] = new Vector(6,2,1); //right
        this.tris[6] = new Vector(2,6,7);
        this.tris[7] = new Vector(6,7,3); //back
        this.tris[8] = new Vector(3,0,4);
        this.tris[9] = new Vector(0,4,7); //left
        this.tris[10] = new Vector(4,5,6);
        this.tris[11] = new Vector(5,6,7); //bottom
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