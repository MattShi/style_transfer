///<reference path="gl-matrix-min.js" />
///<reference path="minMatrix.js" />
///<reference path="datadef.js" />


var G_TIME_OUT = 2000;
var G_NET_200 = 200;
var G_MAX_SHADER_UM = 32;

var g_WebGL = null;
var g_Canvas = null;
var g_shader_program = null;

var g_vertex_buffer = null;
var g_index_Buffer = null;
var g_coord_Buffer = null;

var g_indices = null;
var g_vertices = null;

var g_obj_Lights = [];
var g_obj_Spheres = [];
var g_obj_Triangles = [];

var g_f_shader_id = "f-shader";
var g_v_shader_id = "v-shader";

var g_v_campos = null;


var G_TRIANGLES_HTTP = "https://ncsucgclass.github.io/prog2/triangles.json";
var G_SPHERES_HTTP = "https://ncsucg4games.github.io/prog1/spheres.json";
var G_LIGHTS_HTTP = "https://ncsucgclass.github.io/prog2/lights.json";


var vshaderCode =
    'attribute vec3 coordinates;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates, 1.0);' +
    '}';

var fshaderCode =
    'void main(void) {' +
    ' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
    '}';

function getShaderContent(id) {
    var shaderScript = document.getElementById(id);

    // error - element with supplied id couldn't be retrieved
    if (!shaderScript) {
        return null;
    }

    // If successful, build a string representing the shader source
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    return str;
}
////////////////////////////////////////////////////////////
function setuniform3f(vname,vData)
{
    try
    {
        var vUniform = g_WebGL.getUniformLocation(g_shader_program, vname);
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
        var vUniform = g_WebGL.getUniformLocation(g_shader_program, vname);
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
        var vUniform = g_WebGL.getUniformLocation(g_shader_program, vname);
        g_WebGL.uniform1i(vUniform, vdata);
    }
    catch(e)
    {
        console.log(e);
    }
}


//

function getJSONFile(url,descr)
{
    try {
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

    } // end try

    catch(e)
    {
        console.log(e);
        return(String.null);
    }
} // end get input spheres


function loadlights()
{
    var vjs = getJSONFile(G_LIGHTS_HTTP,"lights");
    if(String.null === vjs)
    {
        console.log("load lgihts failed");
    }
    else
    {
        try
        {
            for(var nObjIdx = 0;nObjIdx < vjs.length; nObjIdx++)
            {
                var vpos = vec3.fromValues(vjs[nObjIdx].x, vjs[nObjIdx].y,vjs[nObjIdx].z);
                addsinglelight(vpos,vjs[nObjIdx].ambient,vjs[nObjIdx].diffuse,vjs[nObjIdx].specular);
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
    g_obj_Lights.push(objlight);
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
                var objSphere = new Sphere(vcenter,vRadius);
                objSphere.setMaterial(objmaterial);
                g_obj_Spheres.push(objSphere);
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

/*
 varying vec3 vPosition;
 uniform vec3 cameraPosition;
 uniform int reflections;  // max = 10
 uniform bool shadows;

 uniform int spherenumber;  // max = 32
 uniform vec3 sphereCenters[32];//center + radius
 uniform vec3 sphererad[32];
 uniform vec3 sphamb[32];
 uniform vec3 sphdiff[32];
 uniform vec3 sphspec[32];
 uniform int sphspen[32];

 uniform int trianglesnumber;  // m32
 uniform vec3 trianglesnormals[32];//1,2,3... triangles normal
 uniform vec3 trianglespnts[96];//123 ,456,789... trianglespnt
 uniform vec3 triamb[32];
 uniform vec3 tridiff[32];
 uniform vec3 trispec[32];
 uniform int trispen[32];

 uniform int lgtsnumber;  // max32
 uniform vec3 lgtpos[32];
 uniform vec3 lgtamb[32];
 uniform vec3 lgtdiff[32];
 uniform vec3 lgtspec[32];
 uniform int lgtspen[32];
 * */
function setShperestoShader()
{
    for (var idx = 0; (idx < g_obj_Spheres.length) &&(idx < G_MAX_SHADER_UM); idx++)
    {
        setuniform3f("sphereCenters[" + idx + "]",g_obj_Spheres[idx].c);
        setuniform1f("sphererad[" + idx + "]",g_obj_Spheres[idx].r);
        setuniform3f("sphamb[" + idx + "]",g_obj_Spheres[idx].m.amb);
        setuniform3f("sphdiff[" + idx + "]",g_obj_Spheres[idx].m.dif);
        setuniform3f("sphspec[" + idx + "]",g_obj_Spheres[idx].m.spc);
    }
    setuniform1i("spherenumber",g_obj_Spheres.length);
}

function setTrianglestoShader()
{
    setuniform1i("trianglesnumber",g_obj_Triangles.length);
}

function setLightstoShader()
{
    try
    {
        for (var idx = 0; (idx < g_obj_Lights.length) &&(idx < G_MAX_SHADER_UM); idx++)
        {
            setuniform3f("lgtpos[" + idx + "]",g_obj_Lights[idx].pos);
            setuniform3f("lgtamb[" + idx + "]",g_obj_Lights[idx].amb_color);
            setuniform3f("lgtdiff[" + idx + "]",g_obj_Lights[idx].dif_color);
            setuniform3f("lgtspec[" + idx + "]",g_obj_Lights[idx].spc_color);
        }
        setuniform1i("lgtsnumber",g_obj_Lights.length);
    }
    catch(e)
    {
        console.log(e);
    }
}

function setupShaderParam()
{
    loadSphere();
    setShperestoShader();

    setTrianglestoShader();

    loadlights();
    setLightstoShader();

    setupShaderRenderingParam();
}

/*
 uniform vec3 cameraPosition;
 uniform int reflections;  // max = 10
 uniform bool shadows;
* */
function setupShaderRenderingParam()
{
    setuniform1i("reflections",2);
    setuniform3f("cameraPosition",g_v_campos);
}
////////////////////////////////////////////////////////////

function setupShaders()
{
    try
    {
        var fragShader = g_WebGL.createShader(g_WebGL.FRAGMENT_SHADER);
        g_WebGL.shaderSource(fragShader, getShaderContent(g_f_shader_id));
        g_WebGL.compileShader(fragShader);

        var vShader = g_WebGL.createShader(g_WebGL.VERTEX_SHADER);
        g_WebGL.shaderSource(vShader, getShaderContent(g_v_shader_id));
        g_WebGL.compileShader(vShader);


        g_shader_program = g_WebGL.createProgram();

        g_WebGL.attachShader(g_shader_program, fragShader);
        g_WebGL.attachShader(g_shader_program, vShader);

        g_WebGL.linkProgram(g_shader_program);
        g_WebGL.useProgram(g_shader_program);
    }
    catch (e)
    {
        console.log(e);
    }
}


function setupCanvas()
{
    g_Canvas = document.getElementById("viewport");
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
    }
    catch(e)
    {
        console.log(e);
    }
}

function setupBuffer()
{
    g_vertices = [
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0,
        0.5,0.5,0.0,
    ];

    g_indices = [0,1,2,2,3,0];

    g_vertex_buffer = g_WebGL.createBuffer();
    g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER, g_vertex_buffer);
    g_WebGL.bufferData(g_WebGL.ARRAY_BUFFER, new Float32Array(g_vertices), g_WebGL.STATIC_DRAW);
    g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER, null);

    // Create an empty buffer object to store Index buffer
    g_index_Buffer = g_WebGL.createBuffer();
    g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER, g_index_Buffer);
    g_WebGL.bufferData(g_WebGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(g_indices), g_WebGL.STATIC_DRAW);
    g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER, null);
}

function setupGlBuffer()
{
    g_WebGL.bindBuffer(g_WebGL.ARRAY_BUFFER, g_vertex_buffer);
    g_WebGL.bindBuffer(g_WebGL.ELEMENT_ARRAY_BUFFER, g_index_Buffer);

    var coord = g_WebGL.getAttribLocation(g_shader_program, "coordinates");

    g_WebGL.vertexAttribPointer(coord, 3, g_WebGL.FLOAT, false, 0, 0);
    g_WebGL.enableVertexAttribArray(coord);
}

function render() {
    try {

        g_WebGL.clearColor(0.5, 0.5, 0.5, 0.9);
        g_WebGL.enable(g_WebGL.DEPTH_TEST);
        g_WebGL.clear(g_WebGL.COLOR_BUFFER_BIT);
        g_WebGL.viewport(0,0,g_Canvas.width,g_Canvas.height);
        g_WebGL.drawElements(g_WebGL.TRIANGLES, g_indices.length, g_WebGL.UNSIGNED_SHORT,0);
    }
    catch (e) {
        console.log(e);
    }
}

function setupAll()
{
    g_v_campos = vec3.fromValues(0.5,0.5,-0.5);

    setupCanvas();
    setupWebGL();
    setupShaders();
    setupBuffer();
    setupGlBuffer();
    setupShaderParam();
    render();
}