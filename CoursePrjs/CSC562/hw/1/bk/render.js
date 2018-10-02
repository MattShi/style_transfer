/**
 * Created by stone on 2/3/2017.
 */

var G_cfg_usehttpfile = 1;

var G_SPHERES_HTTP = "https://ncsucg4games.github.io/prog1/spheres.json";
var G_LIGHTS_HTTP = "https://ncsucg4games.github.io/prog1/lights.json";


var g_va_spheres = [];
var g_va_cubes = [];
var g_va_lights = [];

var g_u_spheres_num = 0;

var g_a_context = null;

const WIN_Z = 0;
const WIN_LEFT = 0; const WIN_RIGHT = 1;
const WIN_BOTTOM = 0; const WIN_TOP = 1;

/*
* private functions zone*/
/*
 copy from  https://ncsucgclass.github.io/prog2/rasterize.js for retreiving http files
 */
function getJSONFile(url,descr)
{
    try {
        if(G_cfg_usehttpfile !== 1)
        {
            var str ="[\
                {\"x\": 0.25, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3], \"n\": 1, \"alpha\": 1, \"texture\": \"texture1.png\"},\
                {\"x\": 0.25, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.6,0.0], \"specular\": [0.3,0.3,0.3], \"n\": 3, \"alpha\": 1, \"texture\": \"texture2.jpg\"},\
                {\"x\": 0.75, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,0.6], \"specular\": [0.3,0.3,0.3], \"n\": 5, \"alpha\": 1, \"texture\": \"texture3.jpg\"},\
                {\"x\": 0.75, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.6], \"specular\": [0.3,0.3,0.3], \"n\": 7, \"alpha\": 0.5, \"texture\": \"texture4.jpg\"},\
                {\"x\": 0.5, \"y\": 0.5, \"z\": 0.5, \"r\":0.15, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.0], \"specular\": [0.3,0.3,0.3], \"n\": 9, \"alpha\": 0.2, \"texture\": \"texture5.jpg\"}]\
                ";
            return JSON.parse(str);
        }
        else
        {

            if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            {
                throw "getJSONFile: parameter not a string";
            }
            else
            {
                var httpReq = new XMLHttpRequest(); // a new http request
                httpReq.open("GET",url,false); // init the request
                httpReq.send(null); // send the request
                var startTime = Date.now();
                while ((httpReq.status !== G_NET_200) && (httpReq.readyState !== XMLHttpRequest.DONE))
                {
                    if ((Date.now()-startTime) > G_TIME_OUT)
                    {
                        break;
                    }
                }// until its loaded or we time out after three seconds
                if ((httpReq.status !== G_NET_200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                {
                    throw "Unable to open "+descr+" file!";
                }
                else
                {
                    return JSON.parse(httpReq.response);
                }
            } // end if good params
        }
    } // end try

    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres


function loadshperes()
{
    var vobjtype = "sphere";
    var vstr = getJSONFile(G_SPHERES_HTTP,vobjtype);
    if(String.null === vstr)
    {
        console.log("load spheres failed");
    }
    else
    {
        try
        {
            for(var nObjIdx = 0;nObjIdx < vstr.length; nObjIdx++)
            {
                var vcenter = new Vector(vstr[nObjIdx].x, vstr[nObjIdx].y,vstr[nObjIdx].z);
                var vRadius = vstr[nObjIdx].r;
                var objmaterial = new Material(vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular,vstr[nObjIdx].n);
                var objdata = new Sphere(vcenter,vRadius,objmaterial);
                g_va_spheres[g_u_spheres_num] = objdata;
                g_u_spheres_num++;
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

function loadCubes()
{
    var vc = new Vector(0.5,0.5,0.5);
    var vr = 0.5;
    g_va_cubes.push(new Cube(vc,vr));
}

function loadlights()
{
    var vobjtype = "lights";
    var vstr = getJSONFile(G_LIGHTS_HTTP,vobjtype);
    if(String.null === vstr)
    {
        console.log("load lights failed");
    }
    else
    {
        try
        {
            for(var nObjIdx = 0;nObjIdx < vstr.length; nObjIdx++)
            {
                var vpos = new Vector(vstr[nObjIdx].x, vstr[nObjIdx].y,vstr[nObjIdx].z);
                addsinglelight(vpos,vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular);
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

function addsinglelight(vp,vamcolor,vdifcolor,vspccolor)
{
    var objlight = new Light(vp,vamcolor,vdifcolor,vspccolor);
    g_va_lights.push(objlight);
}

////
// given a pixel position, calculate x and y pixel and world coords
function getPixelLocat(pixelNum, w, h)
{
    var y = Math.floor(pixelNum/w);
    var x = pixelNum - y*w;
    var wx = WIN_LEFT + x/w * (WIN_RIGHT - WIN_LEFT);
    var wy = WIN_TOP + y/h * (WIN_BOTTOM - WIN_TOP);
    return ({"x": x, "y": y, "wx": wx, "wy": wy});
}

function drawPixel(imagedata,x,y,color)
{
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
        {
            throw "drawpixel location not a number";
        }
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
        {
            throw "drawpixel location outside of image";
        }
        else if (color instanceof Color)
        {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color[0];
            imagedata.data[pixelindex+1] = color[1];
            imagedata.data[pixelindex+2] = color[2];
            imagedata.data[pixelindex+3] = color[3];
        }
        else
        {
            throw "drawpixel color is not a Color";
        }
    }
    catch(e)
    {
        console.log(e);
    }
}


function rayCastCube(context)
{
    var w = context.canvas.width;
    var h = context.canvas.height;

    var wx = WIN_LEFT; // init world pixel xcoord
    var wxd = (WIN_RIGHT-WIN_LEFT) * 1/(w-1); // world pixel x differential
    var wy = WIN_TOP; // init world pixel ycoord
    var wyd = (WIN_BOTTOM-WIN_TOP) * 1/(h-1); // world pixel y differential

    //
    for (y=0; y<h; y++)
    {
        wx = WIN_LEFT;
        for (x=0; x<h; x++)
        {
            closestT = Number.MAX_VALUE;
            c.change(0,0,0,255);
            for (var s=0; s<n; s++) {
                // for (var s=0; s<1; s++) {
                isect = raySphereIntersect([Eye,Dir],inputSpheres[s],1);
                if (isect.exists) // there is an intersect
                    if (isect.t < closestT) { // it is the closest yet
                        closestT = isect.t; // record closest t yet
                        c = shadeIsect(isect,s,inputLights,inputSpheres);
                    } // end if closest yet
            } // end for spheres
            drawPixel(imagedata,x,y,c);
            wx += wxd;
            //console.log(""); // blank per pixel
        } // end for x
        wy += wyd;
    } // end for y
}

function loadobjs()
{
    loadlights();
    loadshperes();
}


function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    g_a_context = canvas.getContext("2d");

    loadobjs();
    rayCastSpheres(g_a_context);

}
