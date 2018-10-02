///<reference path="gl-matrix-min.js" />
///<reference path="minMatrix.js" />
///<reference path="datadef.js" />


var g_u_spheres_g1 = null;
var g_u_spheres_g2 = null;
var g_u_spheres_center_r = 0.05;
var g_u_spheres_large_r = 0.10;
var g_u_spheres_small_r = 0.025;
var g_u_spheres_center_color = null;
var g_u_spheres_outer_color = null;

var g_u_spheremesh_latnum = 30;
var g_u_spheremesh_lognum = 30;
var G_MAX_BUFFER_SIZE = 102400;

///for webgl
var g_WebGL = null;
var g_Canvas = null;

var g_gl_vetx_buffer = null;
var g_gl_normal_buffer = null;
var g_gl_triangle_buffer = null;
var g_gl_shaderProgram = null;


//for view
var g_u_lookat = null;
var g_u_headup = null;
var g_gl_viewMtx = null;
var g_gl_porjMtx = null;
var g_u_viewAngle = 60;
var G_cfg_camerapos = [0.5,0.5,-1.0];
var G_cfg_lookdirection = [0,0,1];
var G_cfg_headup = [0,1,0];
var G_NEAREST = 0.05;
var G_FARTHEST = 100;

//for config
var G_cfg_show_surrounding = true;
var G_cfg_moving = false;
var G_cfg_enable_alpha = false;
var G_cfg_alpha = 0.5;

//for moving
var g_moving_d = [];
var g_moving_speed = 0.01;
var g_u_timer = null;


/*
 *shaders
 */
var g_v_shader_code ='\
        attribute vec3 vtPos;\
        uniform mat4 u_MVPMtx;\
        void main(void) {\
            gl_Position = u_MVPMtx * vec4(vtPos, 1.0);\
        }';

var g_f_shader_code ='\
        precision mediump float;\
        uniform vec3 vcolor;\
        uniform float falpha;\
        void main(void){\
            gl_FragColor = vec4(vcolor,falpha);}';


function setupWebGL()
{
    try
    {
        if(null === g_Canvas)
        {
            throw "Canvas is null !";
        }
        if(null === g_WebGL)
        {
            g_WebGL = g_Canvas.getContext("webgl");
        }
        if(null === g_WebGL)
        {
            throw "WebGL is null !";
        }

        g_WebGL.viewportWidth = g_Canvas.width;
        g_WebGL.viewportHeight = g_Canvas.height;

        g_WebGL.clearColor(0.0, 0.0, 0.0, 1.0);
        g_WebGL.clearDepth(1.0);
        g_WebGL.enable(g_WebGL.DEPTH_TEST);
    }
    catch(e)
    {
        console.log(e);
    }
}


function setupShaders()
{
    try
    {
        var vShader = g_WebGL.createShader(g_WebGL.VERTEX_SHADER);
        g_WebGL.shaderSource(vShader,g_v_shader_code);
        g_WebGL.compileShader(vShader);

        var fShader = g_WebGL.createShader(g_WebGL.FRAGMENT_SHADER);
        g_WebGL.shaderSource(fShader,g_f_shader_code);
        g_WebGL.compileShader(fShader);


        if (!g_WebGL.getShaderParameter(vShader, g_WebGL.COMPILE_STATUS))
        {
            var vverror = g_WebGL.getShaderInfoLog(vShader);
            g_WebGL.deleteShader(vShader);
            {
                throw "error during vertex shader compile: " + vverror;
            }
        }
        else if (!g_WebGL.getShaderParameter(fShader, g_WebGL.COMPILE_STATUS))
        {
            var vferror = g_WebGL.getShaderInfoLog(fShader);
            g_WebGL.deleteShader(fShader);
            {
                throw "error during fragment shader compile: " + vferror;
            }
        }
        else
        {
            var shaderProgram = g_WebGL.createProgram();
            g_WebGL.attachShader(shaderProgram, fShader);
            g_WebGL.attachShader(shaderProgram, vShader);
            g_WebGL.linkProgram(shaderProgram);

            if (!g_WebGL.getProgramParameter(shaderProgram, g_WebGL.LINK_STATUS))
            {
                throw "error during shader program linking: " + g_WebGL.getProgramInfoLog(shaderProgram);
            }
            else
            {
                g_WebGL.useProgram(shaderProgram);
                g_gl_shaderProgram = shaderProgram;
            }
        }
    }
    catch(e)
    {
        console.log(e);
    }
}


function renderobjs()
{
    renderbygroup(g_u_spheres_g1);
    renderbygroup(g_u_spheres_g2);
}

function renderbygroup(gp)
{
    var vcenter = vec3.fromValues(0,0,0);
    for(var vr = 0; vr < gp.sps.length; vr ++)
    {
        if(!gp.sps[vr].display )
        {
            continue;
        }

        //surrounding
        if(vr > 0 && (!G_cfg_show_surrounding))
        {
            continue;
        }

        /*pbuffer : pnts, nbuffer : normals, tbuffer : triangles, vubuffer:vus*/
        var vobj = gp.sps[vr].objs;

        //change color
        setuniform3f("vcolor",gp.sps[vr].cl);

        //center
        vec3.add(vcenter,gp.c,gp.sps[vr].c);
        setupViewMtx(vcenter);

        //set buffer
        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vetx_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.pbuffer));
        setattribute("vtPos",g_gl_vetx_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER,g_gl_triangle_buffer);
        g_WebGL.bufferSubData(g_WebGL.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(vobj.tbuffer));

        g_WebGL.drawElements(g_WebGL.TRIANGLES,vobj.tbuffer.length,g_WebGL.UNSIGNED_SHORT,0);
    }
}


function calrelativecorrbycircle(pos,angle,r)
{
   return vec3.fromValues(pos[0] + r*Math.cos(angle),pos[1] + r*Math.sin(angle),pos[2]);
}


function loadspheres()
{
    g_u_spheres_center_color = vec3.fromValues(0,0,255);
    g_u_spheres_outer_color = vec3.fromValues(0,255,0);
    //two group
    //1st one
    var vgc1 =  vec3.fromValues(0.5,0.5,0.5);
    var vc =  vec3.fromValues(0,0,0);
    g_u_spheres_g1 = new SphereGroup(vgc1);
    //1st one should be center one
    var vcentersphere1 = new Sphere(vc,g_u_spheres_center_r,g_u_spheres_center_color);
    g_u_spheres_g1.sps.push(vcentersphere1);
    for(var vidx = 0; vidx < 6;vidx ++)
    {
        var vsphere = new Sphere(calrelativecorrbycircle(vc,vidx*Math.PI/3,(g_u_spheres_center_r)),g_u_spheres_small_r,g_u_spheres_outer_color);
        g_u_spheres_g1.sps.push(vsphere);
    }

    //changed color
    g_u_spheres_center_color = vec3.fromValues(255,0,0);
    g_u_spheres_outer_color = vec3.fromValues(0,255,255);

    var vc2 =  vec3.fromValues(0.5,0.5,0.5);
    g_u_spheres_g2 = new SphereGroup(vc2);
    var vcentersphere2 = new Sphere(vc,g_u_spheres_center_r,g_u_spheres_center_color);
    g_u_spheres_g2.sps.push(vcentersphere2);
    for(var vidx = 0; vidx < 6;vidx ++)
    {
        var vsphere = new Sphere(calrelativecorrbycircle(vc,vidx*Math.PI/3,(g_u_spheres_large_r)),g_u_spheres_large_r,g_u_spheres_outer_color);
        g_u_spheres_g2.sps.push(vsphere);
    }
}

function buildspheremesh(latitudenum, longitudenum, rad, center)
{
    var pnts = [];
    var normals = [];
    var triangles = [];
    var vus = [];
    for(var latidx = 0; latidx <= latitudenum; latidx ++)  //break sphere to points
    {
        var angle = Math.PI / latitudenum * latidx;   //
        var y = Math.cos(angle);   //y pose
        var xz = Math.sin(angle);   //x-z plane
        for(var logidx = 0; logidx <= longitudenum; logidx++)  //break x-a plane
        {
            var anglexz = Math.PI * 2/longitudenum * logidx;
            var rx = xz * rad * Math.cos(anglexz);
            var rz = xz * rad * Math.sin(anglexz);
            var ry = y * rad;
            var u = 1 - (logidx/longitudenum);
            var v = 1 - (latidx/latitudenum);
            vus.push(u,v);
            pnts.push(rx + center[0], ry + center[1], rz + center[2]);   //offset
            normals.push(rx, ry, rz); //use the point pos as its normal
        }
    }
    var pntidx = 0;
    for(latidx = 0; latidx < latitudenum; latidx++)
    {
        for(logidx = 0; logidx < longitudenum; logidx++)
        {
            pntidx = (longitudenum + 1) * latidx + logidx;
            triangles.push(pntidx, pntidx + 1, pntidx + longitudenum + 2);
            triangles.push(pntidx, pntidx + longitudenum + 2, pntidx + longitudenum + 1);
        }
    }
    return {pbuffer : pnts, nbuffer : normals, tbuffer : triangles, vubuffer:vus};
}

function buildmodel()
{
   for(var vid = 0;vid < g_u_spheres_g1.sps.length;vid ++)
   {
       g_u_spheres_g1.sps[vid].objs = buildspheremesh(g_u_spheremesh_latnum,g_u_spheremesh_lognum,g_u_spheres_g1.sps[vid].r,g_u_spheres_g1.sps[vid].c);
   }
   for(var vid = 0;vid < g_u_spheres_g2.sps.length;vid ++)
   {
       g_u_spheres_g2.sps[vid].objs = buildspheremesh(g_u_spheremesh_latnum,g_u_spheremesh_lognum,g_u_spheres_g2.sps[vid].r,g_u_spheres_g2.sps[vid].c);
   }
}

function initialmovdirection()
{
    var vangle = 2*Math.PI*Math.random();
    g_moving_d[0] = vec3.fromValues(Math.cos(vangle),Math.sin(vangle),0);

    vangle = 2*Math.PI*Math.random();
    g_moving_d[1] = vec3.fromValues(Math.cos(vangle),Math.sin(vangle),0);
}


function createBuffer(vBufData,vBufType,varDataType,vDrawType)
{
    try
    {
        var vBufObj = g_WebGL.createBuffer();
        g_WebGL.bindBuffer(vBufType,vBufObj);
        g_WebGL.bufferData(vBufType, (varDataType  === "Uint16Array") ?new Uint16Array(vBufData): new Float32Array(vBufData), vDrawType);
        g_WebGL.bindBuffer(vBufType, null);
        return vBufObj;
    }
    catch(e)
    {
        console.log(e);
    }
}

function setattribute(vname,vbuffer,vlength)
{
    try
    {
        var vID = g_WebGL.getAttribLocation(g_gl_shaderProgram, vname);
        if(vID >= 0)
        {
            g_WebGL.vertexAttribPointer(vID,vlength,g_WebGL.FLOAT,false,0,vbuffer);
            g_WebGL.enableVertexAttribArray(vID);
        }
    }
    catch(e)
    {
        console.log(e);
    }
}

function setuniform3f(vname,vData)
{
    try
    {
        var vUniform = g_WebGL.getUniformLocation(g_gl_shaderProgram, vname);
        g_WebGL.uniform3f(vUniform, vData[0],vData[1],vData[2]);
    }
    catch(e)
    {
        console.log(e);
    }
}

function setuniform1f(vname,vData)
{
    try
    {
        var vUniform = g_WebGL.getUniformLocation(g_gl_shaderProgram, vname);
        g_WebGL.uniform1f(vUniform, vData);
    }
    catch(e)
    {
        console.log(e);
    }
}

function setupViewMtx(modelcenter)
{
    try
    {
        var mativ = new matIV();


        g_gl_viewMtx = mativ.identity(mativ.create());
        var lookat = vec3.create();
        vec3.add(lookat,g_u_cameraPos,g_u_lookat);
        mativ.lookAt(g_u_cameraPos, [lookat[0],lookat[1],lookat[2]], g_u_headup, g_gl_viewMtx);

        var modelmtx = mativ.identity(mativ.create());
        mativ.translate(modelmtx,modelcenter,modelmtx); //trans

        var mvpMatrix = mativ.identity(mativ.create());
        mativ.multiply(g_gl_porjMtx, g_gl_viewMtx, mvpMatrix);
        mativ.multiply(mvpMatrix, modelmtx, mvpMatrix);

        var uMVPMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_MVPMtx");
        g_WebGL.uniformMatrix4fv(uMVPMtx, false, mvpMatrix);
    }
    catch(e)
    {
        console.log(e);
    }
}

function posdetect(dc,d)
{
    var df = vec3.fromValues(1,1,1);
    vec3.add(df,dc,d);
    if(df[0] < 0 || df[0] > 1)
    {
        //cross x
        return  vec3.fromValues(-1,1,1);
    }
    if(df[1] < 0 || df[1] > 1)
    {
        //cross y
        return vec3.fromValues(1,-1,1);
    }
    return vec3.fromValues(1,1,1);
}


function updatepos()
{
    for(var vid = 0; vid < g_moving_d.length;vid ++)
    {
        var vcenter = vec3.fromValues(0,0,0);
        var vscale = vec3.fromValues(1,1,1);
        vec3.scale(vscale,g_moving_d[vid],g_moving_speed);

        if(vid == 0)
        {
            var vdf = posdetect(g_u_spheres_g1.c,vscale);
            g_moving_d[vid] = vec3.fromValues(vdf[0]*g_moving_d[vid][0],vdf[1]*g_moving_d[vid][1],vdf[2]*g_moving_d[vid][2]);

            vec3.scale(vscale,g_moving_d[vid],g_moving_speed);
            vec3.add(vcenter,g_u_spheres_g1.c,vscale);

            g_u_spheres_g1.c = vcenter;
        }
        else
        {
            var vdf = posdetect(g_u_spheres_g2.c,vscale);
            g_moving_d[vid] = vec3.fromValues(vdf[0]*g_moving_d[vid][0],vdf[1]*g_moving_d[vid][1],vdf[2]*g_moving_d[vid][2]);

            vec3.add(vcenter,g_u_spheres_g2.c,vscale);
            g_u_spheres_g2.c = vcenter;
        }
    }
}

function ontimer()
{
    if(G_cfg_moving)
    {
        updatepos();
        renderobjs();
    }
    starttimer();
}

function starttimer()
{
    g_u_timer = setTimeout("ontimer()",80);
}

function  stoptimer()
{
    if(null !== g_u_timer)
    {
        clearTimeout(g_u_timer);
        g_u_timer = null;
    }
}


/*
set up
* */

function setViewParams()
{
    if(null === g_WebGL)
    {
        console.log("WebGL is null !");
    }
    else
    {
        try
        {
            g_u_cameraPos = G_cfg_camerapos;

            g_u_lookat = [];
            g_u_lookat.push(G_cfg_lookdirection[0],G_cfg_lookdirection[1],G_cfg_lookdirection[2]);
            g_u_headup = [];
            g_u_headup.push(G_cfg_headup[0],G_cfg_headup[1],G_cfg_headup[2]);

            var m = new matIV();
            g_gl_viewMtx = m.identity(m.create());
            g_gl_porjMtx = m.identity(m.create());
            m.lookAt(g_u_cameraPos, [g_u_lookat[0] + g_u_cameraPos[0],g_u_lookat[1] + g_u_cameraPos[1],g_u_lookat[2] + g_u_cameraPos[2]], g_u_headup, g_gl_viewMtx);
            //m.perspective(g_u_viewAngle, g_WebGL.viewportWidth / g_WebGL.viewportHeight, G_NEAREST, G_FARTHEST, g_gl_porjMtx);
            m.ortho(g_gl_porjMtx,-1,1,-1,1,0,100);
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

function setupCanvas()
{
    g_Canvas = document.getElementById("viewport");
}


function setupObjs()
{
    var vafloat = [];
    vafloat.length  = G_MAX_BUFFER_SIZE;
    var vaint = [];
    vaint.length =  G_MAX_BUFFER_SIZE;

    g_gl_vetx_buffer = createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_triangle_buffer = createBuffer(vaint,g_WebGL.ELEMENT_ARRAY_BUFFER,"Uint16Array",g_WebGL.DYNAMIC_DRAW);

    loadspheres();
    buildmodel();
    initialmovdirection();
    setuniform1f("falpha",G_cfg_alpha);
}

function setupAll()
{
    setupCanvas();
    setupWebGL();
    setViewParams();
    setupShaders();
    setupObjs();
    starttimer();
    enableglobalalpha();
    renderobjs();
}



//////////////////////////////////////////////
function enable_surround()
{
    G_cfg_show_surrounding = !G_cfg_show_surrounding;
    renderobjs();
}

function enable_move()
{
    G_cfg_moving = !G_cfg_moving;
    renderobjs();
}

function enableglobalalpha()
{
    G_cfg_enable_alpha = !G_cfg_enable_alpha;
    if(G_cfg_enable_alpha)
    {
        G_cfg_alpha = 0.5;
        g_WebGL.enable(g_WebGL.BLEND);
        g_WebGL.disable(g_WebGL.DEPTH_TEST);
        g_WebGL.blendFunc(g_WebGL.SRC_ALPHA, g_WebGL.ONE);
    }
    else
    {
        G_cfg_alpha = 1.0;
        g_WebGL.disable(g_WebGL.BLEND);
        g_WebGL.enable(g_WebGL.DEPTH_TEST);
    }
    setuniform1f("falpha",G_cfg_alpha);
    renderobjs();
}

function reset()
{
    g_u_spheres_g1.c = vec3.fromValues(0.5,0.5,0.5);
    g_u_spheres_g2.c = vec3.fromValues(0.5,0.5,0.5);
    renderobjs();
}
//////////////////////////////////////////////