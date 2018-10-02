/**
 * Created by matt on 12/3/16.
 */
///<reference path="js/three.js" />
class CarInfo
{
    constructor(c,s,i)
    {
        this.c = c; //color
        this.s = s; //speed
        this.i = i; //id to object
        this.fs = 1.0;//
        this.running = true;
    }

}

class LogInfo
{
    constructor(c,s,i)
    {
        this.c = c; //color
        this.s = s; //speed
        this.i = i; //id to object
        this.fs = 1.0; //factor on s
        this.running = true;
    }
}

class FrogAction
{
    constructor(f,v,s)
    {
        this.from = f; //from vector
        this.v = v; // to vector
        this.speed = s; //speed
        this.done = true;
    }

    setsteps(st)
    {
        this.times = st;
        this.remaintimes = 0;
    }

    setfromanddistance(f,v)
    {
        this.from = f;
        this.v = v;
    }

    calcstep()
    {
        this.remaintimes = this.times;
        this.done = false;
        this.step = this.v.divideScalar(this.times);
        if(0 == this.step.lengthSq())
        {
            this.done = true;
        }
    }

    getpos()
    {
       var vt = this.from.add(this.step);
       this.remaintimes --;
       if(this.remaintimes <= 0)
       {
           this.done = true;
       }
       return vt;
    }
}

class Rect
{
    constructor(b,t,l,r)
    {
        this.b = b;
        this.t = t;
        this.l = l;
        this.r = r;
    }
}

class FrogStatus
{
    constructor(s)
    {
        this.s = s;
        this.suc = false;
    }

    loseonechance()
    {
        this.s--;
        this.pause = true;
    }

    recover()
    {
        this.pause = false;
    }

    timesleft()
    {
        return this.s;
    }

    isAlive()
    {
       return (this.s > 0) && (!this.pause);
    }

    setSuc(suc)
    {
        this.suc = suc;
    }

    isSuc()
    {
        return this.suc;
    }
}

class FPSMgr
{
    constructor(g)
    {
        this.g = g;
        this.lst = Date.now();
    }

    shouldRedraw()
    {
        var v = Date.now();
        if(v - this.lst > this.g)
        {
            this.lst = v;
            return true;
        }
        else
        {
            return false;
        }
    }
}

class JumpMgr
{
    constructor()
    {
        this.t = 0;
    }

    startjump(p)
    {
        this.t = 0;
        this.p = p;
        this.pos  = p.clone();
    }

    stopjump()
    {
        this.t = 0;
    }

    getnextpos()
    {
        this.t++;
        return this.t;
    }
}

class ScoreMgr
{
    constructor(st,f)
    {
        this.st = st;
        this.l = 1;  //level
        this.c = 1;  //c times to next level
        this.total = 0;
    }
    setst(st,l)
    {
        this.st = st;
        this.l = l;
    }
    reset()
    {
        this.total = 0;
        this.l = 1;  //level
        this.c = 1;  //c times to next level
        this.total = 0;
    }
    add()
    {
       this.total += (this.st*this.l);
       this.c--;
       if(this.c <= 0)   //new level
       {
           this.c = 1;
           this.l++;
       }
    }
    getscore()
    {
        return this.total;
    }
    getlevel()
    {
        return this.l;
    }

    getspeedfactor()
    {
        return (1 + (this.l -1)/1);
    }


}