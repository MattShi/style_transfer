/**
 * Created by stone on 10/09/2016.
 */
///<reference path="vector3.js" />

class sphere
{
    constructor(c,r)
    {
        try
        {
            if (typeof(r) !== "number")
            {
                throw "invalid component r";
            }
            else
            {
                this.center =  c;
                this.radius = r;
            }
        }
        catch (e)
        {
            console.log(e);
        }

    }



    getColorAt(p)
    {
        return new color(255,0,0);
    }


    getnormalat(vp)
    {

        var vm = minus(vp,this.center);
        return unit_vector3(vm);
    }


    setMaterial(m)
    {
        this.materials = m;
    }


    hitChecking(r)
    {
        try
        {
            var oc = minus(r.start(),this.center);
            var a = r.direction().suard_length();
            var b = 2*dot(r.direction(),oc);
            var c = oc.suard_length() - this.radius*this.radius;
            var k = b*b - 4*a*c;
            if(k >= g_minnum_zero)
            {
                var sk = Math.sqrt(k);
                var vroot1 = (-b-sk)/(2*a);
                var vroot2 = (-b+sk)/(2*a);

                if((vroot1  < g_minnum_zero) && (vroot2 < g_minnum_zero)) //
                {
                    if(1 == g_debugoutput_enable)
                    {
                        console.log("tow intersections are behind the eye");
                    }
                    return 1048576;
                }
                else if(vroot1 >= g_minnum_zero)
                {
                    return vroot1;
                }
                else
                {
                    if(1 == g_debugoutput_enable)
                    {
                        console.log("tow intersections,but one is behind the eye");
                    }

                    return vroot2;
                }

            }
            else
            {
                return 1048576;

            }
        }
        catch (e)
        {
            console.log(e);
        }
    }

    checkhittingtimes(r, minnum, maxnum)
    {
        try
        {
            var oc = minus(r.start(),this.center);
            var a = r.direction().suard_length();
            var b = 2*dot(r.direction(),oc);
            var c = oc.suard_length() - this.radius*this.radius;
            var k = b*b - 4*a*c;
            var vreturn = 0;
            if(k < g_minnum_zero)
            {
                return vreturn;
            }
            else if(k == 0)
            {
                return 1;
            }
            else
            {

                var sk = Math.sqrt(k);
                var vroot1 = (-b-sk)/(2*a);
                var vroot2 = (-b+sk)/(2*a);


                if((vroot2 < maxnum) && (vroot2 > minnum))
                {
                    return 2;
                }
                else
                {
                    return 1;
                }



            }
        }
        catch (e)
        {
            console.log(e);
        }
    }

    setrendertag()
    {

    }


}