/**
 * Created by Fangyuan on 06/10/2016.
 */
///<reference path="gl-matrix-min.js" />
///<reference path="minMatrix.js" />
///<reference path="datadef.js" />

///for constant values
var G_NET_200 = 200;
var G_TIME_OUT = 3000;
var G_NEAREST = 0.05;
var G_FARTHEST = 100;
var G_MAX_BUFFER_SIZE = 102400;
var G_DEGREE2RAD = Math.PI/180.0;
var G_MAX_LIGHTNUM = 10;

var G_TRIANGLES_HTTP = "https://ncsucg4games.github.io/prog2/triangles.json";
var G_SPHERES_HTTP = "https://ncsucg4games.github.io/prog2/spheres.json";
var G_LIGHTS_HTTP = "https://ncsucgclass.github.io/prog3/lights.json";
var G_HTTP_TEXTURE_PREFIX = "https://ncsucgclass.github.io/prog3/";
var G_HTTP_ROOMS = "https://ncsucg4games.github.io/prog2/rooms.json";
var G_TEXTURE_FLOOR = "https://raw.githubusercontent.com/MattShi/17SCSC562HW/master/2/Floor.jpg";
var G_TEXTURE_CEILLING = "https://raw.githubusercontent.com/MattShi/17SCSC562HW/master/2/ceiling.jpg";
var G_TEXTURE_CELL = "https://raw.githubusercontent.com/MattShi/17SCSC562HW/master/2/cell.jpg";

//for defaule values
var G_cfg_camerapos = [0.5,0.6,0.5];
var G_cfg_lookdirection = [1,0,0];
var G_cfg_headup = [0,1,0];

//for configure
var G_cfg_usehttpfile = 1;
var G_cfg_enable_lighting = 1;
var G_cfg_culling_mode = 0; // 0 none 1 frustum 2 protal

var G_cfg_cell_offset_y = 0.1;
var G_cfg_cell_len_y = 0.8;
var G_cfg_cell_len_x = 0.3;
var G_cfg_cell_len_z = G_cfg_cell_len_x;
var G_cfg_ceilling_texture = 1;
var G_cfg_floor_texture = 0;

///for webgl
var g_WebGL = null;
var g_Canvas = null;

var g_gl_vetx_buffer = null;
var g_gl_normal_buffer = null;
var g_gl_triangle_buffer = null;
var g_gl_vu_buffer = null;
var g_gl_shaderProgram = null;

var g_gl_viewMtx = null;
var g_gl_porjMtx = null;

///for user data
var g_u_Lights = [];

var g_u_cameraPos = null;
var g_u_cameraPos_last = [];
var g_u_lookat = null;
var g_u_headup = null;
var g_u_viewAngle = 60;
var g_u_move_step_unit = 0.03;
var g_u_rotate_step_unit = 15;
var g_u_global_alpha = 1;

var g_u_spheremesh_latnum = 30;
var g_u_spheremesh_lognum = 30;

var g_u_a_objects = null;
var g_u_objectidmax = 0;
var g_u_needtoload_num = 0;

var g_u_frameinfo = null;
var g_u_ceiling = [];
var g_u_rooms = [];
var g_u_rooms_rendered = [];
var g_u_cells = [];
var g_u_octtree = null;
var g_u_triangles = [];
var g_u_spheres = [];
var g_u_furniture = [];
var g_u_furniture_m_mtx = [];
var g_m_cell = [];
var g_m_f = [];
var g_u_pics = [];
var g_u_ObjsTexture = [];

var g_u_reset = false;

var g_u_timer = null;
var g_u_renderidx = [];

/*
 *shaders
*/
var g_v_shader_code ='\
        attribute vec3 vtPos;\
        attribute vec3 vtNormal;\
        attribute vec2 vTextC;\
        uniform mat4 u_MVPMtx;\
        uniform mat4 u_ModelViewMtx;\
        uniform mat4 u_NormalMtx;\
        uniform vec3 vEyePos;\
        uniform vec3 vLightPos;\
        varying vec3 vNormal;\
        varying vec3 vPosition;\
        varying vec3 vEyeD;\
        varying vec2 vTextureCoord;\
        void main(void) {\
            vec4 vworldp = u_ModelViewMtx*vec4(vtPos,1.0);\
            vPosition   = vworldp.xyz;\
            vNormal     = (u_NormalMtx*vec4(vtNormal,0.0)).xyz;\
            gl_Position = u_MVPMtx * vec4(vtPos, 1.0);\
            vEyeD = vEyePos - vPosition;\
            vTextureCoord = vTextC;\
        }';

var g_f_shader_code ='\
        precision mediump float;\
        struct light {vec3 vp; vec3 amcolor; vec3 difcolor; vec3 spccolor;};\
        uniform light lights[10];\
        uniform int lightnumber;\
        uniform int enabletextureal;\
        uniform vec3 vLightColor;\
        uniform vec3 vtAmbient;\
        uniform vec3 vtDiff;\
        uniform vec3 vtSpec;\
        uniform float fSpec;\
        uniform float fuselighting;\
        uniform float u_alpha_t;\
        uniform mat4 u_fModelViewMtx;\
        uniform sampler2D u_texture2D;\
        varying vec3 vPosition;\
        varying vec3 vNormal;\
        varying vec3 vEyeD;\
        varying vec2 vTextureCoord;\
        void main(void){\
        vec4 vtexturecol = texture2D(u_texture2D, vec2(vTextureCoord.s, vTextureCoord.t));\
        if(enabletextureal <= 0) {vtexturecol.a = 1.0;}\
        if(fuselighting > 0.0){\
            vec3 N = normalize(vNormal).xyz;\
            vec3 V = normalize(vEyeD.xyz);\
            vec3 fcolor = vec3(0.0,0.0,0.0);\
            for(int lgihtidx = 0; lgihtidx < 10; lgihtidx++)\
            {\
                if(lgihtidx >= lightnumber) {break;}\
                vec4 vl = u_fModelViewMtx*vec4(lights[lgihtidx].vp,1.0) - vec4(vPosition,0.0);\
                vec3 L = normalize(vl.xyz);\
                vec3 R = 2.0*dot(L,N)*N - L;\
                vec3 ambient = lights[lgihtidx].amcolor*vtAmbient;\
                vec3 diffuse   = lights[lgihtidx].difcolor*vtDiff*clamp(dot(L,N), 0.0, 1.0);\
                vec3 specular  = lights[lgihtidx].spccolor*vtSpec*pow(clamp(dot(R, V), 0.0, 1.0), fSpec);\
                fcolor += clamp(ambient + diffuse + specular,0.0,1.0);\
            }\
            gl_FragColor = clamp(vec4(fcolor.rgb + vtexturecol.rgb,vtexturecol.a),0.0,1.0);} else{gl_FragColor = vtexturecol; }\
            gl_FragColor.a = gl_FragColor.a*u_alpha_t;}';

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


function onKeyDown(kevent)
{
    var key = kevent.key;
    console.log(key + " down");
    var vMove = null;
    var vrote = 0;
    var vaxis = null;
    var vnexttriangle = 0.0;
    var vnextsphere = 0.0;
    g_u_cameraPos_last = [g_u_cameraPos[0],g_u_cameraPos[1],g_u_cameraPos[2]];
    switch(key)
    {
        case 'ArrowDown': {vMove = vec3.fromValues(-g_u_move_step_unit,0,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //a left
            break;
        case 'ArrowUp': {vMove = vec3.fromValues(g_u_move_step_unit,0,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //d left
            break;
        case 'ArrowRight': {vMove = vec3.fromValues(0,0,g_u_move_step_unit);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //w forward
            break;
        case 'ArrowLeft': {vMove = vec3.fromValues(0,0,-g_u_move_step_unit);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //s backward
            break;
        case 'q': {vMove = vec3.fromValues(0,-g_u_move_step_unit,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //q up
            break;
        case 'e': {vMove = vec3.fromValues(0,g_u_move_step_unit,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //e down
            break;
        case 'A': {vrote = 360 - g_u_rotate_step_unit; vec3.rotateY(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; // A rotate view left and right around view Y 
            break;
        case 'D': {vrote = g_u_rotate_step_unit; vec3.rotateY(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; //D
            break;
        case 'W': {vrote = g_u_rotate_step_unit; vec3.rotateX(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; //w  rotate view forward and backward around view X 
            break;
        case 'S': {vrote = 360 - g_u_rotate_step_unit; vec3.rotateX(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; //S
            break;
        case 'Q': {vrote = g_u_rotate_step_unit;vec3.rotateZ(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; // Q rotate selection (counter-)clockwise around view Z (roll)
            break;
        case 'E': {vrote = 360 - g_u_rotate_step_unit; vec3.rotateZ(g_u_lookat,g_u_lookat,g_u_cameraPos,vrote*G_DEGREE2RAD);}; //e down
            break;
        case 'Escape' : {g_u_reset = true; };
            break;
        default:break;
    }
    try
    {
        if((null !== vMove) || vrote > 0)
        {  
            renderObjs();
            collisiondetect();
        }
        else if(true === g_u_reset)
        {
            g_u_reset = false;
            resetviewandprjparams();
        }
    }
    catch(e)
    {
        console.log(e);
    }
}

function resetviewandprjparams()
{
    setViewParams();
    renderObjs();
}

function vec3subtract(v1,v2)
{
    return vec3.fromValues(v1[0]-v2[0],v1[1]- v2[1],v1[2] - v2[2]);
}

function vec3average3(v1,v2,v3)
{
    return vec3.fromValues((v1[0]+ v2[0] + v3[0])/3,(v1[1]+ v2[1] + v3[2])/3,(v1[2]+ v2[2] + v3[2])/3);
}

function addv3(v1,v2)
{
    return [v1[0]+v2[0],v1[1]+v2[1],v1[2]+v2[2]];
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

function setuniform1f(vname,vdata)
{
    try
    {
         var vUniform = g_WebGL.getUniformLocation(g_gl_shaderProgram, vname);
        g_WebGL.uniform1f(vUniform, vdata); 
    }
    catch(e)
    {
        console.log(e);
    }
}

function setuniform1i(vname,vdata)
{
    try
    {
         var vUniform = g_WebGL.getUniformLocation(g_gl_shaderProgram, vname);
        g_WebGL.uniform1i(vUniform, vdata); 
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

function checksize(v)
{
    return ((v & (v - 1)) === 0);
}

function setsingletexture(w, h)
{
    if (checksize(w) && checksize(h))
    {
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_MIN_FILTER, g_WebGL.LINEAR_MIPMAP_LINEAR);
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_MAG_FILTER, g_WebGL.LINEAR);
        g_WebGL.generateMipmap(g_WebGL.TEXTURE_2D);
    }
    else
    {
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_WRAP_S, g_WebGL.CLAMP_TO_EDGE);
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_WRAP_T, g_WebGL.CLAMP_TO_EDGE);
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_MIN_FILTER, g_WebGL.LINEAR);
        g_WebGL.texParameteri(g_WebGL.TEXTURE_2D, g_WebGL.TEXTURE_MAG_FILTER, g_WebGL.LINEAR);
    }
}

function loadimage(vidx)
{
    try
    {
        g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, g_u_ObjsTexture[vidx]);
        g_WebGL.pixelStorei(g_WebGL.UNPACK_FLIP_Y_WEBGL, true);
        g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, g_u_ObjsTexture[vidx]);
        g_WebGL.texImage2D(g_WebGL.TEXTURE_2D, 0, g_WebGL.RGBA, g_WebGL.RGBA, g_WebGL.UNSIGNED_BYTE,g_u_ObjsTexture[vidx].image);
        setsingletexture(g_u_ObjsTexture[vidx].image.width,g_u_ObjsTexture[vidx].image.height);
        g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, null);

        if(0 === g_u_needtoload_num )
        {
            renderObjs();
        }
    }
    catch(e)
    {
        console.log(e);
    }
}

function handleLoadedPic(texture)
{
    try
    {
        if(g_u_needtoload_num > 0)
        {
            g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, g_u_ObjsTexture[g_u_needtoload_num-1]);
            g_WebGL.pixelStorei(g_WebGL.UNPACK_FLIP_Y_WEBGL, true);
            g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, g_u_ObjsTexture[g_u_needtoload_num-1]);
            g_WebGL.texImage2D(g_WebGL.TEXTURE_2D, 0, g_WebGL.RGBA, g_WebGL.RGBA, g_WebGL.UNSIGNED_BYTE,g_u_ObjsTexture[g_u_needtoload_num-1].image);
            setsingletexture(g_u_ObjsTexture[g_u_needtoload_num-1].image.width,g_u_ObjsTexture[g_u_needtoload_num-1].image.height);
            g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, null);
        }

        g_u_needtoload_num--;
        if(0 === g_u_needtoload_num )
        {
            renderObjs();
        }

    }
    catch(e)
    {
        console.log(e);
    }
}

function ontimer()
{
    var vallcpl = true;
    var vi = g_u_ObjsTexture.length;
    while(vi > 0)
    {
        vi--;
        if(!g_u_ObjsTexture[vi].image.complete)
        {
            vallcpl = false;
            break;
        }
        else
        {
            loadimage(vi);
        }
    }
    if(vallcpl)
    {
        stoptimer();
        renderObjs();
    }
    //else
    {
        setTimeout("ontimer()",500);
    }

}

function starttimer()
{
    if(null !== g_u_timer)
    {
        return ;
    }
    g_u_timer = setTimeout("ontimer()",200);
}

function  stoptimer()
{
   if(null !== g_u_timer)
   {
       clearTimeout(g_u_timer);
       g_u_timer = null;
   }
}

function initobjecttexture()
{
    try
    {
        for(var vIDX = 0; vIDX < g_u_pics.length ; vIDX ++ )
        {
            g_u_ObjsTexture.push(g_WebGL.createTexture());
            g_u_ObjsTexture[g_u_ObjsTexture.length-1].image = new Image();
            g_u_ObjsTexture[g_u_ObjsTexture.length-1].image.crossOrigin = "Anonymous";
            g_u_ObjsTexture[g_u_ObjsTexture.length-1].image.onload = function ()
            {
                handleLoadedPic(g_u_ObjsTexture[g_u_ObjsTexture.length-1]);
            }
            g_u_needtoload_num++;
            g_u_ObjsTexture[g_u_ObjsTexture.length-1].image.src = g_u_pics[vIDX];
        }
        starttimer();
    }
    catch(e)
    {
        console.log(e);
    }
}

function updateTexture(textureid)
{
    try
    {
        //var objtexture = g_u_ObjsTexture[g_u_a_objects[vObjIdx].material.pic];
        var objtexture = g_u_ObjsTexture[textureid];
        if(objtexture != null)
        {
            g_WebGL.activeTexture(g_WebGL.TEXTURE0); //default texture
            g_WebGL.bindTexture(g_WebGL.TEXTURE_2D, objtexture);
            g_WebGL.uniform1i(g_gl_shaderProgram.u_texture2D, 0);
        }
    }
    catch(e)
    {
        console.log(e);
    }
}

function updateMatrix(vid)
{
    try
    {
        var mativ = new matIV();

        g_gl_viewMtx = mativ.identity(mativ.create());
        var lookat = vec3.create();
        vec3.add(lookat,g_u_cameraPos,g_u_lookat);
        mativ.lookAt(g_u_cameraPos, [lookat[0],lookat[1],lookat[2]], g_u_headup, g_gl_viewMtx);

        var modelmtx = mativ.identity(mativ.create());
        if(vid >= 0)
        {
            modelmtx = g_u_furniture_m_mtx[vid];
        }
        var mvpMatrix = mativ.identity(mativ.create());
        mativ.multiply(g_gl_porjMtx, g_gl_viewMtx, mvpMatrix);
        mativ.multiply(mvpMatrix, modelmtx, mvpMatrix);

        var uMVPMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_MVPMtx");
        g_WebGL.uniformMatrix4fv(uMVPMtx, false, mvpMatrix);

        var uMVMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_ModelViewMtx");
        var mvMtx = mativ.identity(mativ.create());
        mativ.multiply(modelmtx, g_gl_viewMtx, mvMtx);
        g_WebGL.uniformMatrix4fv(uMVMtx, false, mvMtx);

        var ufMVMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_fModelViewMtx");
        g_WebGL.uniformMatrix4fv(ufMVMtx, false, mvMtx);

        var uNMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_NormalMtx");
        var nMtx = mativ.identity(mativ.create());
        mativ.inverse(mvMtx,nMtx);
        mativ.transpose(nMtx,nMtx);
        g_WebGL.uniformMatrix4fv(uNMtx, false, nMtx);


    }
    catch(e)
    {
        console.log(e);
    }
}

function getoctreerootbyregion(t,s,e)
{
    if(t == null)
    {
       return null;
    }

    if((t.s[0] <= s[0]) && (t.s[1] <= s[2]) && (t.e[1] >= e[2]) && (t.e[0] >= e[0]))
    {
        var vt1 = getoctreerootbyregion(t.lt,s,e);
        var vt2 = getoctreerootbyregion(t.lb,s,e);
        var vt3 = getoctreerootbyregion(t.rt,s,e);
        var vt4 = getoctreerootbyregion(t.rb,s,e);
        if(vt1 == null && vt2 == null && vt3 == null && vt4 == null)
        {
            return t;
        }
        else
        {
            if(vt1 != null)
            {
                return vt1;
            }
            if(vt2 != null)
            {
                return vt2;
            }
            if(vt3 != null)
            {
                return vt3;
            }
            if(vt4 != null)
            {
                return vt4;
            }
        }
    }
    else
    {
        return null;
    }

}



function doculling()
{
    //reset
    for(var vcells = 0;vcells < g_u_cells.length; vcells++)
    {
        var cells = g_u_cells[vcells];
        for(var vcell = 0;vcell < cells.length;vcell++)
        {
            g_u_cells[vcells][vcell].rendered = 0;
        }
    }
    //cell
    if(G_cfg_culling_mode == 0)
    {
        resetdrawoffurniture(true);
        g_u_a_objects = [];
        for(var vi = 0;vi < g_u_cells.length; vi++)
        {
            var vcells = g_u_cells[vi];
            for(var vj= 0; vj < vcells.length; vj++)
            {
                var objs = vcells[vj].getrenderobjs();
                for(var vobj = 0 ; vobj < objs.length; vobj++)
                {
                    g_u_a_objects.push(objs[vobj]);
                }
            }
        }
    }
    else if(G_cfg_culling_mode == 1)
    {
        resetdrawoffurniture(false);
        dofrustumculling();
    }
    else if(G_cfg_culling_mode == 2)
    {
        resetdrawoffurniture(false);
        doportalsculling();
    }

}

function checkdirection(e,vl,vr)
{
    var v2l = vec2.fromValues(vl[0] - e[0],vl[2] - e[2]);
    var v2r = vec2.fromValues(vr[0] - e[0],vr[2] - e[2]);
    var vcross = [0,0,0];
    vec2.cross(vcross,v2r,v2l);
    return vcross[2];
}

function dofrustumculling()
{
    //cell
    try
    {
        var vplanes = getfrustumplanes(g_gl_porjMtx,g_gl_viewMtx);
        if(null != g_u_octtree)
        {
            g_u_a_objects = [];
            frustumbyoctree(g_u_octtree,vplanes,g_u_a_objects,0,-1);
        }
    }
    catch(e)
    {
        console.log(e);
    }
}


function collisiondetect()
{
    var vcellpos = getcellbypos(g_u_cameraPos);
    var vcellinfo =  g_u_cells[vcellpos[1]][vcellpos[0]];
    if(vcellinfo.rid === 's')
    {
        g_u_cameraPos = g_u_cameraPos_last;
        renderObjs();
    }
}

function getcellbyroom(rid)
{
    var vcell = [];
    try
    {
        var s = [g_u_rooms[rid].s[2],g_u_rooms[rid].s[0]];
        var e = [g_u_rooms[rid].e[2],g_u_rooms[rid].e[0]];
        for(var vcellsid = s[1]-1;vcellsid <= e[1]+1;vcellsid++)
        {
            for(var vcellid = s[0]-1;vcellid <= e[0]+1;vcellid++)
            {
                if(g_u_cells[vcellsid][vcellid].isvalid())
                {
                    vcell.push(g_u_cells[vcellsid][vcellid]);
                }
            }
        }
    }
    catch(e)
    {
        console.log(e);
    }

    return vcell;
}

function iscellinroom(c,r)
{
    var re = r.e;
    var rs = r.s;
    rs = [rs[0]-1,rs[1]-1,rs[2]-1];
    re = [re[0] + 1,re[1]+1,re[2]+1];
    if(c.r_x < rs[0] || c.r_x > re[0])
    {
        return false;
    }
    if(c.r_z < rs[2] || c.r_z > re[2])
    {
        return false;
    }
    return true;

}

function frustumbyoctree(root,vplanes,containor,from,target)
{
    try
    {
        if(null == root)
        {
            return ;
        }
        if(from == target)
        {
            return ;
        }


        if(root.getisleaf())
        {
            var vcellls = chechisemptycell(root.s,root.e);

            console.log("check oct tree leaf pos from " + root.s[0] + " "+ root.s[1] + " to " + root.e[0] + " "+ root.e[1]);
            for(var vi = 0 ; vi < vcellls.length; vi++)
            {
                if(vcellls[vi].rendered == 1)
                {
                    continue;
                }

                if(target >= 0)
                {
                    if((target != vcellls[vi].rid) && (!isNaN(vcellls[vi].rid)))
                    {
                        continue; //skip
                    }
                    if(!iscellinroom(vcellls[vi],g_u_rooms[target]))
                    {
                        continue; //skip
                    }
                }

                var vobjcenter = vcellls[vi].getcenterpos();
                var vobjsize = [G_cfg_cell_len_x/2,G_cfg_cell_len_y/2,G_cfg_cell_len_z/2];
                if(!checkcellisvisible(vplanes,vobjcenter[0],vobjcenter[1],vobjcenter[2],vobjsize[0],vobjsize[1],vobjsize[2]))
                {
                    continue; //skip
                }

                if(target >= 0 && vcellls[vi].rid ==='p')
                {
                    var vtarget = vcellls[vi].connectroom;
                    if(vtarget.length >= 2)
                    {
                        var vtroom = vcellls[vi].connectroom[0];
                        if(vtroom == target)
                        {
                            vtroom = vcellls[vi].connectroom[1];
                        }
                        if(vtroom != from)
                        {
                            portalscullingbyp(vcellls[vi],g_u_octtree,containor,vplanes,target,vtroom);
                        }
                    }
                }
                else
                {
                    if(vcellls[vi].attachobj != undefined)
                    {
                        g_u_furniture[vcellls[vi].attachobj].r = true;
                    }
                    var objs = vcellls[vi].getrenderobjs();
                    for(var vobj = 0 ; vobj < objs.length; vobj++)
                    {
                        containor.push(objs[vobj]);
                        vcellls[vi].rendered = 1;
                    }
                }
                console.log(vcellls[vi].rid + " is visible r pos = " + vcellls[vi].r_x + " "+ vcellls[vi].r_z);
            }
            return ;
        }
        else
        {
            var vscell = g_u_cells[root.s[1]][root.s[0]];
            var vobjsize = [G_cfg_cell_len_x*(root.e[0] - root.s[0] + 1)/2,G_cfg_cell_len_y/2,G_cfg_cell_len_z*(root.e[1] - root.s[1] +1)/2];
            var vobjcenter = [vscell.getpos().x + vobjsize[0],vscell.getpos().y + vobjsize[1], vscell.getpos().z - vobjsize[2] + G_cfg_cell_len_z ];

            if(checkcellisvisible(vplanes,vobjcenter[0],vobjcenter[1],vobjcenter[2],vobjsize[0],vobjsize[1],vobjsize[2]))
            {
                frustumbyoctree(root.lt,vplanes,containor,from,target);
                frustumbyoctree(root.lb,vplanes,containor,from,target);
                frustumbyoctree(root.rt,vplanes,containor,from,target);
                frustumbyoctree(root.rb,vplanes,containor,from,target);
            }
            else
            {
                console.log("from " + root.s[0] + " " + root.s[1] + "to " + root.e[0] + " " + root.e[1] + " are not visible");
            }
        }
    }
    catch(e)
    {
       console.log(e);
    }
}

function getcellbypos(p)
{
    var vx = Math.floor(p[0]/G_cfg_cell_len_x);
    var vz = Math.floor((g_u_cells.length*G_cfg_cell_len_z - p[2])/G_cfg_cell_len_z);
    return [vx,vz];
}


function getposbycell(p)
{
  try
  {
     g_u_cells[p[1]][p[0]].getcenterpos();
  }
  catch(e)
  {
      console.log(e);
  }
}

function doportalsculling()
{
    try
    {
        var vrsize = g_u_rooms_rendered.length;
        g_u_rooms_rendered = []; //reset
        g_u_a_objects = [];      //reset
        while(vrsize > 0)
        {
            g_u_rooms_rendered.push(0);
            vrsize--;
        }
        var vplanes = getfrustumplanes(g_gl_porjMtx,g_gl_viewMtx);
        var vcellpos = getcellbypos(g_u_cameraPos);
        var vroomid = g_u_cells[vcellpos[1]][vcellpos[0]].rid;
        var vroot = getoctreerootbyregion(g_u_octtree,g_u_rooms[vroomid].s,g_u_rooms[vroomid].e);
        portalsculling(vroot,-1,vroomid,vplanes,g_u_a_objects);
    }
    catch(e)
    {
        console.log(e);
    }

}

function portalsculling(root,from,target,vplanes,containor)
{
    if(null != root)
    {
        frustumbyoctree(root,vplanes,g_u_a_objects,from,target);
    }
}

function portalscullingbyp(portal,root,containor,vplanes,from,target)
{
    var vobjcell = portal;
    var vobjcenter = vobjcell.getcenterpos();
    var vobjsize = vobjcell.getsize();

    var vselpos = selboudingboxpos(vobjcell,g_u_cameraPos);
    if(checkdirection(g_u_cameraPos,vselpos[0][0],vselpos[1][0]) >= 0)
    {
        var vleft = calplane(g_u_cameraPos,vselpos[0][0],vselpos[0][1]);
        var vright = calplane(g_u_cameraPos,vselpos[1][0],vselpos[1][1]);
        var vsubplanes = calnewplanes(vleft,vright,vplanes);

        portalsculling(root,from,target,vsubplanes,containor)
    }
    else
    {
        var vleft = calplane(g_u_cameraPos,vselpos[1][0],vselpos[1][1]);
        var vright = calplane(g_u_cameraPos,vselpos[0][0],vselpos[0][1]);
        var vsubplanes = calnewplanes(vleft,vright,vplanes);

        portalsculling(root,from,target,vsubplanes,containor)
    }
}

function selboudingboxpos(c,e)
{
    var vcenter = c.getcenterpos();
    var vsize = c.getsize();
    var vp1 = [vcenter[0]-vsize[0],vcenter[1]-vsize[1],vcenter[2]-vsize[2]];
    var vp2 = [vcenter[0]-vsize[0],vcenter[1]-vsize[1],vcenter[2]+vsize[2]];
    var vp3 = [vcenter[0]+vsize[0],vcenter[1]-vsize[1],vcenter[2]-vsize[2]];
    var vp4 = [vcenter[0]+vsize[0],vcenter[1]-vsize[1],vcenter[2]+vsize[2]];
    var vdis1 = vec3.distance(e,vp1);
    var vdis2 = vec3.distance(e,vp2);
    var vdis3 = vec3.distance(e,vp3);
    var vdis4 = vec3.distance(e,vp4);
    var vdis = [[vdis1,vp1],[vdis2,vp2],[vdis3,vp3],[vdis4,vp4]];
    vdis.sort(function(a, b){return b[0]-a[0]});

    var vmax1 = vdis[0][1];
    var vmax1t = [vmax1[0],vmax1[1]+vsize[1]*2,vmax1[2]];
    var vmax2 = vdis[1][1];
    var vmax2t = [vmax2[0],vmax2[1]+vsize[1]*2,vmax2[2]];

    var vdmax1 = [vmax1[0] - e[0],vmax1[1] - e[1],vmax1[2] - e[2]];
    var vdmax2 = [vmax2[0] - e[0],vmax2[1] - e[1],vmax2[2] - e[2]];
    //

    return [[vmax1t,vmax1],[vmax2t,vmax2]];
}


function calplane(e,p1,p2)
{
    var p12e = [p1[0] - e[0],p1[1] - e[1],p1[2] - e[2]];
    var p22e = [p2[0] - e[0],p2[1] - e[1],p2[2] - e[2]];
    var p12edp22e = [0,0,0];
    vec3.cross(p12edp22e,p12e,p22e);
    vec3.normalize(p12edp22e,p12edp22e);
    var vd = -(vec3.dot(p12edp22e,e));
    return [p12edp22e[0],p12edp22e[1],p12edp22e[2],vd];
}

function calnewplanes(vl,vr,olplanes)
{
    var vlt = vec3.dot(vl,olplanes[0]);
    var vlr = vec3.dot(vr,olplanes[1]);
    if(vlt < 0)
    {
        vec3.scale(vl,vl,-1);
    }
    if(vlr < 0)
    {
        vec3.scale(vr,vr,-1);
    }
    return [vl,vr,olplanes[2],olplanes[3],olplanes[4],olplanes[5]];
}

function updateObjMaterialbyparams(tid,amb,dif,spec,fspec,tra)
{
    try
    {
        updateTexture(tid);
        setuniform3f("vtAmbient",amb);
        setuniform1f("fSpec",fspec);
        setuniform1f("u_alpha_t",1.0);
        setuniform3f("vtDiff",dif);
        setuniform3f("vtSpec",spec);
    }
    catch(e)
    {
        console.log(e);
    }
}

function updateObjMaterial(vObjIdx,textureid)
{
    try
    {
        updateTexture(textureid);
        setuniform3f("vtAmbient",g_u_a_objects[vObjIdx].material.amb);
        setuniform1f("fSpec",g_u_a_objects[vObjIdx].material.spf);
        setuniform1f("u_alpha_t",1.0);
        setuniform3f("vtDiff",g_u_a_objects[vObjIdx].material.dif);
        setuniform3f("vtSpec",g_u_a_objects[vObjIdx].material.spc);
    }
    catch(e)
    {
        console.log(e);
    }
}

function updateShaderLighting()
{
    try
    {
       for (var idx = 0; (idx < g_u_Lights.length) &&(idx < G_MAX_LIGHTNUM); idx++)
       {
            setuniform3f("lights[" + idx + "].vp",g_u_Lights[idx].pos);
            setuniform3f("lights[" + idx + "].amcolor",g_u_Lights[idx].amb_color);
            setuniform3f("lights[" + idx + "].difcolor",g_u_Lights[idx].dif_color);
            setuniform3f("lights[" + idx + "].spccolor",g_u_Lights[idx].spc_color);
       }
       setuniform1i("lightnumber",g_u_Lights.length);
       setuniform1f("fuselighting",G_cfg_enable_lighting);
       
    }
    catch(e)
    {
        console.log(e);
    }
}

function depthteston()
{
    g_WebGL.enable(g_WebGL.DEPTH_TEST);
}

function depthtestoff()
{
    g_WebGL.disable(g_WebGL.DEPTH_TEST);
}

function gettrianglecenter(v1,v2,v3)
{
    return vec3.fromValues((v1[0]+v2[0]+v3[0])/3.0,(v1[1]+v2[1]+v3[1])/3.0,(v1[2]+v2[2]+v3[2])/3.0);
}

function loadTriangles()
{
    var vobjtype = "triangles";
    var vstr = getJSONFile(G_TRIANGLES_HTTP,vobjtype);
    if(String.null === vstr)
    {
        console.log("load triangles failed");
    }
    else
    {
        g_u_triangles = loadtrianglebyjason(vstr,G_cfg_cell_len_z);
        for( var vid = 0 ; vid < g_u_triangles.length; vid ++)
        {
            g_u_pics.push(g_u_triangles[vid].material.pic);
            g_u_triangles[vid].material.pic = g_u_pics.length -1;
        }
    } 
}

function loadtrianglebyjason(vstr,s)
{
    if(s <= 0)
    {
        s = 1;
    }
    var vobjects = [];
    try
    {
        var nVerticesNum = 0;
        var vOpOut = vec3.create();
        var vaPoints = [];
        var vaNormals = [];
        var vaTriVtx = [];
        var vVtxOffset = vec3.create();
        for(var nObjIdx = 0;nObjIdx < vstr.length; nObjIdx++)
        {
            var vsgPoints = [];
            var vsgNormals = [];
            var vsgTriVtx = [];
            var vsgVUS = [];

            vec3.set(vVtxOffset,nVerticesNum,nVerticesNum,nVerticesNum);// set offset
            for(var vVexIdx = 0;vVexIdx < vstr[nObjIdx].vertices.length;vVexIdx++)
            {
                var vPoints = vstr[nObjIdx].vertices[vVexIdx];
                vaPoints.push(vPoints[0]*s,vPoints[1]*s,vPoints[2]*s);      // load all points in a triangle
                vsgPoints.push(vPoints[0]*s,vPoints[1]*s,vPoints[2]*s);
            }

            for(var vNormalIdx = 0;vNormalIdx < vstr[nObjIdx].normals.length;vNormalIdx++)
            {
                var vNValue = vstr[nObjIdx].normals[vNormalIdx];
                vaNormals.push(vNValue[0],vNValue[1],vNValue[2]);      // load all points in a triangle
                vsgNormals.push(vNValue[0],vNValue[1],vNValue[2]);
            }

            for (var vTriIdx = 0; vTriIdx < vstr[nObjIdx].triangles.length; vTriIdx++)
            {
                vec3.add(vOpOut,vVtxOffset,vstr[nObjIdx].triangles[vTriIdx]); //
                vaTriVtx.push(vOpOut[0],vOpOut[1],vOpOut[2]);
                vsgTriVtx.push(vstr[nObjIdx].triangles[vTriIdx][0],vstr[nObjIdx].triangles[vTriIdx][1],vstr[nObjIdx].triangles[vTriIdx][2]);
            }

            for (var vVUSIdx = 0; vVUSIdx < vstr[nObjIdx].uvs.length; vVUSIdx++)
            {
                vsgVUS.push(vstr[nObjIdx].uvs[vVUSIdx][0],vstr[nObjIdx].uvs[vVUSIdx][1]);
            }

            nVerticesNum += vstr[nObjIdx].vertices.length;

            ///////////////////////////////////////////////////////////////////
            var objmaterial = new Material(vstr[nObjIdx].material.ambient,vstr[nObjIdx].material.diffuse,vstr[nObjIdx].material.specular,vstr[nObjIdx].material.n,vstr[nObjIdx].material.alpha,G_HTTP_TEXTURE_PREFIX + vstr[nObjIdx].material.texture);
            var objdata = new Objectdata(vsgPoints,vsgTriVtx,vsgNormals,vsgVUS);
            objdata.setMaterial(objmaterial);
            vobjects.push(objdata);
        }
    }
    catch(e)
    {
        console.log(e);
    }
    return  vobjects;
}


function loadSphere()
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
                var vcenter = vec3.fromValues(0,0,0);
                var vRadius = vstr[nObjIdx].r*G_cfg_cell_len_z;
                var objmaterial = new Material(vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular,vstr[nObjIdx].n,vstr[nObjIdx].alpha,G_HTTP_TEXTURE_PREFIX + vstr[nObjIdx].texture);
                var sdata = buildspheremesh(g_u_spheremesh_latnum,g_u_spheremesh_lognum,vRadius,vcenter);
                var objdata = new Objectdata(sdata.pbuffer,sdata.tbuffer,sdata.nbuffer,sdata.vubuffer);
                objdata.setMaterial(objmaterial);

                g_u_pics.push(objdata.material.pic);
                objdata.material.pic = g_u_pics.length -1;

                g_u_spheres.push(objdata);

            }
        }
        catch(e)
        {
            console.log(e);
        }
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



function loadLights()
{
    var vobjtype = "lgihts";
    var str = "[\
        {\"x\": 0.25, \"y\": 1, \"z\": 0.5, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.3,0.3,0.3], \"specular\": [0.3,0.3,0.3]},\
        {\"x\": 0.75, \"y\": 1, \"z\": 0.5, \"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.3,0.3,0.3], \"specular\": [0.3,0.3,0.3]}]";
    var vstr = JSON.parse(str);

    if(String.null === vstr)
    {
        console.log("load lgihts failed");
    }

    else
    {
        try
        {
            for(var nObjIdx = 0;nObjIdx < vstr.length; nObjIdx++)
            {
                var vpos = vec3.fromValues(vstr[nObjIdx].x, vstr[nObjIdx].y,vstr[nObjIdx].z);
                addsinglelight(vpos,vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular);
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

function setupObjs()
{
    g_u_frameinfo = new Frameinfo(10);
    g_u_a_objects = [];
    g_u_objectidmax = 0;

    g_u_pics[0] = G_TEXTURE_FLOOR;//"Floor.jpg";
    g_u_pics[1] = G_TEXTURE_CEILLING;//"ceiling.jpg";
    g_u_pics[2] = G_TEXTURE_CELL;//"cell.jpg";

    loadcellsinfo();
    loadTriangles();
    loadSphere();
    upatefurnitureincells();
    updateroominfo();

    var vafloat = [];
    vafloat.length  = G_MAX_BUFFER_SIZE;
    var vaint = [];
    vaint.length =  G_MAX_BUFFER_SIZE;
    g_gl_vetx_buffer = createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_normal_buffer = createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_vu_buffer =  createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_triangle_buffer = createBuffer(vaint,g_WebGL.ELEMENT_ARRAY_BUFFER,"Uint16Array",g_WebGL.DYNAMIC_DRAW);

    initobjecttexture();
}

function setupCanvas()
{
  g_Canvas = document.getElementById("viewport");
}

function setupEventHandler()
{
    if(null === g_Canvas)
    {
        console.log("WebGL is null !");
        return ;
    }
    window.addEventListener('keydown', onKeyDown,true);
}

function addsinglelight(vp,vamcolor,vdifcolor,vspccolor)
{
  var objlight = new Light(vp,vamcolor,vdifcolor,vspccolor);
  g_u_Lights.push(objlight);  
}

function setuplights()
{
    try
    {
        g_u_Lights = [];
        loadLights();
    }
    catch(e)
    {
        console.log(e);
    }
}

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
            g_u_cameraPos = [];
            //g_u_cameraPos.push(G_cfg_camerapos[0],G_cfg_camerapos[1],G_cfg_camerapos[2]);
            var vroompos = g_u_rooms[0].getcenterpos();
            var vcellpos = g_u_cells[vroompos[2]][vroompos[0]].getcenterpos();
            g_u_cameraPos = [vcellpos[0],vcellpos[1],vcellpos[2]];

            g_u_lookat = [];
            g_u_lookat.push(G_cfg_lookdirection[0],G_cfg_lookdirection[1],G_cfg_lookdirection[2]);
            g_u_headup = [];
            g_u_headup.push(G_cfg_headup[0],G_cfg_headup[1],G_cfg_headup[2]);
            
            var m = new matIV();
            g_gl_viewMtx = m.identity(m.create());
            g_gl_porjMtx = m.identity(m.create());
            m.lookAt(g_u_cameraPos, [g_u_lookat[0] + g_u_cameraPos[0],g_u_lookat[1] + g_u_cameraPos[1],g_u_lookat[2] + g_u_cameraPos[2]], g_u_headup, g_gl_viewMtx);
            m.perspective(g_u_viewAngle, g_WebGL.viewportWidth / g_WebGL.viewportHeight, G_NEAREST, G_FARTHEST, g_gl_porjMtx);  
        }
        catch(e)
        {
            console.log(e);
        }
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

function renderceiling()
{
    var vnum = 0;
    for(var vr = 0; vr < g_u_ceiling.length; vr ++)
    {
        var vobj = g_u_ceiling[vr];
        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_normal_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_normal));
        setattribute("vtNormal",g_gl_normal_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vetx_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_pnts));
        setattribute("vtPos",g_gl_vetx_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vu_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_vus));
        setattribute("vTextC",g_gl_vu_buffer,2);

        g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER,g_gl_triangle_buffer);
        g_WebGL.bufferSubData(g_WebGL.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(vobj.buf_trgs));

        updateObjMaterialbyparams(vr,vobj.material.amb,vobj.material.spc,vobj.material.spf,vobj.material.tra);

        g_WebGL.drawElements(g_WebGL.TRIANGLES,vobj.buf_trgs.length,g_WebGL.UNSIGNED_SHORT,0);

        vnum += vobj.buf_trgs.length;
    }
    console.log("renderceiling " + vnum);
    return vnum;
}

function getfurnitureobj(type,id)
{
    var vobj = null;
    if(type === "sphere")
    {
        vobj = g_u_spheres[id];
    }
    else if(type === "triangleset")
    {
        vobj = g_u_triangles[id];
    }
    return vobj;
}

function upatefurnitureincells()
{
    for (var vf = 0; vf < g_u_furniture.length; vf++)
    {
        var f = g_u_furniture[vf];
        var r = g_u_rooms[f.rid];
        g_u_cells[f.z + r.s[2]][f.x + r.s[0]].attachobj = vf;
    }
}

function updateroominfo()
{
    for(var vroomid = 0; vroomid < g_u_rooms.length;vroomid++)
    {
        var vroom = g_u_rooms[vroomid];
        var s = [vroom.s[2]-1,vroom.s[0]-1];
        var e = [vroom.e[2]+1,vroom.e[0]+1];

        for(var vcellsid = s[0];vcellsid < e[0];vcellsid++)
        {
            for(var vcellid = s[1];vcellid < e[1];vcellid++)
            {
                if(g_u_cells[vcellsid][vcellid].isvalid())
                {
                    g_u_rooms[vroomid].addcell(g_u_cells[vcellsid][vcellid]);
                }

            }
        }
    }
}

function resetdrawoffurniture(r)
{
    for (var vf = 0; vf < g_u_furniture.length; vf++)
    {
        g_u_furniture[vf].r = r;
    }
}


function renderfurniture()
{
    var vnum = 0;
    for (var vf = 0; vf < g_u_furniture.length; vf++)
    {
        var vobj = null;
        if(g_u_furniture[vf].r == false)
        {
            continue;
        }

        if(g_u_furniture[vf].type === "sphere")
        {
            vobj = g_u_spheres[g_u_furniture[vf].idx];
        }
        else if(g_u_furniture[vf].type === "triangleset")
        {
            vobj = g_u_triangles[g_u_furniture[vf].idx];
        }
        if(vobj === null)
        {
            continue;
        }
        updateMatrix(vf);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_normal_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_normal));
        setattribute("vtNormal",g_gl_normal_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vetx_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_pnts));
        setattribute("vtPos",g_gl_vetx_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vu_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_vus));
        setattribute("vTextC",g_gl_vu_buffer,2);

        g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER,g_gl_triangle_buffer);
        g_WebGL.bufferSubData(g_WebGL.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(vobj.buf_trgs));

        updateObjMaterialbyparams(vobj.material.pic,vobj.material.amb,vobj.material.spc,vobj.material.spf,vobj.material.tra);

        g_WebGL.drawElements(g_WebGL.TRIANGLES,vobj.buf_trgs.length,g_WebGL.UNSIGNED_SHORT,0);
        vnum += vobj.buf_trgs.length;
    }
    console.log("renderfurniture " + vnum);
    return vnum;
}

function rendercells()
{
    var vnum = 0;
    for(var vr = 0; vr < g_u_a_objects.length; vr ++)
    {
        var vobj = g_u_a_objects[vr];
        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_normal_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_normal));
        setattribute("vtNormal",g_gl_normal_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vetx_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_pnts));
        setattribute("vtPos",g_gl_vetx_buffer,3);

        g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vu_buffer);
        g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(vobj.buf_vus));
        setattribute("vTextC",g_gl_vu_buffer,2);

        g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER,g_gl_triangle_buffer);
        g_WebGL.bufferSubData(g_WebGL.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(vobj.buf_trgs));

        updateObjMaterial(vr,vobj.material.pic);
        g_WebGL.drawElements(g_WebGL.TRIANGLES,vobj.buf_trgs.length,g_WebGL.UNSIGNED_SHORT,0);

        vnum += vobj.buf_trgs.length;
    }
    console.log("rendercells " + vnum);
    return vnum;
}

function renderObjs()
{
    try
    {
        var vnum = 0;
        var d = new Date();
        var n1 = d.getTime();

        //updateShaderLighting();
        g_WebGL.clear(g_WebGL.DEPTH_BUFFER_BIT);
        g_WebGL.disable(g_WebGL.BLEND);
        g_WebGL.depthMask(true);
        var vbdepthset = 0;
        doculling();
        updateMatrix(-1);

        vnum += renderceiling();
        vnum += rendercells();
        vnum += renderfurniture();

        g_WebGL.flush();
        g_WebGL.depthMask(true);

        d = new Date();
        updatespeedinfo(vnum/3,d.getTime() -n1);
        
    }
    catch(e)
    {
        console.log(e);
    }
}



///////////////////////////////////////////////////////////////////////////////
function buildocttree(vroot)
{
    if(vroot === null)
    {
        return ;
    }
    var s = vroot.s;
    var e = vroot.e;

    var vnuminside = chechisemptycell(s,e);
    if(vnuminside <= 1)
    {
        vroot.setisleaf(true);
        return ;
    }
    if((e[0] - s[0] <= 1) || (e[1] - s[1]<=1))
    {
        vroot.setisleaf(true);
        return ;
    }

    //devide
    var vcenter = new Array();
    vcenter.push(Math.floor((s[0] + e[0])/2));
    vcenter.push(Math.floor((s[1] + e[1])/2));
    vroot.setcenter(vcenter);

    //left top
    var ept = chechisemptycell(s,vcenter);
    if(ept.length >= 1)
    {
        vroot.setlt(new Octtree(s,vcenter));
    }
    //right bottom
    ept = chechisemptycell([vcenter[0]+1,vcenter[1]+1],e);
    if(ept.length >= 1)
    {
        vroot.setrb(new Octtree([vcenter[0]+1,vcenter[1]+1],e));
    }

    var vlm = new Array();
    vlm.push(s[0]);
    vlm.push(vcenter[1]+1);

    var vbm = new Array();
    vbm.push(vcenter[0]);
    vbm.push(e[1]);
    ept = chechisemptycell(vlm,vbm);
    if(ept.length >= 1)
    {
        vroot.setlb(new Octtree(vlm,vbm));
    }

    var vtm = new Array();
    vtm.push(vcenter[0]+1);
    vtm.push(s[1]);

    var vrm = new Array();
    vrm.push(e[0]);
    vrm.push(vcenter[1]);
    ept = chechisemptycell(vtm,vrm);
    if(ept.length >= 1)
    {
        vroot.setrt(new Octtree(vtm,vrm));
    }

    buildocttree(vroot.lt);
    buildocttree(vroot.lb);
    buildocttree(vroot.rt);
    buildocttree(vroot.rb);
}

function chechisemptycell(s,e)
{
    var vcell = [];
    try
    {
        for(var vcellsid = s[1];vcellsid <= e[1];vcellsid++)
        {
            for(var vcellid = s[0];vcellid <= e[0];vcellid++)
            {
                if(g_u_cells[vcellsid][vcellid].isvalid())
                {
                    vcell.push(g_u_cells[vcellsid][vcellid]);
                }

            }
        }
    }
    catch(e)
    {
        console.log(e);
    }

    return vcell;
}


//parse room jason file
/*
 {
 "rooms": [["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"],
 ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
 ["s",  0,   0,   0,   0,   0,  "p",  1,   1,   1,   1,   1,  "s"],
 ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
 ["s",  0,   0,   0,   0,   0,  "p",  1,   1,   1,   1,   1,  "s"],
 ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
 ["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"]],
 "furniture": [[0,0,0,"sphere",0],[1,4,4,"triangleset",0]]
 }
 * */
function loadcellsinfo()
{
    try
    {
        var vobjtype = "rooms";
        var vstr = getJSONFile(G_HTTP_ROOMS,vobjtype);
        var vroomdetail = vstr.rooms;

        var vzlen = vroomdetail.length;
        var vxlen = vroomdetail[0].length;

        for(var vid = 0; vid < vroomdetail.length;vid++)
        {
            var vcellinfo = vroomdetail[vid];
            var vcells = new Array();

            for(var vcid = 0; vcid < vcellinfo.length; vcid ++)
            {
                var vroomid = vcellinfo[vcid];
                var vcell = new Cell(0,0,0,0,vroomid);
                vcell.setscale(G_cfg_cell_len_x,G_cfg_cell_len_y,G_cfg_cell_len_z);
                vcell.setpos(vcid*G_cfg_cell_len_x,0, (vzlen - vid -1)*G_cfg_cell_len_z);
                vcell.r_x = vcid;
                vcell.r_z = vid;
                if(vroomid == "p")
                {
                    if(vcid-1 >= 0)
                    {
                        vcell.setconnectroom(vcellinfo[vcid-1]);
                    }
                    if(vcid + 1 < vcellinfo.length)
                    {
                        vcell.setconnectroom(vcellinfo[vcid+1]);
                    }
                    if(vcid - 1 >=0)
                    {
                        vcell.setconnectroom(vroomdetail[vid-1][vcid]);
                    }
                    if(vcid + 1 < vzlen)
                    {
                        vcell.setconnectroom(vroomdetail[vid+1][vcid]);
                    }
                }
                buildsinglecell(vcell);
                vcells.push(vcell);
            }
            g_u_cells.push(vcells);
        }

        //build octtree
        g_u_octtree = new Octtree([0,0],[vxlen-1,vzlen-1]);
        buildocttree(g_u_octtree);

        //ceiling
        var ceiling = loadceiling(vxlen*G_cfg_cell_len_x,G_cfg_cell_len_y,vzlen*G_cfg_cell_len_z);
        g_u_ceiling = ceiling;

        //room
        for(var vcellsid = 0; vcellsid < g_u_cells.length; vcellsid++)
        {
            var vcelldetail = g_u_cells[vcellsid];
            for (var vcellid = 0; vcellid < vcelldetail.length;vcellid++)
            {
                if(g_u_rooms[vcelldetail[vcellid].rid] == undefined)
                {
                    g_u_rooms[vcelldetail[vcellid].rid] = new RoomInfo(vcelldetail[vcellid].rid);
                    g_u_rooms[vcelldetail[vcellid].rid].sets([vcelldetail[vcellid].r_x,vcelldetail[vcellid].r_y,vcelldetail[vcellid].r_z]);
                }
                else
                {
                    g_u_rooms[vcelldetail[vcellid].rid].sete([vcelldetail[vcellid].r_x,vcelldetail[vcellid].r_y,vcelldetail[vcellid].r_z]);
                }
            }
        }

        //furniture
        var vfs = vstr.furniture;
        for(var vfsid = 0; vfsid < vfs.length; vfsid ++)
        {
            var f = new Furniture(vfs[vfsid][0],vfs[vfsid][1],0,vfs[vfsid][2],vfs[vfsid][3],vfs[vfsid][4]);
            var vroompos = g_u_rooms[f.rid].s;
            var vcellpos = [vroompos[0]+f.x,vroompos[1]+f.y,vroompos[2]+f.z];
            var vcell = g_u_cells[vcellpos[2]][vcellpos[0]];

            var m4 = mat4.create();
            mat4.translate(m4,m4,vcell.getcenterpos()); //trans
            g_u_furniture_m_mtx[vfsid] = m4;
            g_u_furniture.push(f);
        }
    }
    catch(e)
    {
        console.log(e);
    }
}


function buildsinglecell(cellinfo) {
    //front bottom right back left top
    var str = "[\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.jpg\"},\
     \"vertices\": [[0,0,0],[1,0,0],[1,1,0],[0,1,0]],\
     \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     },\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
     \"vertices\": [[0,0,0],[1,0,0],[1,0,1],[0,0,1]],\
     \"normals\": [[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     },\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
     \"vertices\": [[1,0,0],[1,0,1],[1,1,1],[1,1,0]],\
     \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     },\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
     \"vertices\": [[0,0,1],[1,0,1],[1,1,1],[0,1,1]],\
     \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     },\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
     \"vertices\": [[0,0,0],[0,0,1],[0,1,1],[0,1,0]],\
     \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     },\
     {\
     \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
     \"vertices\": [[0,1,0],[1,1,0],[1,1,1],[0,1,1]],\
     \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
     \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
     \"triangles\": [[0,1,2],[2,3,0]]\
     }]";


    var vtraingles = loadtrianglebyjason(JSON.parse(str),1);
    var vlength = vtraingles.length;
    if(vlength < 6)
    {
        return ;
    }
    for(var vid = 0 ;vid < vlength; vid ++)
    {
        vtraingles[vid].material.pic = 2; //default
    }
    cellinfo.setobjs(vtraingles);
}

function loadceiling(mx,my,mz)
{
   var str = "[ \
          {\
         \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
         \"vertices\": [[0,0,0],[1,0,0],[1,0,1],[0,0,1]],\
         \"normals\": [[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0]],\
         \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
         \"triangles\": [[0,1,2],[2,3,0]]\
         },\
        {\
        \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.6], \"specular\": [0.3,0.3,0.3], \"n\":1, \"alpha\": 0.3, \"texture\": \"rocktile.png\"},\
         \"vertices\": [[0,1,0],[1,1,0],[1,1,1],[0,1,1]],\
         \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
         \"uvs\": [[0,0], [0,1], [1,1], [1,0]],\
         \"triangles\": [[0,1,2],[2,3,0]]\
         }]";

    var vtraingles = loadtrianglebyjason(JSON.parse(str),1);
    var vlength = vtraingles.length;
    for(var vid = 0 ;vid < vlength; vid ++)
    {
        vtraingles[vid].material.pic = vid;
        var vlen = vtraingles[vid].buf_pnts.length;
        for(var vpid = 0; vpid < vlen;vpid++)
        {
            switch(vpid%3)
            {
                case 0:{ vtraingles[vid].buf_pnts[vpid] *= mx;}
                    break;
                case 1:{ vtraingles[vid].buf_pnts[vpid] *= my;}
                    break;
                case 2:{ vtraingles[vid].buf_pnts[vpid] *= mz;}
                    break;
                default:
                    break;
            }
        }
    }
    return vtraingles;
}

function updatespeedinfo(num,time)
{
    var vf = g_u_frameinfo.pushdata(time);
    var vs = "triangles number:" + num + " frame time:" + vf + " ms";
    document.getElementById("timedv").innerHTML  = vs;
}
///////////////////////////////////////////////////////////////////////////////


function setupAll()
{
    setupCanvas();
    setupEventHandler();
    setupWebGL();
    setupShaders();
    setupObjs();
    setViewParams();
    setuplights();
    renderObjs();
    updateui();
}

function sizechanged()
{
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
    try
    {
        g_Canvas.width = vwid;
        g_Canvas.height = wHeg;
        g_WebGL.viewportWidth = g_Canvas.width;
        g_WebGL.viewportHeight = g_Canvas.height;

        var imageCanvas = document.getElementById("viewport");
        imageCanvas.width = vwid;
        imageCanvas.height = wHeg;

        setupAll();
    }
    catch(e)
    {
        console.log(e);
    }
}


function gotopart1()
{
    G_cfg_culling_mode = 0;
    updateShaderLighting();
    renderObjs();
    updateui();
}

function gotopart3()
{
    G_cfg_culling_mode = 1;
    updateShaderLighting();
    renderObjs();
    updateui();
}

function gotopart4()
{
    G_cfg_culling_mode = 2;
    updateShaderLighting();
    renderObjs();
    updateui();
}


function changedalpha()
{
    try
    {
        var valpha = document.getElementById("alpha_g").value;
        if((valpha < 0.0) || (valpha > 1.0))
        {
            valpha = 0.5;
        }
        g_u_global_alpha = valpha;

        renderObjs();
    }
    catch(e)
    {
        console.log(e);
    }
}

function enablelights()
{
    try
    {
        var vcheck = document.getElementById("enable_lights");
        G_cfg_enable_lighting = vcheck.checked ? 1:0;

        updateShaderLighting();
        renderObjs();
    }
    catch(e)
    {
        console.log(e);
    }
}


function addlight()
{
    var va = Number(document.getElementById("light_x").value);
    var vb = Number(document.getElementById("light_y").value);
    var vc = Number(document.getElementById("light_z").value);

    addsinglelight([va,vb,vc],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0]);
    renderObjs();
}

function deletelight()
{
    if(g_u_Lights.length > 0)
    {
        g_u_Lights.pop();
        renderObjs();
        updateui();
    }
}

function updateui()
{
    try
    {
        document.getElementById("enable_lights").checked  = G_cfg_enable_lighting > 0 ? 1:0;
    }
    catch (e){
        console.log(e);

    }
}
