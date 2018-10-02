/**
 * Created by stone on 10/09/2016.
 */

///<reference path="vector3.js" />
class color
{
    constructor(r,g,b)
    {
        try
        {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") ||  (typeof(b) !== "number"))
            {
                throw "invalid components";
            }
            else
            {
                this.color_r =r;
                this.color_g =g;
                this.color_b =b;
            }
        }
        catch (e)
        {
            console.log(e);
        }

        toVector3()
        {
            return new Vector3(this.color_r,this.color_g,this.color_b);
        }
    }
    r()
    {
        return r;
    }
    g()
    {
        return g;
    }
    b()
    {
        return b;
    }
}

