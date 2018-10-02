/**
 * Created by Fangyuan on 06/10/2016.
 */
///<reference path="gl-matrix-min.js" />
///<reference path="minMatrix.js" />
///<reference path="datadef.js" />

var G_NET_200 = 200;
var G_TIME_OUT = 3000;
var G_NEAREST = 0.1;
var G_FARTHEST = 100;
var G_MAX_BUFFER_SIZE = 102400;
var G_DEGREE2RAD = Math.PI/180.0;
var G_MAX_LIGHTNUM = 10;

var G_cfg_camerapos = [0.5,0.5,-0.5];
var G_cfg_lookdirection = [0,0,1];
var G_cfg_headup = [0,1,0];
var G_cfg_highlight_diff = [0.5,0.5,0.0];
var G_cfg_highlight_sepcular = [0.0,0.0,0.0];
var G_cfg_lightpos = [2,4,-0.5];
var G_cfg_lightcolor = [[1,1,1],[1,1,1],[1,1,1]];

var G_cfg_enable_hightlight = 0.0;
var G_cfg_usehttpfile = 1;
var G_cfg_uselighting = 1;
var G_cfg_drawtriangle = 1;
var G_cfg_drawsphere = 1;
var G_cfg_usemultilights = 0;

var g_WebGL = null;
var g_Canvas = null;

var G_TRIANGLES_HTTP = "https://ncsucgclass.github.io/prog2/triangles.json";
var G_SPHERES_HTTP = "https://ncsucgclass.github.io/prog2/spheres.json";
var G_LIGHTS_HTTP = "https://ncsucgclass.github.io/prog2/lights.json";

var g_gl_vetx_buffer = null;
var g_gl_normal_buffer = null;
var g_gl_triangle_buffer = null;
var g_gl_shaderProgram = null;

var g_gl_viewMtx = null;
var g_gl_porjMtx = null;
var g_u_ObjsModelMtx = [];
var g_u_ObjsModelRoate = [];
var g_u_ObjsModelTrans = [];
var g_u_Lights = [];


var g_u_cameraPos = null;
var g_u_lookat = null;
var g_u_headup = null;
var g_u_viewAngle = 60;
var g_u_move_step_unit = 0.01;
var g_u_rotate_step_unit = 5;

var g_u_spheremesh_latnum = 64;
var g_u_spheremesh_lognum = 64;

var g_u_operate_obj_movestep = 0.01;
var g_u_operate_obj_rotatestep = 15;

var g_u_a_objects = null;
var g_u_objectidx = 0;
var g_u_triangles_num = 0;
var g_u_spheres_num = 0;

var g_u_reset = false;

var g_u_highlight_object = 0;


/*
 *shaders
*/
var g_v_shader_code ='\
        attribute vec3 vtPos;\
        attribute vec3 vtNormal;\
        uniform mat4 u_MVPMtx;\
        uniform mat4 u_ModelViewMtx;\
        uniform mat4 u_NormalMtx;\
        uniform vec3 vEyePos;\
        uniform vec3 vLightPos;\
        varying vec3 vNormal;\
        varying vec3 vPosition;\
        varying vec3 vEyeD;\
        void main(void) {\
            vec4 vworldp = u_ModelViewMtx*vec4(vtPos,1.0);\
            vPosition   = vworldp.xyz;\
            vNormal     = (u_NormalMtx*vec4(vtNormal,0.0)).xyz;\
            gl_Position = u_MVPMtx * vec4(vtPos, 1.0);\
            vEyeD = vEyePos - vPosition;\
        }';

var g_f_shader_code ='\
        precision mediump float;\
        struct light {vec3 vp; vec3 amcolor; vec3 difcolor; vec3 spccolor;};\
        uniform light lights[10];\
        uniform int lightnumber;\
        uniform vec3 vLightColor;\
        uniform vec3 vtAmbient;\
        uniform vec3 vtDiff;\
        uniform vec3 vtSpec;\
        uniform float fSpec;\
        uniform float fuselighting;\
        uniform mat4 u_fMVPMtx;\
        uniform mat4 u_fModelViewMtx;\
        varying vec3 vPosition;\
        varying vec3 vNormal;\
        varying vec3 vEyeD;\
        void main(void){\
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
            gl_FragColor   = vec4(fcolor,1.0);} else{gl_FragColor = vec4(vtDiff,1.0); } }';
/*
copy from  https://ncsucgclass.github.io/prog2/rasterize.js for retreiving http files
*/
function getJSONFile(url,descr)
{
    try {
            if(G_cfg_usehttpfile !== 1)     
            {
                var str = "[\
                        {\
                          \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.4,0.4,0.6], \"specular\": [0.3,0.3,0.3]}, \
                          \"vertices\": [[0.65, 0.4, 0.75],[0.75, 0.6, 0.75],[0.85,0.4,0.75]],\
                          \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
                         \"triangles\": [[0,1,2]]\
                        },\
                        {\
                          \"material\": {\"ambient\": [0.1,0.1,0.1], \"diffuse\": [0.6,0.6,0.4], \"specular\": [0.3,0.3,0.3]}, \
                          \"vertices\": [[0.4, 0.15, 0.75],[0.4, 0.35, 0.75],[0.6,0.35,0.75],[0.6,0.15,0.75]],\
                          \"normals\": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
                          \"triangles\": [[0,1,2],[2,3,0]]\
                        }\
                      ]" ;
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
    switch(key)
    {
        case 'a': {vMove = vec3.fromValues(-g_u_move_step_unit,0,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //a left
            break;
        case 'd': {vMove = vec3.fromValues(g_u_move_step_unit,0,0);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //d left
            break;
        case 'w': {vMove = vec3.fromValues(0,0,g_u_move_step_unit);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //w forward
            break;
        case 's': {vMove = vec3.fromValues(0,0,-g_u_move_step_unit);vec3.add(g_u_cameraPos,g_u_cameraPos,vMove);}; //s backward
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
        case 'ArrowLeft': { vnexttriangle = 1.0;};
            break;
        case 'ArrowRight': {vnexttriangle = -1.0;};
            break;
        case 'ArrowDown':{vnextsphere = -1.0;}
            break;
        case 'ArrowUp':{vnextsphere = 1.0;}
            break;
        case ' ': { G_cfg_enable_hightlight = 0;g_u_highlight_object = 0; renderObjs();};
            break;
        default:break;
    }
    try
    {
        if((null !== vMove) || vrote > 0)
        {  
            renderObjs();
        }
        else if(true === g_u_reset)
        {
            g_u_reset = false;
            resetviewandprjparams();
        }
        else if( vnexttriangle !== 0.0)
        {
            G_cfg_enable_hightlight = 1.0;
            selectobj(vnexttriangle,1.0);
        }
        else if(vnextsphere !== 0.0 )
        {
            G_cfg_enable_hightlight = 1.0;
            selectobj(vnextsphere,-1.0); 
        }
        else
        {
            operateObj(key);
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

function setattribute(vname,vbuffer)
{
    try
    {
       var vID = g_WebGL.getAttribLocation(g_gl_shaderProgram, vname);
       if(vID >= 0)
       {
          g_WebGL.vertexAttribPointer(vID,3,g_WebGL.FLOAT,false,0,vbuffer);
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

function initobjectmodelmatrix()
{
    var m = new matIV();
    for(var vobjectidx = 0; vobjectidx < g_u_objectidx;vobjectidx++)
    {
        g_u_ObjsModelMtx[vobjectidx] = m.identity(m.create());
        g_u_ObjsModelRoate[vobjectidx] = [0,0,0];
        g_u_ObjsModelTrans[vobjectidx] = [0,0,0];
    }
}

function getobjectmodelmatrix(objidx)
{
    if(objidx < 0 || objidx >= g_u_objectidx)
    {
        return null;
    }
    else
    {
        return g_u_ObjsModelMtx[objidx];
    }
}

function setobjectmodelmatrix(objidx,mtx)
{
       if(objidx < 0 || objidx >= g_u_objectidx)
    {
        return null;
    }
    else
    {
        g_u_ObjsModelMtx[objidx] = mtx;
    } 
}

function updateMatrix(objectidx)
{
    try
    {
        var mativ = new matIV();
        
        g_gl_viewMtx = mativ.identity(mativ.create());
        var lookat = vec3.create();
        vec3.add(lookat,g_u_cameraPos,g_u_lookat);
        mativ.lookAt(g_u_cameraPos, [lookat[0],lookat[1],lookat[2]], g_u_headup, g_gl_viewMtx);
       
        var modelmtx = getobjectmodelmatrix(objectidx);
        var mvpMatrix = mativ.identity(mativ.create());
        mativ.multiply(g_gl_porjMtx, g_gl_viewMtx, mvpMatrix);
        mativ.multiply(mvpMatrix, modelmtx, mvpMatrix);
        
        var uMVPMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_MVPMtx");
        g_WebGL.uniformMatrix4fv(uMVPMtx, false, mvpMatrix);
        
        var ufMVPMtx  = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_fMVPMtx");
        g_WebGL.uniformMatrix4fv(ufMVPMtx, false, mvpMatrix);
                
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
        
        var uInMVMtx = g_WebGL.getUniformLocation(g_gl_shaderProgram, "u_inMVMtx");
        g_WebGL.uniformMatrix4fv(uInMVMtx, false, nMtx);
        
    }
    catch(e)
    {
        console.log(e);
    }
}

function updateObjMaterial(vObjIdx)
{
    try
    {
        setuniform3f("vtAmbient",g_u_a_objects[vObjIdx].material.amb);
        setuniform1f("fSpec",g_u_a_objects[vObjIdx].material.spf);
        if((G_cfg_enable_hightlight > 0.0) &&(vObjIdx === g_u_highlight_object))
        {
            setuniform3f("vtDiff",G_cfg_highlight_diff);
            setuniform3f("vtSpec",G_cfg_highlight_sepcular); 
        }
        else
        {
            setuniform3f("vtDiff",g_u_a_objects[vObjIdx].material.dif);
            setuniform3f("vtSpec",g_u_a_objects[vObjIdx].material.spc);
        }
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
       setuniform1f("fuselighting",G_cfg_uselighting);
       
    }
    catch(e)
    {
        console.log(e);
    }
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
                
                vec3.set(vVtxOffset,nVerticesNum,nVerticesNum,nVerticesNum);// set offset
                for(var vVexIdx = 0;vVexIdx < vstr[nObjIdx].vertices.length;vVexIdx++)
                {
                    var vPoints = vstr[nObjIdx].vertices[vVexIdx];
                    vaPoints.push(vPoints[0],vPoints[1],vPoints[2]);      // load all points in a triangle
                    vsgPoints.push(vPoints[0],vPoints[1],vPoints[2]);
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
                nVerticesNum += vstr[nObjIdx].vertices.length;
                
                ///////////////////////////////////////////////////////////////////
                var objmaterial = new Material(vstr[nObjIdx].material.ambient,vstr[nObjIdx].material.diffuse,vstr[nObjIdx].material.specular,1);
                var objdata = new Objectdata(vsgPoints,vsgTriVtx,vsgNormals,vec3.fromValues(0,0,0));
                objdata.setMaterial(objmaterial);
                g_u_a_objects[g_u_objectidx] = objdata;
                g_u_objectidx++;
                g_u_triangles_num++;
            }
        }
        catch(e)
        {
            console.log(e);
        } 
    } 
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
                var vcenter = vec3.fromValues(vstr[nObjIdx].x, vstr[nObjIdx].y,vstr[nObjIdx].z);
                var vRadius = vstr[nObjIdx].r;
                var objmaterial = new Material(vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular,vstr[nObjIdx].n);
                var sdata = buildspheremesh(g_u_spheremesh_latnum,g_u_spheremesh_lognum,vRadius,vcenter);
                var objdata = new Objectdata(sdata.pbuffer,sdata.tbuffer,sdata.nbuffer,vcenter);
                g_u_a_objects[g_u_objectidx] = objdata;
                g_u_a_objects[g_u_objectidx].setMaterial(objmaterial);
                g_u_objectidx++;
                g_u_spheres_num++;
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
    return {pbuffer : pnts, nbuffer : normals, tbuffer : triangles};  
}

function buildspherebysubloop()
{
    
}

function loadLights()
{
    var vobjtype = "lgihts";
    var vstr = getJSONFile(G_LIGHTS_HTTP,vobjtype);
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
    g_u_a_objects = [];
    g_u_objectidx = 0;
    g_u_triangles_num = 0;
    g_u_spheres_num = 0;
    
    if(G_cfg_drawtriangle > 0.0)
    {
        loadTriangles(); 
    }
    if(G_cfg_drawsphere > 0.0)
    {
       loadSphere(); 
    }
    initobjectmodelmatrix();
    
    var vafloat = [];
    vafloat.length  = G_MAX_BUFFER_SIZE;
    var vaint = [];
    vaint.length =  G_MAX_BUFFER_SIZE;
    g_gl_vetx_buffer = createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_normal_buffer = createBuffer(vafloat,g_WebGL.ARRAY_BUFFER,"Float32Array",g_WebGL.DYNAMIC_DRAW);
    g_gl_triangle_buffer = createBuffer(vaint,g_WebGL.ELEMENT_ARRAY_BUFFER,"Uint16Array",g_WebGL.DYNAMIC_DRAW);
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
            g_u_cameraPos.push(G_cfg_camerapos[0],G_cfg_camerapos[1],G_cfg_camerapos[2]);
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
        g_WebGL.enable(g_WebGL.DEPTH_TEST);
        //g_WebGL.depthFunc(g_WebGL.LESS);

    }
    catch(e)
    {
        console.log(e);
    }
}

function renderObjs()
{
    try
    {
        updateShaderLighting();
        g_WebGL.clear(g_WebGL.COLOR_BUFFER_BIT | g_WebGL.DEPTH_BUFFER_BIT);
        
        for(var vobjIdx = 0; vobjIdx < g_u_objectidx; vobjIdx ++)
        {
            updateMatrix(vobjIdx);
            g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_normal_buffer);
            g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(g_u_a_objects[vobjIdx].buf_normal));
            setattribute("vtNormal",g_gl_normal_buffer);
                        
            g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER,g_gl_vetx_buffer);
            g_WebGL.bufferSubData(g_WebGL.ARRAY_BUFFER, 0, new Float32Array(g_u_a_objects[vobjIdx].buf_pnts));
            setattribute("vtPos",g_gl_vetx_buffer);
            
            g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER,g_gl_triangle_buffer);
            g_WebGL.bufferSubData(g_WebGL.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(g_u_a_objects[vobjIdx].buf_trgs));

            updateObjMaterial(vobjIdx);
            g_WebGL.drawElements(g_WebGL.TRIANGLES,g_u_a_objects[vobjIdx].buf_trgs.length,g_WebGL.UNSIGNED_SHORT,0);
        }
        g_WebGL.flush(); 
        
    }
    catch(e)
    {
        console.log(e);
    }
}


function setupAll()
{
    setupCanvas();
    setupEventHandler();
    setupWebGL();
    setViewParams();
    setupShaders();
    setupObjs();
    setuplights();
    renderObjs();
    updateui();
}

function selectobj(val,objtype)
{

    if(val > 0.0)
    {
        g_u_highlight_object++; 
     }
    else
    {
        g_u_highlight_object--;
    }
    if(objtype > 0.0) //tirangle
    {
        g_u_highlight_object = g_u_highlight_object%g_u_triangles_num;
        if(g_u_highlight_object < 0.0)
        {
            g_u_highlight_object += g_u_triangles_num;
        } 
    }
    else if(objtype < 0.0) //sphere
    {
        g_u_highlight_object = (g_u_highlight_object - g_u_triangles_num)%g_u_spheres_num;
        if(g_u_highlight_object < 0.0)
        {
            g_u_highlight_object += g_u_spheres_num;
        }
        g_u_highlight_object += g_u_triangles_num; //off set
    }
    else
    {
        g_u_highlight_object = g_u_highlight_object%g_u_objectidx;
        if(g_u_highlight_object < 0.0)
        {
            g_u_highlight_object += g_u_objectidx;
        } 
    }

    renderObjs();
}

function operateObj(vp)
{
    var vmove = [0,0,0];
    var vangle = [0,0,0];
    var bDraw = 1.0;
    var breset = 0.0;
    switch(vp)
    {
        case 'k':{vmove[0] += g_u_operate_obj_movestep;}
            break;
        case ';': { vmove[0] -= g_u_operate_obj_movestep; }
            break;
        case 'o': {vmove[2] += g_u_operate_obj_movestep;}
            break;
        case 'l': {vmove[2] -= g_u_operate_obj_movestep;}
            break;
        case 'i': {vmove[1] += g_u_operate_obj_movestep;}
            break;
        case 'p': {vmove[1] -= g_u_operate_obj_movestep;}
            break;
        
        case 'K':{ vangle[1]  = 360 - g_u_operate_obj_rotatestep;}
            break;
        case ':': {vangle[1]  = g_u_operate_obj_rotatestep; }
            break;
        case 'O': {vangle[0]  = 360 - g_u_operate_obj_rotatestep;}
            break;
        case 'L': {vangle[0]  += g_u_operate_obj_rotatestep;}
            break;
        case 'I': {vangle[2]  += g_u_operate_obj_rotatestep;}
            break;
        case 'P': {vangle[2]  = 360 - g_u_operate_obj_rotatestep;}
            break;
        case 'Backspace': {breset = 1.0;}
            break;
        default: {bDraw = 0.0;}
            break;
    }
    
    if( G_cfg_enable_hightlight > 0.0)
    {
        if(breset > 0.0)
        {
           initobjectmodelmatrix(); 
        }
        else
        {
            var objmtx = getobjectmodelmatrix(g_u_highlight_object);
            if(null !== objmtx)
            {
                var m4 = mat4.create();
                g_u_ObjsModelTrans[g_u_highlight_object] = addv3(g_u_ObjsModelTrans[g_u_highlight_object],vmove);
                g_u_ObjsModelRoate[g_u_highlight_object] = addv3(g_u_ObjsModelRoate[g_u_highlight_object],vangle);
                mat4.translate(m4,m4,g_u_ObjsModelTrans[g_u_highlight_object] ); //trans
               
                mat4.rotateX(m4,m4,g_u_ObjsModelRoate[g_u_highlight_object][0]%360*G_DEGREE2RAD);
                mat4.rotateY(m4,m4,g_u_ObjsModelRoate[g_u_highlight_object][1]%360*G_DEGREE2RAD);
                mat4.rotateZ(m4,m4,g_u_ObjsModelRoate[g_u_highlight_object][2]%360*G_DEGREE2RAD);
                
                setobjectmodelmatrix(g_u_highlight_object,m4);
            }  
        }
        
        if(bDraw > 0.0)
        {
            renderObjs();
        }
    }
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
        //setupAll();   
    }
    catch(e)
    {
        console.log(e);
    }
}

function setdrawtriangleonly()
{
    G_cfg_drawtriangle = 1.0;
    G_cfg_drawsphere = 0.0;
    G_cfg_uselighting = 0.0;
    G_cfg_enable_hightlight = 0.0;
    
    setupObjs();
    renderObjs();
}

function setdrawsphereonly()
{
    G_cfg_drawtriangle = 0.0;
    G_cfg_drawsphere = 1.0;
    G_cfg_uselighting = 0.0;
    G_cfg_enable_hightlight = 0.0;
    
    setupObjs();
    renderObjs();
}

function setdrawsphereandtiranglewithlighting()
{
    G_cfg_drawtriangle = 1.0;
    G_cfg_drawsphere = 1.0;
    G_cfg_uselighting = 1.0;
    G_cfg_enable_hightlight = 1.0;
    
    setupObjs();
    renderObjs();
}

function gotoextra3() // lights
{
    
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
        document.getElementById("camera_w").value = g_Canvas.width;
        document.getElementById("camera_h").value = g_Canvas.height;
        if(g_u_Lights.length > 0)
        {
            document.getElementById("light_x").value = g_u_Lights[g_u_Lights.length-1].pos[0];
            document.getElementById("light_y").value = g_u_Lights[g_u_Lights.length-1].pos[1];
            document.getElementById("light_z").value = g_u_Lights[g_u_Lights.length-1].pos[2]; 
        }
    }
    catch (e){
        console.log(e);

    }
}
