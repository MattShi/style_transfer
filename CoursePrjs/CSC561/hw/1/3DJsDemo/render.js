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
var g_ambient_enable = 0;
var g_diffuse_enable = 0;
var g_specular_enable = 0;
var g_objectshading_enable = 0;
var g_localillumination_enable = 0;
var g_object_triangles = 0;
var g_debugoutput_enable = 0;
var g_minnum_zero = 0.00001;
var g_minnum_zero_negetive = -0.00001;
var g_setting_useurl = 0;
var g_location_farthest = 1048576;

/*for camera*/
var g_cam_vlookfrom ;
var g_cam_vup ;
var g_cam_vlookat;
var g_cam_vangle  = 90;
var g_cam_vscale = 1;



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

function movecam(v)
{
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    g_cam.lookfrom =  add(g_cam.lookfrom,v);
    render(context);
}

function setcamlocation(v)
{
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    g_cam_vlookfrom =  v;
    setupcam(context.canvas.width,context.canvas.height);
    render(context);
}

function setcamheadup(v)
{
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    g_cam_vup =  v;
    setupcam(context.canvas.width,context.canvas.height);
    render(context);
}


function setcamlookat(v)
{
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    g_cam_vlookat =  v;
    setupcam(context.canvas.width,context.canvas.height);
    render(context);
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

function setupcam(w,h)
{
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

function getsphereobjs() {
    if(1 == g_setting_useurl)
    {

        const INPUT_SPHERES_URL =
            "https://ncsucgclass.github.io/prog1/spheres.json";
        return geturldata(INPUT_SPHERES_URL);
    }
    else
    {

        var str = "[{\"x\": 0.25, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.25, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.6,0.0], \"specular\": [0.3,0.3,0.3]}," +
            "{\"x\": 0.75, \"y\": 0.75, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.0,0.0,0.6], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.75, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.6], \"specular\": [0.3,0.3,0.3]},"+
            "{\"x\": 0.5, \"y\": 0.5, \"z\": 0.5, \"r\":0.15, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.0], \"specular\": [0.3,0.3,0.3]}]";

       /* var str = "[{\"x\": 0.25, \"y\": 0.25, \"z\": 0.5, \"r\":0.1, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.0,0.0], \"specular\": [0.3,0.3,0.3]},{\"x\": 0.5, \"y\": 0.5, \"z\": 0.5, \"r\":0.15, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.0], \"specular\": [0.3,0.3,0.3]}]";*/

        return JSON.parse(str);
    }
} // end get input spheres

function gettriangleobjs()
{
    if(1 != g_object_triangles)
    {
        return "";
    }
    if(1 == g_setting_useurl)
    {

        const INPUT_SPHERES_URL =
            "https://ncsucgclass.github.io/prog1/triangles.json";
        return geturldata(INPUT_SPHERES_URL);
    }
    else
    {
        var str = "[{\"ambient\":[0.1,0.1,0.1], \"diffuse\":[0.0,0.6,0.0], \"specular\":[0.3,0.3,0.3]," +
            "\"vertices\":[[0.25, 0.25, 0.25],[0.5, 0.75, 0.75],[0.75,0.25,0.25]]," +
            "\"triangles\":[[0,1,2]]}]";
        return JSON.parse(str);
    }
}

function getlightobjs()
{

    if(1 == g_setting_useurl)
    {

        const INPUT_SPHERES_URL =
            "https://ncsucgclass.github.io/prog1/lights.json";
        return geturldata(INPUT_SPHERES_URL);
    }
    else
    {
        var str = "[{\"x\": 2, \"y\": 4, \"z\": -0.5, \"ambient\": [1,1,1], \"diffuse\": [1,1,1], \"specular\": [1,1,1]}]";
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
            var vhitparam = 1048576;/*1024*1024*/
            var vhitobj = -1;

            for (var i = 0; i < objs.length; i++)
            {
                var vreturn = hitChecking(ray,objs[i]);
                if(vreturn < vhitparam)
                {
                    vhitparam = vreturn;
                    vhitobj = i;
                }
            }

            var vcolor = g_defaultcolor;
            if((vhitobj >=0) && (vhitobj < objs.length))
            {

                try
                {
                    objs[vhitobj].setrendertag();
                    var vpoint = ray.getPointAt(vhitparam);
                    var visiblelights = g_lights;
                    if(1 == g_objectshading_enable)
                    {
                        visiblelights = g_objsmgr.detectmutilhitting(vhitobj,vpoint,g_lights);
                    }

                    vcolor = objs[vhitobj].materials.getPixelColor(vpoint,objs[vhitobj],cam,visiblelights);
                    if(1 == g_debugoutput_enable)
                    {
                        var vdebug = "pixel x " + vw +" y " + vh + " RGB" + vcolor.a + " " + vcolor.b + " " + vcolor.c;
                        console.log(vdebug);
                    }

                }
                catch(e)
                {
                    console.log(e);
                }

            }


            var pixelindex = (vh*imagedata.width + vw) * 4;
            setpixelcolor(imagedata.data,pixelindex,vcolor);

        }
    }


    context.putImageData(imagedata, 0, 0);
}

function rendertest(context)
{
    var imgData=context.createImageData(100,100);
    for (var i=0;i<imgData.data.length;i+=4)
    {
        imgData.data[i+0]=255;
        imgData.data[i+1]=0;
        imgData.data[i+2]=0;
        imgData.data[i+3]=255;
    }
    context.putImageData(imgData,0,0);
}

function main() {

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    resetcam(context);
    loaddata();
    render(context);
    updateui();
}

function sizechanged()
{
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    var vwid = document.getElementById("camera_w").value;
    var wHeg = document.getElementById("camera_h").value;
    if((vwid <= 0) || (wHeg <= 0))
    {
        alert("please input tow positive numbers");
        return ;
    }
    if((vwid >= window.innerWidth) || (wHeg >= window.innerHeight))
    {
        var vtip = "please input two nunber from 0,0 to"+ window.innerWidth + ","+ (window.innerHeight -30);
        alert(vtip);
        return ;
    }


    canvas.width = vwid;
    canvas.height = wHeg;

    resetcam(context);
    render(context);
}


function addlight()
{
    try
    {
        var va = Number(document.getElementById("light_x").value);
        var vb = Number(document.getElementById("light_y").value);
        var vc = Number(document.getElementById("light_z").value);

        var vcolor = new Vector3(255,255,255);
        var vvalue = new Vector3(1.0,1.0,1.0);
        addsinglelight(vcolor,new Vector3(va,vb,vc),vvalue);

        redrawAll();
    }
    catch(e)
    {
        console.log(e);
    }

}

function dellastlight()
{
    removelight();
    redrawAll();
}

function gotopart1()
{
    g_ambient_enable = 0;
    g_diffuse_enable = 0;
    g_specular_enable = 0;
    g_objectshading_enable = 0;
    g_localillumination_enable = 0;
    g_cam_vscale = 1;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    updateui();
    loadlight();
    resetcam(context);


    redrawAll();

}

function gotopart2() {
    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 0;
    g_localillumination_enable = 1;
    g_object_triangles = 0;
    g_cam_vscale = 1;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    updateui();
    loadlight();
    resetcam(context);


    loaddata();
    redrawAll();

}

function gotoextra1()
{
    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 0;
    g_localillumination_enable = 1;
    g_object_triangles = 0;
    g_cam_vscale = 1;
    

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    document.getElementById("camera_w").value = 400;
    document.getElementById("camera_h").value = 300;
    canvas.width =  document.getElementById("camera_w").value ;
    canvas.height = document.getElementById("camera_h").value;

    updateui();
    loadlight();
    resetcam(context);
    redrawAll();

}

function gotoextra2()
{
    var vcx = 0.25;
    var vcy = 0.25;
    var vcz = -0.5;

    document.getElementById("camera_lx").value = vcx;
    document.getElementById("camera_ly").value = vcy;
    document.getElementById("camera_lz").value = vcz;

    var vlx = 0.75;
    var vly = 0.75;
    var vlz = 0.5;

    document.getElementById("camera_ax").value = vlx;
    document.getElementById("camera_ay").value = vly;
    document.getElementById("camera_az").value = vlz;

    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_cam_vscale = 1;
    g_objectshading_enable = 0;
    g_localillumination_enable = 1;
    g_object_triangles = 0;


    g_cam_vlookfrom =  new Vector3(vcx,vcy,vcz);
    g_cam_vlookat =  new Vector3(vlx,vly,vlz);

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    setupcam(context.canvas.width,context.canvas.height);
    loadlight();
    updateui();

    redrawAll();
}

function gotoextra3()
{

    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 0;
    g_localillumination_enable = 1;
    g_cam_vscale = 2;
    g_object_triangles = 0;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    resetcam(context);
    loadlight();
    updateui();
    redrawAll();
}

function gotoextra4()
{
    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 1;
    g_localillumination_enable = 1;
    g_cam_vscale = 1;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    resetcam(context);
    updateui();

    var va = 0;
    var vb = 0;
    var vc = 0;
    document.getElementById("light_x").value = va;
    document.getElementById("light_y").value = vb;
    document.getElementById("light_z").value = vc;

    var vcolor = new Vector3(255,255,255);
    var vvalue = new Vector3(1.0,1.0,1.0);
    addsinglelight(vcolor,new Vector3(va,vb,vc),vvalue);


    redrawAll();

}


function gotoextra5()
{
    g_ambient_enable = 1;
    g_diffuse_enable = 1
    g_specular_enable = 1;
    g_objectshading_enable = 1;
    g_localillumination_enable = 1;
    g_object_triangles = 0;
    g_cam_vscale = 1;

    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    resetcam(context);
    updateui();
    loadlight();

    loaddata();
    redrawAll();
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
    updateui();
    loadlight();

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

function setcameralocation() {
    try {

        var vx = Number(document.getElementById("camera_lx").value);
        var vy = Number(document.getElementById("camera_ly").value);
        var vz = Number(document.getElementById("camera_lz").value);

        setcamlocation(new Vector3(vx,vy,vz));
        redrawAll();
    }
    catch (e){
        console.log(e);

    }
}

function setcameraheadup() {
    try {

        var vx = Number(document.getElementById("camera_hx").value);
        var vy = Number(document.getElementById("camera_hy").value);
        var vz = Number(document.getElementById("camera_hz").value);
        setcamheadup(new Vector3(vx,vy,vz));
        redrawAll();
    }
    catch (e){
        console.log(e);

    }
}

function setcameralookat() {
    try {

        var vx = Number(document.getElementById("camera_ax").value);
        var vy = Number(document.getElementById("camera_ay").value);
        var vz = Number(document.getElementById("camera_az").value);

        setcamlookat(new Vector3(vx,vy,vz));
        redrawAll();
    }
    catch (e){
        console.log(e);

    }
}

function  setwidthheight() {
    try
    {

        var vx = Number(document.getElementById("widthheight").value);
        g_cam_vscale = vx;
        var canvas = document.getElementById("viewport");
        var context = canvas.getContext("2d");
        resetcam(context);
        redrawAll();
    }
    catch(e)
    {
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


