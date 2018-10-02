/**
 * Created by stone on 10/09/2016.
 */
///<reference path="vector3.js" />
///<reference path="sphere.js" />
///<reference path="ray.js" />
///<reference path="color.js" />
///<reference path="camera.js" />
///<reference path="g_lights.js" />
///<reference path="material.js" />
///<reference path="objsmgr.js" />
///<reference path="triangle.js" />

var g_lights;
var g_cam;
var g_objs;
var g_specm;
var g_objsmgr;
var g_defaultcolor;
var g_setting_closest_distance = 0.5;
var g_ambient_enable = 1;
var g_diffuse_enable = 1;
var g_specular_enable = 1;
var g_objectshading_enable = 1;
var g_localillumination_enable = 1;
var g_object_triangles = 1;
var g_debugoutput_enable = 0;
var g_minnum_zero = 0.00001;
var g_minnum_zero_negetive = -0.00001;
var g_setting_useurl = 1;
var g_location_farthest = 1048576;

/*for camera*/
var g_cam_vlookfrom ;
var g_cam_vup ;
var g_cam_vlookat;
var g_cam_vangle  = 90;
var g_cam_vscale = 1;

var INPUT_SPHERES_URL = "https://ncsucg4games.github.io/prog1/spheres.json";
var INPUT_LIGHTS_URL = "https://ncsucg4games.github.io/prog1/lights.json";



function redrawAll() {
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    render(context);

}

function addsinglelight(vcolor,vlocation,vvalue) {
    var vlight = new Light(vlocation,vcolor,vvalue,vvalue,vvalue);
    g_lights.push(vlight);

}

function removelight() {
    g_lights.pop();
}


function resize()
{
    this.view_wndwidth_px = context.canvas.width;
    this.view_wndheight_pix = context.canvas.height;
    render(context);
}

function resetcam(context)
{
    loadlight();
    g_defaultcolor = new Vector3(128,128,128);

    var w = context.canvas.width;
    var h = context.canvas.height;
    g_cam_vlookfrom = new Vector3(0.5,0.5,-0.5);
    g_cam_vup = new Vector3(0,1,0);
    g_cam_vlookat = new Vector3(0.5,0.5,0);

    g_cam = new Camera(g_cam_vlookfrom,g_cam_vup,g_cam_vlookat,w,h,g_cam_vangle,g_cam_vscale);
    g_specm = 1;
}


function geturldata(vurl)
{

    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET", vurl, false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now() - startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log * ("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
}

function getsphereobjs()
{
    if(1 == g_setting_useurl)
    {
        return geturldata(INPUT_SPHERES_URL);
    }
    else
    {
        var str = "[{\"x\": 0.25, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.25, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.6,0.0], \"specular\": [0.3,0.3,0.3]}," +
            "{\"x\": 0.75, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,0.6], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.75, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.6], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.5, \"y\": 0.5, \"z\": 0.5, \"r\":0.15, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.0], \"specular\": [0.3,0.3,0.3]}]";

        return JSON.parse(str);
    }
} // end get input spheres

function gettriangleobjs()
{
    if(1 != g_object_triangles)
    {
        return "";
    }
    {
        var str = "[{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.6,0.0,0.0], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[0, 0, 0],[1,0,0],[1,0,1],[0,0,1]]," +
            "\"triangles\":[[0,3,2],[2,1,0]]},";  //bottom
        str += "{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.0,0.0,0.6], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[0, 0, 0],[0,0,1],[0,1,1],[0,1,0]]," +
            "\"triangles\":[[0,3,2],[2,1,0]]}," ;//left
        str += "{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.0,0.0,0.6], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[1,0,0],[1,0,1],[1,1,1],[1,1,0]]," +
            "\"triangles\":[[0,1,2],[2,3,0]]},"; //right
        str += "{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.0,0.0,0.6], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[0,1,0],[1,1,0],[1,1,1],[0,1,1]]," +
            "\"triangles\":[[0,1,2],[2,3,0]]},"; //top
        str += "{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.0,0.0,0.6], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]," +
            "\"triangles\":[[0,3,2],[2,1,0]]}"; //front
        str += "]";
        return JSON.parse(str);
    }
}

function getlightobjs()
{
    if(1 == g_setting_useurl)
    {
        //return geturldata(INPUT_LIGHTS_URL);
        var str = "[{\"x\": 0.5, \"y\": 1, \"z\": 0.5, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}]";
        return JSON.parse(str);
    }
    else
    {
        var str = "[{\"x\": 0.5, \"y\": 1, \"z\": 0.5, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}]";
        return JSON.parse(str);
    }

}

function loadlight()
{
    g_lights = new Array();
    var objstr  = getlightobjs();
    if (objstr != String.null)
    {
        var n = objstr.length;

        for (var s = 0; s < n; s++)
        {
            cx = objstr[s].x;
            cy = objstr[s].y;
            cz = objstr[s].z;

            var vlocation = new Vector3(cx,cy,cz);
            var vcolor = new Vector3(255,255,255);

            var vamk = new Vector3(objstr[s].ambient[0],objstr[s].ambient[1],objstr[s].ambient[2]);
            var vdif = new Vector3(objstr[s].diffuse[0],objstr[s].diffuse[1],objstr[s].diffuse[2]);
            var vspc = new Vector3(objstr[s].specular[0],objstr[s].specular[1],objstr[s].specular[2]);

            var vDeflight = new Light(vlocation,vcolor,vamk,vdif,vspc);
            g_lights.push(vDeflight);
        }
    }
}

function loaddata()
{
    g_objs = new Array();
    try
    {
        var objstr  = getsphereobjs();
        if (objstr != String.null)
        {
            var n = objstr.length;

            for (var s = 0; s < n; s++)
            {
                cx = objstr[s].x;
                cy = objstr[s].y;
                cz = objstr[s].z;
                sphereRadius = objstr[s].r;

                var vcenter = new Vector3(cx,cy,cz);
                var obj = new sphere(vcenter,sphereRadius);

                var vamk = new Vector3(objstr[s].ambient[0],objstr[s].ambient[1],objstr[s].ambient[2]);
                var vdif = new Vector3(objstr[s].diffuse[0],objstr[s].diffuse[1],objstr[s].diffuse[2]);
                var vspc = new Vector3(objstr[s].specular[0],objstr[s].specular[1],objstr[s].specular[2]);

                var vmaterial = new Material(vamk,g_lights,vdif,vspc,g_specm);
                obj.setMaterial(vmaterial);
                g_objs.push(obj);
            }
        }
    }
    catch(e)
    {
        console.log(e);
    }


    try
    {
        var objstr = gettriangleobjs();

        if (objstr != String.null)
        {
            var n = objstr.length;

            for (var s =0; s < n; s++)
            {
                var vvtxay = new Array();
                var vvertices = objstr[s].vertices.length;
                for(var vvidx = 0; vvidx < vvertices;vvidx++)
                {
                    vvtxay.push(new Vector3(objstr[s].vertices[vvidx][0],objstr[s].vertices[vvidx][1],objstr[s].vertices[vvidx][2]));
                }
                vvtxay.reverse();

                var vtrixay = new Array();
                var vtri = objstr[s].triangles.length;
                for(var vrtidx = 0; vrtidx <  vtri ;vrtidx++)
                {
                    vtrixay.push(new Vector3(objstr[s].triangles[vrtidx][0],objstr[s].triangles[vrtidx][1],objstr[s].triangles[vrtidx][2]));
                }

                var vamk = new Vector3(objstr[s].ambient[0],objstr[s].ambient[1],objstr[s].ambient[2]);
                var vdif = new Vector3(objstr[s].diffuse[0],objstr[s].diffuse[1],objstr[s].diffuse[2]);
                var vspc = new Vector3(objstr[s].specular[0],objstr[s].specular[1],objstr[s].specular[2]);

                var vmaterial = new Material(vamk,g_lights,vdif,vspc,g_specm);

                var obj = new TriangleObj(vvtxay,vtrixay);
                obj.setMaterial(vmaterial);

                g_objs.push(obj);
            }
        }

    }
    catch(e)
    {
        console.log(e);
    }

    g_objsmgr = new ObjsMgr(g_objs);
}


function render(context)
{
    renderObj(g_objs,g_cam,context);
}

function setpixelcolor(vdata,idx,vc)
{
    vdata[idx] = vc.a > 255 ? 255:vc.a;
    vdata[idx+1] = vc.b> 255 ? 255:vc.b;
    vdata[idx+2] = vc.c> 255 ? 255:vc.c;
    vdata[idx+3] = 255;
}

function renderObj(objs,cam,context)
{
    var vwidth = context.canvas.width;
    var vheight = context.canvas.height;
    var imagedata = context.getImageData(0,0,vwidth,vheight);

    for(var vh = 0; vh < vheight; vh++)
    {
        for(var vw = 0; vw < vwidth; vw++)
        {
            var ray = cam.getRay(vw,vh);
            var vhitparam = 1048576;
            var vhitobj = -1;
            vcolor = calcolor(cam,ray);

            var pixelindex = (vh*imagedata.width + vw) * 4;
            setpixelcolor(imagedata.data,pixelindex,vcolor);
        }
    }

    context.putImageData(imagedata, 0, 0);
}

function calcolor(cam,ray)
{
    var vhitobj = -1;
    var objs = g_objs;
    var vhitparam = 1048576;

    for (var i = 0; i < objs.length; i++)
    {
        var vreturn = hitChecking(ray,objs[i]);
        if(vreturn < vhitparam)
        {
            vhitparam = vreturn;
            vhitobj = i;
        }
    }
    if(vhitobj >= 0) //hit
    {
        objs[vhitobj].setrendertag();
        var vhitpoint = ray.getPointAt(vhitparam);
        var visiblelights = g_objsmgr.detectmutilhitting(vhitobj,vhitpoint,g_lights);
        var vcolor = objs[vhitobj].materials.getPixelColorg(vhitpoint,objs[vhitobj],cam,visiblelights,g_lights);

        return add(vcolor,calcolor_reflect(cam,objs[vhitobj],vhitpoint,1));
    }
    else
    {
        return new Vector3(0,0,0) ;//background
    }
}


function calcolor_reflect(cam,obj,hitpnt,times)
{
    if(times < 0)
    {
        return new Vector3(0,0,0) ;//background
    }
    times--;

    var vhitobj = -1;
    var objs = g_objs;
    var vhitparam = 1048576;
    var vcolor = new Vector3(0,0,0);

    for(var vi = 10; vi > 0; vi--)
    {
        var vnewdirection = obj.getrandomdirection(hitpnt);
        var ray = new Ray(hitpnt,vnewdirection);
        for (var i = 0; i < objs.length; i++)
        {
            var vreturn = hitChecking(ray,objs[i]);
            if(vreturn < vhitparam)
            {
                vhitparam = vreturn;
                vhitobj = i;
            }
        }
        if(vhitobj >= 0) //hit
        {
            objs[vhitobj].setrendertag();
            var vhitpoint = ray.getPointAt(vhitparam);
            var visiblelights = g_objsmgr.detectmutilhitting(vhitobj,vhitpoint,g_lights);
            add(vcolor,objs[vhitobj].materials.getPixelColor(vhitpoint,objs[vhitobj],cam,visiblelights)); //this reflect

            add(vcolor,calcolor_reflect(cam,objs[vhitobj],vhitpoint,times)); //nectone ?
        }
    }
    vcolor = dotnum(vcolor,0.01);
    return vcolor;
}


function main()
{
    gotoextra6();
}

function gotoextra6()
{
    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 1;
    g_localillumination_enable = 1;
    g_object_triangles = 1;
    g_cam_vscale = 1;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    resetcam(context);
    //updateui();

    loaddata();
    redrawAll();
}


function updateui()
{
    try {

        var canvas = document.getElementById("viewport");
        var context = canvas.getContext("2d");
        /*window size*/
        document.getElementById("camera_w").value = context.canvas.width;
        document.getElementById("camera_h").value = context.canvas.height;

        /*camera location*/
        document.getElementById("camera_lx").value = g_cam.lookfrom.a;
        document.getElementById("camera_ly").value = g_cam.lookfrom.b;
        document.getElementById("camera_lz").value = g_cam.lookfrom.c;

        /*camera head up*/
        document.getElementById("camera_hx").value = g_cam.vup.a;
        document.getElementById("camera_hy").value = g_cam.vup.b;
        document.getElementById("camera_hz").value = g_cam.vup.c;

        /*camera  look at*/
        document.getElementById("camera_ax").value = g_cam.vlookat.a;
        document.getElementById("camera_ay").value = g_cam.vlookat.b;
        document.getElementById("camera_az").value = g_cam.vlookat.c;

        /*camera scale*/
        document.getElementById("widthheight").value = g_cam_vscale;

        document.getElementById("light_x").value = " ";
        document.getElementById("light_y").value = " ";
        document.getElementById("light_z").value = " ";

    }
    catch (e){
        console.log(e);

    }
}

function resetall()
{
    g_ambient_enable = 0;
    g_diffuse_enable = 0;
    g_specular_enable = 0;
    g_objectshading_enable = 0;
    g_localillumination_enable = 0;
    g_cam_vscale = 1;


    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    document.getElementById("camera_w").value = 256;
    document.getElementById("camera_h").value = 256;
    canvas.width = document.getElementById("camera_w").value;
    canvas.height = document.getElementById("camera_h").value;
    document.getElementById("gotopart1").checked = "checked";

    resetcam(context);
    loaddata();
    render(context);
    updateui();
}


function usedefaultdata()
{
    g_setting_useurl = 0;

    loaddata();

    redrawAll();
}

function usehttpdata()
{
    g_setting_useurl = 1;
    loaddata();
    redrawAll();
}


