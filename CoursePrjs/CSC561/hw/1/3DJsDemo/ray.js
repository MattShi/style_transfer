/**
 * Created by stone on 10/09/2016.
 */
///<reference path="vector3.js" />
///<reference path="sphere.js" />


class Ray
{
    constructor(start,direction)
    {
        try
        {

            this.ray_start = start;
            this.ray_direction = unit_vector3(direction);
        }
        catch (e)
        {
            console.log(e);
        }
    }


    start()
    {
        return this.ray_start;
    }

    direction()
    {
        return this.ray_direction;
    }

    getPointAt(t)
    {
        try
        {
            if((typeof(t) !== "number"))
            {
                throw "invalid components";
            }
            else
            {
                return add(this.ray_start ,dotnum(this.ray_direction,t));
            }
        }
        catch (e)
        {
            console.log(e);
        }
    }
}


function checkhittingtimes(r, obj, minnum, maxnum)
{
    try
    {
        if(( "sphere" == obj.constructor.name)
        || ("TriangleObj" == obj.constructor.name))

        {
            return obj.checkhittingtimes(r,minnum, maxnum);
        }

        else
        {
            return 0;
0       }

    }
    catch (e)
    {
        console.log(e);
    }

}


function hitChecking(r,obj)
{
    try
    {
        if(( "sphere" == obj.constructor.name)
            || ("TriangleObj" == obj.constructor.name))

        {
            return obj.hitChecking(r);
        }
        else
        {
            return g_location_farthest;
        }

    }
    catch (e)
    {
        console.log(e);
    }
}
