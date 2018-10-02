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

        var str = "[{\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[0,0,0],[1,0,0],[1,0,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[1,0,1],[0,0,1],[0,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[-1,0,0],\"vertices\": [[1,0,0],[1,0,1],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[-1,0,0],\"vertices\": [[1,1,1],[1,1,0],[1,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,0,-1],\"vertices\": [[0,0,1],[1,0,1],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,0,-1],\"vertices\": [[1,1,1],[0,1,1],[0,0,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[1,0,0],\"vertices\": [[0,0,0],[0,0,1],[0,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[1,0,0],\"vertices\": [[0,1,1],[0,1,0],[0,0,0]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,-1,0],\"vertices\": [[0,1,0],[1,1,0],[1,1,1]]},\
                    {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,-1,0],\"vertices\": [[1,1,1],[0,1,1],[0,1,0]]}\
        ]";


        //var str = "[{\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\":1,\"normal\":[0,1,0],\"vertices\": [[1,1,1],[0,1,1],[0,1,0]]}\
        // \]";

        return JSON.parse(str);
    }
    else if(descr === "lights")
    {
        // {\"x\": 0.1, \"y\": 0.5, \"z\": 0, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}\
        var str = "[{\"x\": 0.5, \"y\": 0.9, \"z\": 0.5, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}\
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
                return({"exists": true, "xyz": isect,"t": qsolve[0]});
            } // both not too close
        } // end if valid params
    } // end try

    catch(e) {
        //console.log(e);
        return({"exists": false, "xyz": NaN, "t": NaN});
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
            return({"exists": true, "xyz": vi, "t": i});
        }
    }

    return({"exists": false, "xyz": NaN, "t": NaN});
}


function BRDF(pnt,spheres,triangles,lights,n)
{
    var dirs = randDir(MAX_RANDOM_NUMBER);
    var c = new Color(0,0,0,255); // set pixel to background color

    var vdirid = dirs.length;
    while(vdirid > 0)
    {
        vdirid--;
        var vd = dirs[vdirid];
        var vndot = Vector.dot(vd,n);
        if(vndot < 0)
        {
            vd = Vector.scale(-1,vd);
        }

        var closestT = Number.MAX_VALUE; // no closest t for this pixel
        var hitobjid = -1;
        var hitobjtype = -1;
        var vnearstisec = {};
        var isect = {};

        for (var s=0; s< spheres.length; s++)
        {
            isect = raySphereIntersect([pnt,vd],spheres[s],0);
            if (isect.exists) // there is an intersect
            {
                if (isect.t < closestT)
                {
                    closestT = isect.t; // record closest t yet
                    hitobjtype = 0;
                    hitobjid = s;
                    vnearstisec = isect;
                }
            }
        } // end for spheres

        for(var s = 0; s < triangles.length; s++)
        {
            isect = rayTriangleIntersect([pnt,vd],triangles[s].vertices,0);
            if (isect.exists) // there is an intersect
            {
                if (isect.t < closestT)
                {
                    closestT = isect.t; // record closest t yet
                    hitobjtype = 1;
                    hitobjid = s;
                    vnearstisec = isect;
                } // end if closest yet
            }
        }

        if(hitobjid >= 0)
        {
            for(var vl = 0;vl<lights.length;vl++)
            {
                if(hitobjtype == 0)
                {
                    c[0] += lights[vl].diffuse[0] * spheres[hitobjid].diffuse[0] ;
                    c[1] += lights[vl].diffuse[1] * spheres[hitobjid].diffuse[1] ;
                    c[2] += lights[vl].diffuse[2] * spheres[hitobjid].diffuse[2] ;
                }
                else
                {
                    c[0] += lights[vl].diffuse[0] * triangles[hitobjid].diffuse[0] ;
                    c[1] += lights[vl].diffuse[1] * triangles[hitobjid].diffuse[1] ;
                    c[2] += lights[vl].diffuse[2] * triangles[hitobjid].diffuse[2] ;
                }
            }
        }
    }
    return new Color( Math.min(c[0]/dirs.length,1.0)*255,Math.min(c[1]/dirs.length,1.0)*255,Math.min(c[2]/dirs.length,1.0)*255,c[3])
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
            || !(lights instanceof Array) || !(spheres instanceof Array))
            throw "shadeIsectSphere: bad parameter passed";
        else {
            var c = new Color(0,0,0,255); // init the sphere color to black
            var sphere = spheres[isectSphere]; // sphere intersected by eye

            var lightOccluded = false; // if an occluder is found
            var Lloc = new Vector(0,0,0);
            for (var l=0; l<lights.length; l++)
            {
                c[0] += lights[l].ambient[0] * sphere.ambient[0]; // ambient term r
                c[1] += lights[l].ambient[1] * sphere.ambient[1]; // ambient term g
                c[2] += lights[l].ambient[2] * sphere.ambient[2]; // ambient term b

                //Lloc.set(0.5,0.9,0.5);
                var L = Vector.subtract(Lloc,isect.xyz); // light vector unnorm'd

                if (!isLightOccluded(Lloc,isect.xyz,spheres,triangles,isectSphere,-1))
                {
                    var sphereCenter = new Vector(sphere.x,sphere.y,sphere.z);
                    var N = Vector.normalize(Vector.subtract(isect.xyz,sphereCenter)); // surface normal
                    var diffFactor = Math.max(0,Vector.dot(N,Vector.normalize(L)));
                    if (diffFactor > 0) {
                        c[0] += lights[l].diffuse[0] * sphere.diffuse[0] * diffFactor;
                        c[1] += lights[l].diffuse[1] * sphere.diffuse[1] * diffFactor;
                        c[2] += lights[l].diffuse[2] * sphere.diffuse[2] * diffFactor;
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
                        c[0] += lights[l].specular[0] * sphere.specular[0] * newSpecFactor; // specular term
                        c[1] += lights[l].specular[1] * sphere.specular[1] * newSpecFactor; // specular term
                        c[2] += lights[l].specular[2] * sphere.specular[2] * newSpecFactor; // specular term
                    } // end nonzero specular factor

                } // end if light not occluded
                else
                {

                }
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
            var Lloc = new Vector(0,0,0);
            for (var lightidx=0; lightidx<lights.length; lightidx++)
            {
                c[0] += lights[lightidx].ambient[0] * triangle.ambient[0]; // ambient term r
                c[1] += lights[lightidx].ambient[1] * triangle.ambient[1]; // ambient term g
                c[2] += lights[lightidx].ambient[2] * triangle.ambient[2]; // ambient term b

                Lloc.set(lights[lightidx].x,lights[lightidx].y,lights[lightidx].z);
                //Lloc.set(0.5,0.9,0.5);
                var L = Vector.subtract(Lloc,isect.xyz); // light vector unnorm'd

                if (!isLightOccluded(Lloc,isect.xyz,spheres,triangles,-1,isecTriangle))
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

function raytracing(inputSpheres,inputLights,inputTriangles,pos,times)
{
    var c = new Color(0,0,0,255);
    if(times <= 0)
    {
        return c;
    }
    times--;
    var lightfactor = (times/(MAX_TRACING_PATH*2));

    var closestT = Number.MAX_VALUE; // no closest t for this pixel
    var hitobjid = -1;
    var hitobjtype = -1;
    var isect = {}; // init the intersection
    var vnearstisec = {};
    var n = new Vector(0,0,0);

    var Dir = new Vector(0,0,0);
    Dir.copy(Vector.subtract(pos,Eye)); // set ray direction

    for (var s=0; s< inputSpheres.length; s++)
    {
        isect = raySphereIntersect([Eye,Dir],inputSpheres[s],1);
        if (isect.exists) // there is an intersect
        {
            if (isect.t < closestT)
            {
                closestT = isect.t; // record closest t yet
                hitobjtype = 0;
                hitobjid = s;
                vnearstisec = isect;
            }
        }
    } // end for spheres

    for(var s = 0; s < inputTriangles.length; s++)
    {
        isect = rayTriangleIntersect([Eye,Dir],inputTriangles[s].vertices,1);
        if (isect.exists) // there is an intersect
        {
            if (isect.t < closestT)
            {
                closestT = isect.t; // record closest t yet
                hitobjtype = 1;
                hitobjid = s;
                vnearstisec = isect;
            }
        }
    }

    if((vnearstisec.exists)&& (hitobjid >= 0))
    {
        if(hitobjtype == 0)
        {
            n = new Vector(vnearstisec.x-inputSpheres[hitobjid].x,vnearstisec.y-inputSpheres[hitobjid].y,vnearstisec.z - inputSpheres[hitobjid].z);
            c = shadeIsectSphere(vnearstisec, hitobjid, inputLights, inputSpheres,inputTriangles);
        }
        else
        {
            n = new Vector(inputTriangles[hitobjid].normal[0],inputTriangles[hitobjid].normal[1],inputTriangles[hitobjid].normal[2])
            c = shadeIsectTriangle(vnearstisec, hitobjid, inputLights,inputSpheres, inputTriangles);
        }

        if(G_USE_BRDF > 0)
        {
            var brdfc = BRDF(vnearstisec.xyz,inputSpheres,inputTriangles,inputLights,n);

            c[0] += brdfc[0]*G_BRDF_FACTOR;
            c[1] += brdfc[1]*G_BRDF_FACTOR;
            c[2] += brdfc[2]*G_BRDF_FACTOR;
        }


        if(russianRoulette() && (G_USE_RAYTRACING_MORE > 0))
        {
            var color = raytracing(inputSpheres,inputLights,inputTriangles,vnearstisec.xyz,times);
            c[0] += lightfactor*color[0];
            c[1] += lightfactor*color[1];
            c[2] += lightfactor*color[2];
        }
    }
    c[0] = Math.min(255,c[0]);
    c[1] = Math.min(255,c[1]);
    c[2] = Math.min(255,c[2]);

    return c;
}

// use ray casting with spheres to get pixel colors
function rayCastSpheres(context) {
    var inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");
    var inputTriangles = getJSONFileByCode(INPUT_SPHERES_URL,"triangles");
    var inputLights = /*getJSONFile*/getJSONFileByCode(INPUT_LIGHTS_URL,"lights");

    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);

    if (inputSpheres != String.null)
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
                var c = raytracing(inputSpheres,inputLights,inputTriangles,new Vector(wx,wy,WIN_Z),MAX_TRACING_PATH);
                drawPixel(imagedata,x,y,c);
                wx += wxd;
            }
            wy += wyd;
        }
        context.putImageData(imagedata, 0, 0);
    }
}

/* constants and globals */

const WIN_Z = 0;
const WIN_LEFT = 0; const WIN_RIGHT = 1;
const WIN_BOTTOM = 0; const WIN_TOP = 1;
const INPUT_SPHERES_URL =
    "https://ncsucgclass.github.io/prog1/spheres.json";
const INPUT_LIGHTS_URL =
    "https://ncsucgclass.github.io/prog1/lights.json";
const MAX_TRACING_PATH = 5;
const MAX_RANDOM_NUMBER = 100;
var G_USE_BRDF = 1;
var G_USE_RAYTRACING_MORE = 1;
var G_BRDF_FACTOR = 0.7;

var Eye = new Vector(0.5,0.5,-1.5); // set the eye position


function main() {
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    rayCastSpheres(context);
}