// JavaScript source code
class Vector3
{
    constructor(a,b,c)
    {
        try
        {
            if ((typeof(a) !== "number")  || (typeof(b) !== "number") || (typeof(c) !== "number"))
            {
                throw "vector3 component not a number";
            }
            else
            {
                this.a = a;
                this.b = b;
                this.c = c;
                this.len_squa = this.a * this.a + this.b * this.b + this.c * this.c;
                this.len = Math.sqrt(this.len_squa);
            }
        }
        catch (e)
        {
            console.log(e);
        }

    }

    length(){
        return this.len;
    }

    suard_length()
    {
        return this.len_squa;
    }


    product_number(f)
    {
        return simplify(new vector3(t*this.a,t*this.b,t*this.c));
    }
}

function simplify(v)
{
    if((v.a < g_minnum_zero) && (v.a > -g_minnum_zero))
    {
        v.a = 0;
    }
    if((v.b < g_minnum_zero) && (v.b > -g_minnum_zero))
    {
        v.b = 0;
    }
    if((v.c < g_minnum_zero) && (v.c > -g_minnum_zero))
    {
        v.c = 0;
    }
    return new Vector3(v.a,v.b,v.c);

}

function dot( v1, v2)
{
    try
    {

        return v1.a*v2.a + v1.b*v2.b + v1.c*v2.c;

    }
    catch(e) {
        console.log(e);
    }
}

function cross(v1, v2)
{
    try
    {

        return simplify(new Vector3((v1.b * v2.c - v1.c * v2.b), -(v1.a * v2.c - v1.c * v2.a), (v1.a * v2.b - v1.b * v2.a)));

    }
    catch(e) {
        console.log(e);
    }
}

function product(v1,v2)
{
    return simplify(new Vector3(v1.a*v2.a,v1.b*v2.b,v1.c*v2.c));
}

function add(v1,v2)
{
    try
    {

        return simplify(new Vector3(v1.a+v2.a,v1.b+v2.b,v1.c+v2.c));

    }
    catch(e) {
        console.log(e);
    }
}

function add3(v1,v2,v3)
{
    try
    {

        return simplify(new Vector3(v1.a+v2.a+v3.a,v1.b+v2.b+v3.b,v1.c+v2.c+v3.c));

    }
    catch(e) {
        console.log(e);
    }
}

function minus(v1,v2)
{
    try
    {

        return simplify(new Vector3(v1.a-v2.a,v1.b-v2.b,v1.c-v2.c));
    }
    catch(e) {
        console.log(e);
    }
}

function dotnum(v1,f)
{
    try
    {

        return simplify(new Vector3(v1.a*f,v1.b*f,v1.c*f));
    }
    catch(e) {
        console.log(e);
    }
}

function trans_vector(v1)
{
    return new Vector3(-v1.a,-v1.b,-v1.c);

}


function unit_vector3(v)
{
    try
    {

            var length = v.length();
            if (length > 0)
            {
                return simplify(new Vector3(v.a / length, v.b / length, v.c / length));
            }
            else
            {
                return new Vector3(Math.sqrt(3) / 3, Math.sqrt(3) / 3, Math.sqrt(3) / 3);
            }
    }
    catch(e) {
        console.log(e);
    }
}

/*http://hotmath.com/hotmath_help/topics/adding-and-subtracting-vectors.html*/

function get_cosin(v1,v2)
{
    return dot(v1,v2)/(v1.length()*v2.length());
}

/////////////////////////////////////////////////////////////////
