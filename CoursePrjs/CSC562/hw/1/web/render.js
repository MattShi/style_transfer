/**
 * Created by stone on 2/8/2017.
 */
/* classes */

// Color class
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this[0] = r; this[1] = g; this[2] = b; this[3] = a;
            }
        } // end try

        catch (e) {
            console.log(e);
        }
    } // end Color constructor

    // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this[0] = r; this[1] = g; this[2] = b; this[3] = a;
            }
        } // end try

        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class

// Vector class
class Vector {
    constructor(x,y,z) {
        this.set(x,y,z);
    } // end constructor

    // sets the components of a vector
    set(x,y,z) {
        try {
            if ((typeof(x) !== "number") || (typeof(y) !== "number") || (typeof(z) !== "number"))
                throw "vector component not a number";
            else
                this.x = x; this.y = y; this.z = z;
        } // end try

        catch(e) {
            console.log(e);
        }
    } // end vector set

    // copy the passed vector into this one
    copy(v) {
        try {
            if (!(v instanceof Vector))
                throw "Vector.copy: non-vector parameter";
            else
                this.x = v.x; this.y = v.y; this.z = v.z;
        } // end try

        catch(e) {
            console.log(e);
        }
    }


    toConsole(prefix) {
        console.log(prefix+"["+this.x+","+this.y+","+this.z+"]");
    } // end to console

    // static dot method
    static dot(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.dot: non-vector parameter";
            else
                return(v1.x*v2.x + v1.y*v2.y + v1.z*v2.z);
        } // end try

        catch(e) {
            console.log(e);
            return(NaN);
        }
    } // end dot static method

    // static add method
    static add(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.add: non-vector parameter";
            else
                return(new Vector(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z));
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end add static method

    // static subtract method, v1-v2
    static subtract(v1,v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.subtract: non-vector parameter";
            else {
                var v = new Vector(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
                //v.toConsole("Vector.subtract: ");
                return(v);
            }
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end subtract static method

    // static scale method
    static scale(c,v) {
        try {
            if (!(typeof(c) === "number") || !(v instanceof Vector))
                throw "Vector.scale: malformed parameter";
            else
                return(new Vector(c*v.x,c*v.y,c*v.z));
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end scale static method

    // static normalize method
    static normalize(v) {
        try {
            if (!(v instanceof Vector))
                throw "Vector.normalize: parameter not a vector";
            else {
                var lenDenom = 1/Math.sqrt(Vector.dot(v,v));
                return(Vector.scale(lenDenom,v));
            }
        } // end try

        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    } // end scale static method

    static cross(v1, v2)
    {
        try
        {
            return new Vector((v1.y * v2.z - v1.z * v2.y), -(v1.x * v2.z - v1.z * v2.x), (v1.x * v2.y - v1.y * v2.x));
        }
        catch(e) {
            console.log(e);
            return(new Vector(NaN,NaN,NaN));
        }
    }// end cross method

    //length
    static length(v)
    {
        var l2 = Vector.dot(v,v);
        return l2 > 0? Math.sqrt(l2):0;
    }

} // end Vector class


function randPermutation(n) {
    var array = new Array(n);
    var bagSize = n, temp, randChoice;

    // fill the array
    for (var i=0; i<n; i++)
        array[i] = i;

    // while the bag isn't empty, pick from it
    while (bagSize !== 0) {
        randChoice = Math.floor(Math.random() * bagSize); // pick from bag
        bagSize--; // bag is less one
        temp = array[bagSize]; // remember what was at new bag slot
        array[bagSize] = array[randChoice]; // move old pick to new slot
        array[randChoice] = temp; // copy old element to old slot
    } // end while
    return(array);
}

function getJSONFileByCode(url,descr)
{
    if(descr === "triangles")
    {

        var str = "[{\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[0,0,0],[1,0,0],[1,0,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[1,0,1],[0,0,1],[0,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,1.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[-1,0,0],\"vertices\": [[1,0,0],[1,0,1],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,1.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[-1,0,0],\"vertices\": [[1,1,1],[1,1,0],[1,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [1.0,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,0,-1],\"vertices\": [[0,0,1],[1,0,1],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [1.0,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,0,-1],\"vertices\": [[1,1,1],[0,1,1],[0,0,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[1,0,0],\"vertices\": [[0,0,0],[0,0,1],[0,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[1,0,0],\"vertices\": [[0,1,1],[0,1,0],[0,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,-1,0],\"vertices\": [[0,1,0],[1,1,0],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,-1,0],\"vertices\": [[1,1,1],[0,1,1],[0,1,0]]}\
        ]";


        //var str = "[{\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[1,1,1],[0,1,1],[0,1,0]]}\
        // \]";

        return JSON.parse(str);
    }
    else if(descr === "lights")
    {
        // {\"x\": 0.1, \"y\": 0.5, \"z\": 0, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}\
        var str = "[{\"x\": 0.5, \"y\": 0.9, \"z\": 0.5, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}\
                    ,{\"x\": 0.1, \"y\": 0.5, \"z\": 0, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}\
                  ]";
        return JSON.parse(str);
    }
    return(String.null);
}

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try

    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

function solveQuad(a,b,c) {
    var discr = b*b - 4*a*c;
    // console.log("a:"+a+" b:"+b+" c:"+c);

    if (discr < 0) { // no solutions
        // console.log("no roots!");
        return([]);
    } else if (discr == 0) { // one solution
        // console.log("root: "+(-b/(2*a)));
        return([-b/(2*a)]);
    } else { // two solutions
        var denom = 0.5/a;
        var term1 = -b;
        var term2 = Math.sqrt(discr)
        var tp = denom * (term1 + term2);
        var tm = denom * (term1 - term2);
        // console.log("root1:"+tp+" root2:"+tm);
        if (tm < tp)
            return([tm,tp]);
        else
            return([tp,tm]);
    }
} // end solveQuad


function raySphereIntersect(ray,sphere,clipVal)
{
    try {
        if (!(ray instanceof Array) || !(sphere instanceof Object))
            throw "RaySphereIntersect: ray or sphere are not formatted well";
        else if (ray.length != 2)
            throw "RaySphereIntersect: badly formatted ray";
        else { // valid params
            var a = Vector.dot(ray[1],ray[1]); // dot(D,D)
            var origMctr = Vector.subtract(ray[0],new Vector(sphere.x,sphere.y,sphere.z)); // E-C
            var b = 2 * Vector.dot(ray[1],origMctr); // 2 * dot(D,E-C)
            var c = Vector.dot(origMctr,origMctr) - sphere.r*sphere.r; // dot(E-C,E-C) - r^2

            var qsolve = solveQuad(a,b,c);
            if (qsolve.length == 0)
                throw "no intersection";
            else if (qsolve.length == 1) {
                if (qsolve[0] < clipVal)
                    throw "intersection too close";
                else {
                    var isect = Vector.add(ray[0],Vector.scale(qsolve[0],ray[1]));
                    //console.log("t: "+qsolve[0]);
                    //isect.toConsole("intersection: ");
                    return({"exists": true, "xyz": isect,"t": qsolve[0]});
                } // one unclipped intersection
            } else if (qsolve[0] < clipVal) {
                if (qsolve[1] < clipVal)
                    throw "intersections too close";
                else {
                    var isect = Vector.add(ray[0],Vector.scale(qsolve[1],ray[1]));
                    //console.log("t2: "+qsolve[1]);
                    //isect.toConsole("intersection: ");
                    return({"exists": true, "xyz": isect,"t": qsolve[1]});
                } // one intersect too close, one okay
            } else {
                var isect = Vector.add(ray[0],Vector.scale(qsolve[0],ray[1]));
                //console.log("t1: "+qsolve[0]);
                //isect.toConsole("intersection: ");
                return({"exists": true, "xyz": isect,"t": qsolve[0],"type":0});
            } // both not too close
        } // end if valid params
    } // end try

    catch(e) {
        //console.log(e);
        return({"exists": false, "xyz": NaN, "t": NaN,"type":NaN});
    }
} // end raySphereIntersect

function randPermutation(n) {
    var array = new Array(n);
    var bagSize = n, temp, randChoice;

    // fill the array
    for (var i=0; i<n; i++)
        array[i] = i;

    // while the bag isn't empty, pick from it
    while (bagSize !== 0) {
        randChoice = Math.floor(Math.random() * bagSize); // pick from bag
        bagSize--; // bag is less one
        temp = array[bagSize]; // remember what was at new bag slot
        array[bagSize] = array[randChoice]; // move old pick to new slot
        array[randChoice] = temp; // copy old element to old slot
    } // end while

    return(array);
}


function randDir(n)
{
    var array = new Array(n);
    var bagSize = n, temp, randChoice;

    // fill the array
    for (var i=0; i<n; i++)
    {
        array[i] = new Vector(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5);
    }
    return(array);
}
/*
 * */
///////////////////////////////////////////////////////////
function russianRoulette()
{
    return (Math.random() > 0.5);
}

function mutilcolor(c,l,m)
{
    c[0] = l[0] * m[0] ;
    c[1] = l[1] * m[1] ;
    c[2] = l[2] * m[2] ;
}

function rayTriangleIntersect(ray,pos,clipVal)
{
    var a = new Vector(pos[0][0],pos[0][1],pos[0][2]);
    var b = new Vector(pos[1][0],pos[1][1],pos[1][2]);
    var c = new Vector(pos[2][0],pos[2][1],pos[2][2]);

    var ve1 = Vector.subtract(b,a);
    var ve2 = Vector.subtract(c,a);
    var vt = Vector.subtract(ray[0],a);
    var vp = Vector.cross(ray[1],ve2);
    var vq = Vector.cross(vt,ve1);
    var vpe1 = Vector.dot(vp,ve1);
    var vu = Vector.dot(vp,vt)/vpe1;
    var vv = Vector.dot(vq,ray[1])/vpe1;

    if( (vu > 0.0 ) && (vv > 0.0) && ((vu + vv ) < 1.0000000000000001))
    {
        var i = Vector.dot(vq ,ve2)/vpe1;
        if(clipVal < i)
        {
            var vi = Vector.add(ray[0],Vector.scale(i,ray[1]));
            return({"exists": true, "xyz": vi, "t": i,"type":1});
        }
    }

    return({"exists": false, "xyz": NaN, "t": NaN,"type":NaN});
}

function getrandomdir(n)
{
    var dirs = randDir(1);
    var vdirid = dirs.length;
    while(vdirid > 0) {
        vdirid--;
        var vd = dirs[vdirid];
        var vndot = Vector.dot(vd, n);
        if (vndot < 0) {
            vd = Vector.scale(-1, vd);
        }
        Vector.normalize(vd);
        return vd;
    }
}


/////////////////////////////////////////////////////////////

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color[0];
            imagedata.data[pixelindex+1] = color[1];
            imagedata.data[pixelindex+2] = color[2];
            imagedata.data[pixelindex+3] = color[3];
        } else
            throw "drawpixel color is not a Color";
    } // end try

    catch(e) {
        console.log(e);
    }
} // end drawPixel

// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY;

    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,
            Math.random()*255,255); // rand color
        drawPixel(imagedata,
            Math.floor(Math.random()*w),
            Math.floor(Math.random()*h),
            c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels


function isLightOccluded(lpos, pntpos,spheres,triangles,skipsphere,skipTriangel)
{
    var s=0; // which sphere
    var lightOccluded = false;
    var objIsec = {};

    //from pos to all light ray tracing
    var dir = Vector.subtract(lpos,pntpos);

    var i = spheres.length;
    while((!lightOccluded) && (i > 0))
    {
        i--;
        if(skipsphere == i)
        {
            continue;
        }
        objIsec = raySphereIntersect([pntpos,dir],spheres[i],0);
        if(objIsec.exists && (objIsec.t > 0.0)&& (objIsec.t <= 1.0))
        {
            lightOccluded = true;
        }
    }

    i = triangles.length;
    while((!lightOccluded) && (i > 0))
    {
        i--;
        if(skipTriangel == i)
        {
            continue;
        }
        objIsec = rayTriangleIntersect([pntpos,dir],triangles[i].vertices,0);
        if(objIsec.exists && (objIsec.t > 0.0)&& (objIsec.t <= 1.0))
        {

            lightOccluded = true;
        }
    }

    return(lightOccluded);
}

// color the passed intersection and sphere
function shadeIsectSphere(isect, isectSphere, lights, spheres,triangles) {
    try {
        if (   !(isect instanceof Object) || !(typeof(isectSphere) === "number")
            || !(lights instanceof Array) || !(spheres instanceof Array)) {
            throw "shadeIsectSphere: bad parameter passed";
        }
        else {
            var c = new Color(0,0,0,255); // init the sphere color to black
            var sphere = spheres[isectSphere]; // sphere intersected by eye

            var lightOccluded = false; // if an occluder is found

            for (var lightidx=0; lightidx<lights.length; lightidx++)
            {
                c[0] += lights[lightidx].ambient[0] * sphere.ambient[0]; // ambient term r
                c[1] += lights[lightidx].ambient[1] * sphere.ambient[1]; // ambient term g
                c[2] += lights[lightidx].ambient[2] * sphere.ambient[2]; // ambient term b

                var lpos = new Vector(lights[lightidx].x,lights[lightidx].y,lights[lightidx].z);
                var L = Vector.subtract(lpos,isect.xyz); // light vector unnorm'd

                if (!isLightOccluded(lpos,isect.xyz,spheres,triangles,isectSphere,-1))
                {
                    var sphereCenter = new Vector(sphere.x,sphere.y,sphere.z);
                    var N = Vector.normalize(Vector.subtract(isect.xyz,sphereCenter)); // surface normal
                    var diffFactor = Math.max(0,Vector.dot(N,Vector.normalize(L)));
                    if (diffFactor > 0)
                    {
                        c[0] += lights[lightidx].diffuse[0] * sphere.diffuse[0] * diffFactor;
                        c[1] += lights[lightidx].diffuse[1] * sphere.diffuse[1] * diffFactor;
                        c[2] += lights[lightidx].diffuse[2] * sphere.diffuse[2] * diffFactor;
                    } // end nonzero diffuse factor

                    // add in the specular light
                    var V = Vector.normalize(Vector.subtract(Eye,isect.xyz)); // view vector
                    var H = Vector.normalize(Vector.add(L,V)); // half vector
                    var specFactor = Math.max(0,Vector.dot(N,H));
                    if (specFactor > 0)
                    {
                        var newSpecFactor = specFactor;
                        for (var s=1; s<spheres[isectSphere].n; s++) // mult by itself if needed
                            newSpecFactor *= specFactor;
                        c[0] += lights[lightidx].specular[0] * sphere.specular[0] * newSpecFactor; // specular term
                        c[1] += lights[lightidx].specular[1] * sphere.specular[1] * newSpecFactor; // specular term
                        c[2] += lights[lightidx].specular[2] * sphere.specular[2] * newSpecFactor; // specular term
                    } // end nonzero specular factor

                } // end if light not occluded
            } // end for lights

            c[0] = 255 * Math.min(1,c[0]); // clamp max value to 1
            c[1] = 255 * Math.min(1,c[1]); // clamp max value to 1
            c[2] = 255 * Math.min(1,c[2]); // clamp max value to 1

            return(c);
        }
    }
    catch(e)
    {
        console.log(e);
        return(Object.null);
    }
}

function shadeIsectTriangle(isect, isecTriangle, lights,spheres,triangles)
{
    try {
        if (   !(isect instanceof Object) || !(typeof(isecTriangle) === "number")
            || !(lights instanceof Array) || !(triangles instanceof Array))
            throw "shadeIsectSphere: bad parameter passed";
        else {
            var c = new Color(0,0,0,255); // init the sphere color to black
            var triangle = triangles[isecTriangle]; // sphere intersected by eye
            var lightOccluded = false; // if an occluder is found
            for (var lightidx=0; lightidx<lights.length; lightidx++)
            {
                var lpos = new Vector(lights[lightidx].x,lights[lightidx].y,lights[lightidx].z);
                c[0] += lights[lightidx].ambient[0] * triangle.ambient[0]; // ambient term r
                c[1] += lights[lightidx].ambient[1] * triangle.ambient[1]; // ambient term g
                c[2] += lights[lightidx].ambient[2] * triangle.ambient[2]; // ambient term b

                lpos.set(lights[lightidx].x,lights[lightidx].y,lights[lightidx].z);
                //lpos.set(0.5,0.9,0.5);
                var L = Vector.subtract(lpos,isect.xyz); // light vector unnorm'd

                if (!isLightOccluded(lpos,isect.xyz,spheres,triangles,-1,isecTriangle))
                {
                    var N = Vector.normalize(new Vector(triangle.normal[0],triangle.normal[1],triangle.normal[2])); // surface normal
                    var diffFactor = Math.max(0,Vector.dot(N,Vector.normalize(L)));
                    if (diffFactor > 0) {
                        c[0] += lights[lightidx].diffuse[0] * triangle.diffuse[0] * diffFactor;
                        c[1] += lights[lightidx].diffuse[1] * triangle.diffuse[1] * diffFactor;
                        c[2] += lights[lightidx].diffuse[2] * triangle.diffuse[2] * diffFactor;
                    } // end nonzero diffuse factor

                    // add in the specular light
                    var V = Vector.normalize(Vector.subtract(Eye,isect.xyz)); // view vector
                    var H = Vector.normalize(Vector.add(L,V)); // half vector
                    var specFactor = Math.max(0,Vector.dot(N,H));
                    if (specFactor > 0)
                    {
                        var newSpecFactor = specFactor;
                        for (var s=1; s<triangle.n; s++) // mult by itself if needed
                        {
                            newSpecFactor *= specFactor;
                        }
                        c[0] += lights[lightidx].specular[0] * triangle.specular[0] * newSpecFactor; // specular term
                        c[1] += lights[lightidx].specular[1] * triangle.specular[1] * newSpecFactor; // specular term
                        c[2] += lights[lightidx].specular[2] * triangle.specular[2] * newSpecFactor; // specular term
                    } // end nonzero specular factor
                } // end if light not occluded
                else
                {
                    //console.log("lightidx unavailble" + lightidx);
                }
            } // end for lights

            c[0] = 255 * Math.min(1,c[0]); // clamp max value to 1
            c[1] = 255 * Math.min(1,c[1]); // clamp max value to 1
            c[2] = 255 * Math.min(1,c[2]); // clamp max value to 1

            return(c);
        } // if have good params
    } // end throw

    catch(e)
    {
        console.log(e);
        return(Object.null);
    }
}

function drawbyintersection(inputSpheres,inputLights,inputTriangles,vnearstisec)
{
    var n = new Vector(0,0,0);
    var c = new Color(0,0,0,255);
    var m = new Vector(0,0,0);
    if((vnearstisec.exists)&& (vnearstisec.id >= 0))
    {
        if(vnearstisec.type == 0)
        {
            m.set(inputSpheres[vnearstisec.id].diffuse[0],inputSpheres[vnearstisec.id].diffuse[1],inputSpheres[vnearstisec.id].diffuse[2]);
            //n = new Vector(vnearstisec.xyz[0]-inputSpheres[vnearstisec.id].x,vnearstisec.xyz[1]-inputSpheres[vnearstisec.id].y,vnearstisec.xyz[2] - inputSpheres[vnearstisec.id].z);
            n = Vector.subtract(vnearstisec.xyz,new Vector(inputSpheres[vnearstisec.id].x,inputSpheres[vnearstisec.id].y,inputSpheres[vnearstisec.id].z));
            c = shadeIsectSphere(vnearstisec, vnearstisec.id, inputLights, inputSpheres,inputTriangles);
        }
        else
        {
            m.set(inputTriangles[vnearstisec.id].diffuse[0],inputTriangles[vnearstisec.id].diffuse[1],inputTriangles[vnearstisec.id].diffuse[2]);
            n = new Vector(inputTriangles[vnearstisec.id].normal[0],inputTriangles[vnearstisec.id].normal[1],inputTriangles[vnearstisec.id].normal[2])
            c = shadeIsectTriangle(vnearstisec, vnearstisec.id, inputLights,inputSpheres, inputTriangles);
        }
    }
    c[0] = Math.min(255,c[0]);
    c[1] = Math.min(255,c[1]);
    c[2] = Math.min(255,c[2]);
    return {"color":c,"n":n,"m":m};
}

function drawwithoutlights(inputSpheres,inputLights,inputTriangles,vnearstisec)
{
    var c = new Color(0,0,0,255);
    if((vnearstisec.exists)&& (vnearstisec.id >= 0))
    {
        if(vnearstisec.type == 0)
        {
            c[0] = inputSpheres[vnearstisec.id].diffuse[0]*255;
            c[1] = inputSpheres[vnearstisec.id].diffuse[1]*255;
            c[2] = inputSpheres[vnearstisec.id].diffuse[2]*255;
        }
        else
        {
            c[0] = inputTriangles[vnearstisec.id].diffuse[0]*255;
            c[1] = inputTriangles[vnearstisec.id].diffuse[1]*255;
            c[2] = inputTriangles[vnearstisec.id].diffuse[2]*255;
        }
    }
    c[0] = Math.min(255,c[0]);
    c[1] = Math.min(255,c[1]);
    c[2] = Math.min(255,c[2]);
    return c;
}

// ((2(n·l)n - l )·v)
function calBRDFColor(n,rayin,rayout)
{
   var nn = Vector.scale(Vector.dot(n,rayin)*2,n);
   return Vector.dot(Vector.subtract(nn,rayin),rayout);
}

function calcos(v1,v2)
{
    return Vector.dot(v1,v2)/(Vector.length(v1)*Vector.length(v2));
}

function caliddirectr(inputSpheres, inputLights, inputTriangles, pos, n,dirout, times)
{
    var c = new Color(0,0,0,255)
    times--;
    if(times < 0)
    {
        return c;
    }
    var vdirin = getrandomdir(n);
    var vrdirin = new Vector(vdirin.x,vdirin.y,vdirin.z);
    var vy = raytracing(inputSpheres,inputLights,inputTriangles,pos,vrdirin,times);  //find y
    if(vy.exists)
    {
        var vycolor = drawbyintersection(inputSpheres,inputLights,inputTriangles,vy);
        var vfacotor = calBRDFColor(vy,Vector.scale(-1,dirout),vdirin)*calcos(n,vrdirin);
        c[0] = vycolor.color[0]*vfacotor;
        c[1] = vycolor.color[1]*vfacotor;
        c[2] = vycolor.color[2]*vfacotor;
    }
    return c;
}

function caldirectr(inputSpheres, inputLights, inputTriangles, pos, dirout, times)
{
    var c = new Color(0,0,0,255)
    times--;
    if(times < 0)
    {
        return c;
    }
    var vdirin = getrandomdir();
    var vrdirin = new Vector(vdirin.x,vdirin.y,vdirin.z);
    var vy = raytracing(inputSpheres,inputLights,inputTriangles,pos,vrdirin,times);  //find y
    if(vy.exists)
    {
        var vycolor = drawbyintersection(inputSpheres,inputLights,inputTriangles,vy);
        var vfacotor = calBRDFColor(vy,Vector.scale(-1,dirout),vdirin)*calcos(vycolor.n,Vector.scale(-1,vrdirin));
        c[0] = vycolor.color[0]*vfacotor;
        c[1] = vycolor.color[1]*vfacotor;
        c[2] = vycolor.color[2]*vfacotor;
    }
    return c;
}


function raytracingforall(inputSpheres, inputLights, inputTriangles, pos, dir, times)
{
    var c = new Color(0,0,0,255)
    times--;
    if(times < 0)
    {
        return c;
    }

    var vnearstisec = raytracing(inputSpheres,inputLights,inputTriangles,pos,dir,times);  //find intersection
    var drawrt = drawbyintersection(inputSpheres,inputLights,inputTriangles,vnearstisec);  //color by original material
    c = drawrt.color;

    if((vnearstisec.exists)&& (vnearstisec.id >= 0))   //brdf
    {
        var vdir = getrandomdir(drawrt.n);
        var vr = new Vector(vdir.x,vdir.y,vdir.z);

        var vintersect = raytracing(inputSpheres,inputLights,inputTriangles,vnearstisec.xyz,vr,times);
        var color = drawbyintersection(inputSpheres,inputLights,inputTriangles,vintersect);
        var vf = calBRDFColor(drawrt.n,vr,Vector.normalize(Vector.scale(-1,dir)));
        if(vf > 0)
        {
            c[0] += color.color[0]*vf*color.m.x;
            c[1] += color.color[1]*vf*color.m.y;
            c[2] += color.color[2]*vf*color.m.z;
        }

        if(russianRoulette() && (G_USE_RAYTRACING_MORE > 0) && (G_USE_BRDF > 0) )
        {
            var vcolor = raytracingforall(inputSpheres, inputLights, inputTriangles, vintersect.xyz, vr, times);
            c[0] += vcolor[0];
            c[1] += vcolor[1];
            c[2] += vcolor[2];
        }

    }
    c[0] = Math.min(255,c[0]);
    c[1] = Math.min(255,c[1]);
    c[2] = Math.min(255,c[2]);
    return c;

}

function drawScene(inputSpheres,inputLights,inputTriangles,pos,dir,times)
{
    var c = raytracingforall(inputSpheres,inputLights,inputTriangles,pos,dir,times);

    c[0] = Math.min(255,c[0]);
    c[1] = Math.min(255,c[1]);
    c[2] = Math.min(255,c[2]);
    return c;

}

function raytracing(inputSpheres,inputLights,inputTriangles,pos,dir)
{
    var closestT = Number.MAX_VALUE; // no closest t for this pixel
    var hitobjid = -1;
    var hitobjtype = -1;
    var isect = {}; // init the intersection
    var vnearstisec = {};

    for (var s=0; s< inputSpheres.length; s++)
    {
        isect = raySphereIntersect([pos,dir],inputSpheres[s],1);
        if (isect.exists) // there is an intersect
        {
            if (isect.t < closestT)
            {
                closestT = isect.t; // record closest t yet
                hitobjtype = 0;
                hitobjid = s;
                vnearstisec = isect;
                vnearstisec.id = s;
            }
        }
    }

    for(var s = 0; s < inputTriangles.length; s++)
    {
        isect = rayTriangleIntersect([pos,dir],inputTriangles[s].vertices,1);
        if (isect.exists) // there is an intersect
        {
            if (isect.t < closestT)
            {
                closestT = isect.t; // record closest t yet
                hitobjtype = 1;
                hitobjid = s;
                vnearstisec = isect;
                vnearstisec.id = s;
            }
        }
    }

    return vnearstisec;
}

// use ray casting with spheres to get pixel colors
function rayCast(context) {

    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);

    if (g_inputSpheres != String.null)
    {
        var x = 0; var y = 0; // pixel coord init
        var wx = WIN_LEFT; // init world pixel xcoord
        var wxd = (WIN_RIGHT-WIN_LEFT) * 1/(w-1); // world pixel x differential
        var wy = WIN_TOP; // init world pixel ycoord
        var wyd = (WIN_BOTTOM-WIN_TOP) * 1/(h-1); // world pixel y differential

        for (y=0; y<h; y++)
        {
            wx = WIN_LEFT; // init w
            for (x=0; x<h; x++)
            {
                var cl = new Color(0,0,0,255);
                for(var k = 0; k < MAX_RANDOM_NUMBER; k++)
                {
                    var vpos = new Vector(wx + wxd*k/MAX_RANDOM_NUMBER,wy + wyd*k/MAX_RANDOM_NUMBER,WIN_Z);
                    var dir = Vector.subtract(vpos,Eye);

                    var c  = drawScene(g_inputSpheres,g_lights,g_inputTriangles,Eye,dir,MAX_TRACING_PATH);
                    cl[0] += c[0];
                    cl[1] += c[1];
                    cl[2] += c[2];
                }
                cl[0] = cl[0]/MAX_RANDOM_NUMBER;
                cl[1] = cl[1]/MAX_RANDOM_NUMBER;
                cl[2] = cl[2]/MAX_RANDOM_NUMBER;

                drawPixel(imagedata,x,y,cl);
                wx += wxd;
            }
            wy += wyd;
        }
        context.putImageData(imagedata, 0, 0);
    }
}

/* constants and globals */
const PI = 3.14;
const WIN_Z = 0;
const WIN_LEFT = 0; const WIN_RIGHT = 1;
const WIN_BOTTOM = 0; const WIN_TOP = 1;
const INPUT_SPHERES_URL =
    "https://ncsucg4games.github.io/prog1/spheres.json";
const INPUT_LIGHTS_URL =
    "https://ncsucg4games.github.io/prog1/lights.json";

var MAX_RANDOM_NUMBER = 100;
var G_USE_BRDF = 1;
var G_USE_RAYTRACING_MORE = 1;
var G_BRDF_FACTOR = 1;
var MAX_TRACING_PATH = 2;

var g_lights = null;
var g_inputSpheres = null;
var g_inputTriangles = null;

var Eye = new Vector(0.5,0.5,-0.5); // set the eye position

function main() {
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    loaddata();
    rayCast(context);
}


function loaddata()
{
    g_inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");
    g_inputTriangles = getJSONFileByCode(INPUT_SPHERES_URL,"triangles");
    g_lights = getJSONFile(INPUT_LIGHTS_URL,"lights");
    if(g_lights.length > 0)
    {
        g_lights[0].x = 0.5;
        g_lights[0].y = 1;
        g_lights[0].z = 0.5;
    }
}

////
function gotopart1() {
    G_USE_BRDF = 0;
    MAX_TRACING_PATH = 1;
    MAX_RANDOM_NUMBER = 1;
    main();
}

function gotopart2() {
    G_USE_BRDF = 1;
    MAX_RANDOM_NUMBER = 100;
    MAX_TRACING_PATH = 1;
    main();
}

function gotopart3() {
    G_USE_BRDF = 1;
    MAX_RANDOM_NUMBER = 100;
    MAX_TRACING_PATH = 5;
    main();
}