class HdrCanvas
{
    constructor(canvasele) {
        this.canvasele = canvasele;
        this.INPUT_URL = ""; // location of input files
        this.INPUT_TRIANGLES_URL = this.INPUT_URL + "triangles.json"; // triangles file loc
        this.INPUT_SPHERES_URL = this.INPUT_URL + "spheres.json"; // spheres file loc
        this.INPUT_LIGHT_URL = this.INPUT_URL + "lights.json";

        this.defaultEye = vec3.fromValues(0.5, 0.3, -0.1);
        this.defaultCenter = vec3.fromValues(0.5, 0.5, 0.5);
        this.defaultUp = vec3.fromValues(0, 1, 0);
        this.lightAmbient = vec3.fromValues(1, 1, 1);
        this.lightDiffuse = vec3.fromValues(1, 1, 1);
        this.lightSpecular = vec3.fromValues(1, 1, 1);
        this.lightPosition = vec3.fromValues(0.5, 2, -0.3);
        this.rotateTheta = Math.PI / 100;

        /* input model data */
        this.gl = null;
        this.inputTriangles = [];
        this.numTriangleSets = 0;
        this.triSetSizes = [];
        this.inputSpheres = [];
        this.numSpheres = 0;

        /* model data prepared for webgl */
        this.vertexBuffers = [];
        this.normalBuffers = [];
        this.uvBuffers = [];
        this.triangleBuffers = [];
        this.textures = [];

        /* shader parameter locations */
        this.vPosAttribLoc;
        this.vNormAttribLoc;
        this.vUVAttribLoc;
        this.mMatrixULoc;
        this.pvmMatrixULoc;
        this.ambientULoc;
        this.diffuseULoc;
        this.specularULoc;
        this.shininessULoc;
        this.usingTextureULoc;
        this.textureULoc;

        this.Eye = vec3.clone(this.defaultEye); // eye position in world space
        this.Center = vec3.clone(this.defaultCenter); // view direction in world space
        this.Up = vec3.clone(this.defaultUp); // view up vector in world space
        this.viewDelta = 0; // how much to displace view with each key press

        /*light*/
        this.g_lights = [];
        this.shaderProgram = null;
        this.g_tone_mode = 0;// none
    }

    getJSONFile(url,descr) {
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

    stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);

    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i)& 0xff;
    }

    return buf;
}

    getBinaryFile(url) {
    try {
        var httpReq = new XMLHttpRequest(); // a new http request
        httpReq.open("GET",url,false); // init the request
        httpReq.overrideMimeType('text\/plain; charset=x-user-defined');
        httpReq.send(null); // send the request
        var startTime = Date.now();
        while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
            if ((Date.now()-startTime) > 3000)
                break;
        } // until its loaded or we time out after three seconds
        if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
            throw "Unable to open "+descr+" file!";
        else
            return this.stringToArrayBuffer(httpReq.response);
    }
    catch(e) {
        console.log(e);
        return(null);
    }
} // end get input spheres


    handleKeyDown(event) {

    const modelEnum = {TRIANGLES: "triangles", SPHERE: "sphere"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction

    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = this.inputTriangles[whichModel];
        else
            handleKeyDown.modelOn = this.inputSpheres[whichModel];
        handleKeyDown.modelOn.on = true;
    } // end highlight model

    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model

    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*this.rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model

    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,this.Center,this.Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,this.Up)); // get view right vector

    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {

        // model selection
        case "Space":
            if (handleKeyDown.modelOn != null)
                handleKeyDown.modelOn.on = false; // turn off highlighted model
            handleKeyDown.modelOn = null; // no highlighted model
            handleKeyDown.whichOn = -1; // nothing highlighted
            break;
        case "ArrowRight": // select next triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn+1) % this.numTriangleSets);
            break;
        case "ArrowLeft": // select previous triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : this.numTriangleSets-1);
            break;
        case "ArrowUp": // select next sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn+1) % this.numSpheres);
            break;
        case "ArrowDown": // select previous sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : this.numSpheres-1);
            break;

        // view change
        case "KeyA": // translate view left, rotate left with shift
            this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,viewRight,viewDelta));
            if (!event.getModifierState("Shift"))
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,viewRight,viewDelta));
            break;
        case "KeyD": // translate view right, rotate right with shift
            this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,viewRight,-viewDelta));
            if (!event.getModifierState("Shift"))
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,this.Up,viewDelta));
                this.Up = vec.cross(this.Up,viewRight,vec3.subtract(lookAt,this.Center,this.Eye)); /* global side effect */
            } else {
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,lookAt,-viewDelta));
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,lookAt,-viewDelta));
            } // end if shift not pressed
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,this.Up,-viewDelta));
                this.Up = vec.cross(this.Up,viewRight,vec3.subtract(lookAt,this.Center,this.Eye)); /* global side effect */
            } else {
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,lookAt,viewDelta));
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,lookAt,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                this.Up = vec3.normalize(this.Up,vec3.add(this.Up,this.Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,this.Up,viewDelta));
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,this.Up,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                this.Up = vec3.normalize(this.Up,vec3.add(this.Up,this.Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                this.Eye = vec3.add(this.Eye,this.Eye,vec3.scale(temp,this.Up,-viewDelta));
                this.Center = vec3.add(this.Center,this.Center,vec3.scale(temp,this.Up,-viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            this.Eye = vec3.copy(this.Eye,this.defaultEye);
            this.Center = vec3.copy(this.Center,this.defaultCenter);
            this.Up = vec3.copy(this.Up,this.defaultUp);
            break;

        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(this.Up,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,viewRight,viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(this.Up,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,lookAt,-viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,lookAt,viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,this.Up,viewDelta));
            break;
        case "KeyP": // translate down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,this.Up,-viewDelta));
            break;
        case "Backspace": // reset model transforms to default
            for (var whichTriSet=0; whichTriSet<this.numTriangleSets; whichTriSet++) {
                vec3.set(this.inputTriangles[whichTriSet].translation,0,0,0);
                vec3.set(this.inputTriangles[whichTriSet].xAxis,1,0,0);
                vec3.set(this.inputTriangles[whichTriSet].yAxis,0,1,0);
            } // end for all triangle sets
            for (var whichSphere=0; whichSphere<this.numSpheres; whichSphere++) {
                vec3.set(this.inputSpheres[whichSphere].translation,0,0,0);
                vec3.set(this.inputSpheres[whichSphere].xAxis,1,0,0);
                vec3.set(this.inputSpheres[whichSphere].yAxis,0,1,0);
            } // end for all spheres
            break;
    } // end switch
} // end handleKeyDown

    setupWebGL()
    {
        document.onkeydown = this.handleKeyDown;
        var webGLCanvas = document.getElementById(this.canvasele);
        this.gl = webGLCanvas.getContext("webgl");
        try {
            if (this.gl == null) {
                throw "unable to create gl context -- is your browser gl ready?";
            }
            else {
                this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
                this.gl.clearDepth(1.0); // use max when we clear the depth buffer
                this.gl.enable(this.gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
                var gext = this.gl.getExtension('OES_texture_float');
                gext = this.gl.getExtension('OES_texture_float_linear');
                gext = this.gl.getExtension('OES_texture_half_float');
                gext = this.gl.getExtension('OES_texture_half_float_linear');
            }
        } // end try
        catch(e)
        {
            console.log(e);
        }
} // end setupWebGL

////////////////////////////////
    checksize(v)
    {
        return ((v & (v - 1)) === 0);
    }

    setsingletexture(w, h)
    {
        if (this.checksize(w) && this.checksize(h))
        {
            //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            // this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texParameterf(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameterf(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        }
        else
        {
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        }
    }
/////////////////////////////////
    // load a texture for the current set or sphere
    loadTexture(whichModel,currModel,textureFile)
    {
        this.textures[whichModel] = this.gl.createTexture(); // new texture struct for model
        var currTexture = this.textures[whichModel]; // shorthand


        this.gl.bindTexture(this.gl.TEXTURE_2D, currTexture); // activate model's texture
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true); // invert vertical texcoord v, load gray 1x1
        if(1 == this.ishdr(textureFile))
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.FLOAT,new Float32Array(4));
        }
        else
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,new Uint8Array([64, 64, 64, 255]));
        }

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true); // invert vertical texcoord v
        this.gl.bindTexture(this.gl.TEXTURE_2D, null); // deactivate model's texture

        // if there is a texture to load, asynchronously load it
        if (textureFile != false)
        {
            if(1 == this.ishdr(textureFile))
            {
                var vfile = this.getBinaryFile(textureFile);
                {
                    var vdata = parseHdr(vfile);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, currTexture); // activate model's new texture

                    //test
                    var width = 64;
                    var height = 64;
                    var pixels = new Float32Array(width * height * 4);
                    for (var y = 0; y < height; ++y) {
                        for (var x = 0; x < width; ++x) {
                            var offset = (y * width + x) * 4;
                            pixels[offset + 0] = (x  / width) ;
                            pixels[offset + 1] = (y  / height) ;
                            pixels[offset + 2] = (x  / (width * height));
                            pixels[offset + 3] = 0.5;
                        }
                    }
                    //this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.FLOAT,pixels);

                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,vdata.shape[0],vdata.shape[1],0, this.gl.RGBA, this.gl.FLOAT,vdata.data);
                    this.setsingletexture(vdata.shape.width,vdata.shape.height);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null); // deactivate model's new texture
                }

            }
            else
            {
                currTexture.image = new Image(); // new image struct for texture
                currTexture.image.onload = function ()
                { // when texture image loaded...
                    this.gl.bindTexture(this.gl.TEXTURE_2D, currTexture); // activate model's new texture
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, currTexture.image); // norm 2D texture
                    //this.gl.generateMipmap(this.gl.TEXTURE_2D); // rebuild mipmap pyramid
                    this.setsingletexture(currTexture.image.width,currTexture.image.height);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null); // deactivate model's new texture
                } // end when texture image loaded
                currTexture.image.onerror = function () { // when texture image load fails...
                    console.log("Unable to load texture " + textureFile);
                } // end when texture image load fails
                currTexture.image.crossOrigin = "Anonymous"; // allow cross origin load, please
                currTexture.image.src = this.INPUT_URL + textureFile; // set image location
            }
        } // end if material has a texture
    }

    makeSphere(numLongSteps)
    {
        try {
            if (numLongSteps % 2 != 0)
                throw "in makeSphere: uneven number of longitude steps!";
            else if (numLongSteps < 4)
                throw "in makeSphere: number of longitude steps too small!";
            else { // good number longitude steps

                // make vertices, normals and uvs -- repeat longitude seam
                const INVPI = 1/Math.PI, TWOPI = Math.PI+Math.PI, INV2PI = 1/TWOPI, epsilon=0.001*Math.PI;
                var sphereVertices = [0,-1,0]; // vertices to return, init to south pole
                var sphereUvs = [0.5,0]; // uvs to return, bottom texture row collapsed to one texel
                var angleIncr = TWOPI / numLongSteps; // angular increment
                var latLimitAngle = angleIncr * (Math.floor(numLongSteps*0.25)-1); // start/end lat angle
                var latRadius, latY, latV; // radius, Y and texture V at current latitude
                for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle+epsilon; latAngle+=angleIncr) {
                    latRadius = Math.cos(latAngle); // radius of current latitude
                    latY = Math.sin(latAngle); // height at current latitude
                    latV = latAngle*INVPI + 0.5; // texture v = (latAngle + 0.5*PI) / PI
                    for (var longAngle=0; longAngle<=TWOPI+epsilon; longAngle+=angleIncr) { // for each long
                        sphereVertices.push(-latRadius*Math.sin(longAngle),latY,latRadius*Math.cos(longAngle));
                        sphereUvs.push(longAngle*INV2PI,latV); // texture u = (longAngle/2PI)
                    } // end for each longitude
                } // end for each latitude
                sphereVertices.push(0,1,0); // add north pole
                sphereUvs.push(0.5,1); // top texture row collapsed to one texel
                var sphereNormals = sphereVertices.slice(); // for this sphere, vertices = normals; return these

                // make triangles, first poles then middle latitudes
                var sphereTriangles = []; // triangles to return
                var numVertices = Math.floor(sphereVertices.length/3); // number of vertices in sphere
                for (var whichLong=1; whichLong<=numLongSteps; whichLong++) { // poles
                    sphereTriangles.push(0,whichLong,whichLong+1);
                    sphereTriangles.push(numVertices-1,numVertices-whichLong-1,numVertices-whichLong-2);
                } // end for each long
                var llVertex; // lower left vertex in the current quad
                for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                    for (var whichLong=0; whichLong<numLongSteps; whichLong++) {
                        llVertex = whichLat*(numLongSteps+1) + whichLong + 1;
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+numLongSteps+2);
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+2,llVertex+1);
                    } // end for each longitude
                } // end for each latitude
            } // end if good number longitude steps
            return({vertices:sphereVertices, normals:sphereNormals, uvs:sphereUvs, triangles:sphereTriangles});
        } // end try

        catch(e) {
            console.log(e);
        } // end catch
    } // end make sphere


// read models in, load them into webgl buffers
    loadModels()
    {
        this.inputTriangles = this.getJSONFile(this.INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

        try {
            if (this.inputTriangles == String.null)
                throw "Unable to load triangles file!";
            else {
                var currSet; // the current triangle set
                var whichSetVert; // index of vertex in current triangle set
                var whichSetTri; // index of triangle in current triangle set
                var vtxToAdd; // vtx coords to add to the vertices array
                var normToAdd; // vtx normal to add to the normal array
                var uvToAdd; // uv coords to add to the uv arry
                var triToAdd; // tri indices to add to the index array
                var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
                var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner

                // process each triangle set to load webgl vertex and triangle buffers
                this.numTriangleSets = this.inputTriangles.length; // remember how many tri sets
                for (var whichSet=0; whichSet<this.numTriangleSets; whichSet++) { // for each tri set
                    currSet = this.inputTriangles[whichSet];

                    // set up hilighting, modeling translation and rotation
                    currSet.center = vec3.fromValues(0,0,0);  // center point of tri set
                    currSet.on = false; // not highlighted
                    currSet.translation = vec3.fromValues(0,0,0); // no translation
                    currSet.xAxis = vec3.fromValues(1,0,0); // model X axis
                    currSet.yAxis = vec3.fromValues(0,1,0); // model Y axis

                    // set up the vertex, normal and uv arrays, define model center and axes
                    currSet.glVertices = []; // flat coord list for webgl
                    currSet.glNormals = []; // flat normal list for webgl
                    currSet.glUvs = []; // flat texture coord list for webgl
                    var numVerts = currSet.vertices.length; // num vertices in tri set
                    for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                        vtxToAdd = currSet.vertices[whichSetVert]; // get vertex to add
                        normToAdd = currSet.normals[whichSetVert]; // get normal to add
                        uvToAdd = currSet.uvs[whichSetVert]; // get uv to add
                        currSet.glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set vertex list
                        currSet.glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set normal list
                        currSet.glUvs.push(uvToAdd[0],uvToAdd[1]); // put uv in set uv list
                        vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                        vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                        vec3.add(currSet.center,currSet.center,vtxToAdd); // add to ctr sum
                    } // end for vertices in set
                    vec3.scale(currSet.center,currSet.center,1/numVerts); // avg ctr sum

                    // send the vertex coords, normals and uvs to webGL; load texture
                    this.vertexBuffers[whichSet] = this.gl.createBuffer(); // init empty webgl set vertex coord buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffers[whichSet]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(currSet.glVertices),this.gl.STATIC_DRAW); // data in
                    this.normalBuffers[whichSet] = this.gl.createBuffer(); // init empty webgl set normal component buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.normalBuffers[whichSet]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(currSet.glNormals),this.gl.STATIC_DRAW); // data in
                    this.uvBuffers[whichSet] = this.gl.createBuffer(); // init empty webgl set uv coord buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.uvBuffers[whichSet]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(currSet.glUvs),this.gl.STATIC_DRAW); // data in

                    this.loadTexture(whichSet,currSet,currSet.material.texture); // load tri set's texture

                    // set up the triangle index array, adjusting indices across sets
                    currSet.glTriangles = []; // flat index list for webgl
                    this.triSetSizes[whichSet] = currSet.triangles.length; // number of tris in this set
                    for (whichSetTri=0; whichSetTri<this.triSetSizes[whichSet]; whichSetTri++)
                    {
                        triToAdd = currSet.triangles[whichSetTri]; // get tri to add
                        currSet.glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                    } // end for triangles in set

                    // send the triangle indices to webGL
                    this.triangleBuffers.push(this.gl.createBuffer()); // init empty triangle index buffer
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffers[whichSet]); // activate that buffer
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(currSet.glTriangles),this.gl.STATIC_DRAW); // data in

                } // end for each triangle set

                this.inputSpheres = this.getJSONFile(this.INPUT_SPHERES_URL,"spheres"); // read in the sphere data

                if (this.inputSpheres == String.null)
                    throw "Unable to load spheres file!";
                else {

                    // init sphere highlighting, translation and rotation; update bbox
                    var sphere; // current sphere
                    var temp = vec3.create(); // an intermediate vec3
                    var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from sphere
                    this.numSpheres = this.inputSpheres.length; // remember how many spheres
                    for (var whichSphere=0; whichSphere<this.numSpheres; whichSphere++) {
                        sphere = this.inputSpheres[whichSphere];
                        sphere.on = false; // spheres begin without highlight
                        sphere.translation = vec3.fromValues(0,0,0); // spheres begin without translation
                        sphere.xAxis = vec3.fromValues(1,0,0); // sphere X axis
                        sphere.yAxis = vec3.fromValues(0,1,0); // sphere Y axis
                        sphere.center = vec3.fromValues(0,0,0); // sphere instance is at origin
                        vec3.set(minXYZ,sphere.x-sphere.r,sphere.y-sphere.r,sphere.z-sphere.r);
                        vec3.set(maxXYZ,sphere.x+sphere.r,sphere.y+sphere.r,sphere.z+sphere.r);
                        vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                        vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner
                        this.loadTexture(this.numTriangleSets+whichSphere,sphere,sphere.texture); // load the sphere's texture
                    } // end for each sphere
                    this.viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set global

                    // make one sphere instance that will be reused, with 32 longitude steps
                    var oneSphere = this.makeSphere(32);

                    // send the sphere vertex coords and normals to webGL
                    this.vertexBuffers.push(this.gl.createBuffer()); // init empty webgl sphere vertex coord buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffers[this.vertexBuffers.length-1]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(oneSphere.vertices),this.gl.STATIC_DRAW); // data in
                    this.normalBuffers.push(this.gl.createBuffer()); // init empty webgl sphere vertex normal buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.normalBuffers[this.normalBuffers.length-1]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(oneSphere.normals),this.gl.STATIC_DRAW); // data in
                    this.uvBuffers.push(this.gl.createBuffer()); // init empty webgl sphere vertex uv buffer
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.uvBuffers[this.uvBuffers.length-1]); // activate that buffer
                    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(oneSphere.uvs),this.gl.STATIC_DRAW); // data in

                    this.triSetSizes.push(oneSphere.triangles.length);

                    this.triangleBuffers.push(this.gl.createBuffer()); // init empty triangle index buffer
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffers[this.triangleBuffers.length-1]); // activate that buffer
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(oneSphere.triangles),this.gl.STATIC_DRAW); // data in
                }
            }
        }

        catch(e) {
            console.log(e);
        } // end catch
    }

    setupShaders() {

    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aVertexUV; // vertex texture uv
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 vVertexUV; // interpolated uv for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            
            // vertex uv
            vVertexUV = aVertexUV;
        }
    `;

    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform int lightnumber;
        uniform vec3 uLightAmbient[10]; // the light's ambient color
        uniform vec3 uLightDiffuse[10]; // the light's diffuse color
        uniform vec3 uLightSpecular[10]; // the light's specular color
        uniform vec3 uLightPosition[10]; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        
        // texture properties
        uniform bool uUsingTexture; // if we are using a texture
        uniform sampler2D uTexture; // the texture for the fragment
        varying vec2 vVertexUV; // texture uv of fragment
            
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        
        //tone mapping
        uniform float exposure;
        uniform int tonemappingmode;
        float gamma = 2.2;
        vec3 linearToneMapping(vec3 color)
        {
            color = clamp(exposure * color, 0., 1.);
            color = pow(color, vec3(1. / gamma));
            return color;
        }
        
        vec3 simpleReinhardToneMapping(vec3 color)
        {
            color *= exposure/(1. + color / exposure);
            color = pow(color, vec3(1. / gamma));
            return color;
        }
        
        vec3 filmicToneMapping(vec3 color)
        {
            color = max(vec3(0.), color - vec3(0.004));
            color = (color * (6.2 * color + .5)) / (color * (6.2 * color + 1.7) + 0.06);
            return color;
        }
        
        vec3 Uncharted2ToneMapping(vec3 color)
        {
            float A = 0.15;
            float B = 0.50;
            float C = 0.10;
            float D = 0.20;
            float E = 0.02;
            float F = 0.30;
            float W = 11.2;
            color *= exposure;
            color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
            float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
            color /= white;
            color = pow(color, vec3(1. / gamma));
            return color;
        }
        
        vec3 rgbe2rgb(vec4 rgbe) {
          return (rgbe.rgb * pow(2.0, rgbe.a - 128.0));
        }

        void main(void) {
        
            vec3 litColor = vec3(0.0,0.0,0.0);
            vec3 normal = normalize(vVertexNormal); 
            vec3 eye = normalize(uEyePosition - vWorldPos);
            for(int lgihtidx = 0; lgihtidx < 10; lgihtidx++)
            {
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient[lgihtidx]; 
            
            // diffuse term
          
            vec3 light = normalize(uLightPosition[lgihtidx] - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse[lgihtidx]*lambert; // diffuse term
            
            // specular term
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular[lgihtidx]*highlight; // specular term
            
            // combine to find lit color
            litColor += ambient + diffuse + specular; 
            }
            
            if (!uUsingTexture) {
                gl_FragColor = vec4(litColor, 1.0);
            } else {
                vec4 texColor = texture2D(uTexture, vec2(vVertexUV.s, vVertexUV.t));
                //gl_FragColor = vec4(rgbe2rgb(texColor) * litColor, 1.0);
                gl_FragColor = vec4(rgbe2rgb(texColor), 1.0);
            }
             //gl_FragColor = clamp(gl_FragColor,0.0,1.0);
             if(tonemappingmode == 1){gl_FragColor = vec4(simpleReinhardToneMapping(gl_FragColor.rgb),1.0);}
             if(tonemappingmode == 2){gl_FragColor = vec4(Uncharted2ToneMapping(gl_FragColor.rgb),1.0);}
        } // end main
    `;

    try {
        var fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER); // create frag shader
        this.gl.shaderSource(fShader,fShaderCode); // attach code to shader
        this.gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = this.gl.createShader(this.gl.VERTEX_SHADER); // create vertex shader
        this.gl.shaderSource(vShader,vShaderCode); // attach code to shader
        this.gl.compileShader(vShader); // compile the code for gpu execution

        if (!this.gl.getShaderParameter(fShader, this.gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + this.gl.getShaderInfoLog(fShader);
            this.gl.deleteShader(fShader);
        } else if (!this.gl.getShaderParameter(vShader, this.gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + this.gl.getShaderInfoLog(vShader);
            this.gl.deleteShader(vShader);
        } else { // no compile errors
            this.shaderProgram = this.gl.createProgram(); // create the single shader program
            this.gl.attachShader(this.shaderProgram, fShader); // put frag shader in program
            this.gl.attachShader(this.shaderProgram, vShader); // put vertex shader in program
            this.gl.linkProgram(this.shaderProgram); // link program into gl context

            if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + this.gl.getProgramInfoLog(this.shaderProgram);
            } else { // no shader program link errors
                this.gl.useProgram(this.shaderProgram); // activate shader program (frag and vert)

                // locate and enable vertex attributes
                this.vPosAttribLoc = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                this.gl.enableVertexAttribArray(this.vPosAttribLoc); // connect attrib to array
                this.vNormAttribLoc = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                this.gl.enableVertexAttribArray(this.vNormAttribLoc); // connect attrib to array
                this.vUVAttribLoc = this.gl.getAttribLocation(this.shaderProgram, "aVertexUV"); // ptr to vertex UV attrib
                this.gl.enableVertexAttribArray(this.vUVAttribLoc); // connect attrib to array

                // locate vertex uniforms
                this.mMatrixULoc = this.gl.getUniformLocation(this.shaderProgram, "umMatrix"); // ptr to mmat
                this.pvmMatrixULoc = this.gl.getUniformLocation(this.shaderProgram, "upvmMatrix"); // ptr to pvmmat

                // locate fragment uniforms
                var eyePositionULoc = this.gl.getUniformLocation(this.shaderProgram, "uEyePosition"); // ptr to eye position
                  this.ambientULoc = this.gl.getUniformLocation(this.shaderProgram, "uAmbient"); // ptr to ambient
                this.diffuseULoc = this.gl.getUniformLocation(this.shaderProgram, "uDiffuse"); // ptr to diffuse
                this.specularULoc = this.gl.getUniformLocation(this.shaderProgram, "uSpecular"); // ptr to specular
                this.shininessULoc = this.gl.getUniformLocation(this.shaderProgram, "uShininess"); // ptr to shininess
                this.usingTextureULoc = this.gl.getUniformLocation(this.shaderProgram, "uUsingTexture"); // ptr to using texture
                this.textureULoc = this.gl.getUniformLocation(this.shaderProgram, "uTexture"); // ptr to texture

                this.gl.uniform3fv(eyePositionULoc,this.Eye); // pass in the eye's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try

    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

    loadLights()
    {
        var vobjtype = "lgihts";
        var vstr = this.getJSONFile(this.INPUT_LIGHT_URL,vobjtype);
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
                    var objlight = new Light(vpos,vstr[nObjIdx].ambient,vstr[nObjIdx].diffuse,vstr[nObjIdx].specular);
                    this.g_lights.push(objlight);
                }
            }
            catch(e)
            {
                console.log(e);
            }
        }

        this.setlights();
    }


    setlights()
    {
        for(var v = 0; v < this.g_lights.length; v++)
        {
            var lightAmbientULoc = this.gl.getUniformLocation(this.shaderProgram, "uLightAmbient[" + v+"]"); // ptr to light ambient
            var lightDiffuseULoc = this.gl.getUniformLocation(this.shaderProgram, "uLightDiffuse[" + v+"]"); // ptr to light diffuse
            var lightSpecularULoc = this.gl.getUniformLocation(this.shaderProgram, "uLightSpecular[" + v+"]"); // ptr to light specular
            var lightPositionULoc = this.gl.getUniformLocation(this.shaderProgram, "uLightPosition[" + v+"]"); // ptr to light position

            this.gl.uniform3fv(lightAmbientULoc,this.g_lights[v].amb_color); // pass in the light's ambient emission
            this.gl.uniform3fv(lightDiffuseULoc,this.g_lights[v].dif_color); // pass in the light's diffuse emission
            this.gl.uniform3fv(lightSpecularULoc,this.g_lights[v].spc_color); // pass in the light's specular emission
            this.gl.uniform3fv(lightPositionULoc,this.g_lights[v].pos); // pass in the light's position
        }
        var lightnum = this.gl.getUniformLocation(this.shaderProgram, "lightnumber");
        this.gl.uniform1i(lightnum,this.g_lights.length);
    }

// render the loaded model

    renderModels(obj)
    {
        obj.rotateobj(obj.Up,1,0);
        obj.rotateobj(obj.Up,1,1);

        function  makeModelTransform(currModel)
        {
            var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCenter = vec3.create();

            vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
            mat4.set(sumRotation, // get the composite rotation
                currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
                currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
                currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
                0, 0,  0, 1);
            vec3.negate(negCenter,currModel.center);
            mat4.multiply(sumRotation,sumRotation,mat4.fromTranslation(temp,negCenter)); // rotate * -translate
            mat4.multiply(sumRotation,mat4.fromTranslation(temp,currModel.center),sumRotation); // translate * rotate * -translate
            mat4.fromTranslation(mMatrix,currModel.translation); // translate in model matrix
            mat4.multiply(mMatrix,mMatrix,sumRotation); // rotate in model matrix
        } // end make model transform

        var hMatrix = mat4.create(); // handedness matrix
        var pMatrix = mat4.create(); // projection matrix
        var vMatrix = mat4.create(); // view matrix
        var mMatrix = mat4.create(); // model matrix
        var hpvMatrix = mat4.create(); // hand * proj * view matrices
        var hpvmMatrix = mat4.create(); // hand * proj * view * model matrices
        const HIGHLIGHTMATERIAL =
            {ambient:[0.5,0.5,0], diffuse:[0.5,0.5,0], specular:[0,0,0], n:1, alpha:1, texture:false}; // hlht mat

        window.requestAnimationFrame(function()
        {
            obj.renderModels(obj);
        }
        ); // set up frame render callback

        obj.gl.clear(obj.gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

        // set up handedness, projection and view
        mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
        //mat4.perspective(pMatrix,0.45*Math.PI,1,0.1,10); // create projection matrix
        mat4.ortho(pMatrix,1,-1,-1,1,0.0,10);
        mat4.lookAt(vMatrix,obj.Eye,obj.Center,obj.Up); // create view matrix
        mat4.multiply(hpvMatrix,hMatrix,pMatrix); // handedness * projection
        mat4.multiply(hpvMatrix,hpvMatrix,vMatrix); // handedness * projection * view

        // render each triangle set
        var currSet, setMaterial; // the tri set and its material properties
        for (var whichTriSet=0; whichTriSet<obj.numTriangleSets; whichTriSet++)
        {
            currSet = obj.inputTriangles[whichTriSet];
            // make model transform, add to view project
            makeModelTransform(currSet);
            mat4.multiply(hpvmMatrix,hpvMatrix,mMatrix); // handedness * project * view * model
            obj.gl.uniformMatrix4fv(obj.mMatrixULoc, false, mMatrix); // pass in the m matrix
            obj.gl.uniformMatrix4fv(obj.pvmMatrixULoc, false, hpvmMatrix); // pass in the hpvm matrix

            // reflectivity: feed to the fragment shader
            if (obj.inputTriangles[whichTriSet].on)
                setMaterial = HIGHLIGHTMATERIAL; // highlight material
            else
                setMaterial = currSet.material; // normal material
            obj.gl.uniform3fv(obj.ambientULoc,setMaterial.ambient); // pass in the ambient reflectivity
            obj.gl.uniform3fv(obj.diffuseULoc,setMaterial.diffuse); // pass in the diffuse reflectivity
            obj.gl.uniform3fv(obj.specularULoc,setMaterial.specular); // pass in the specular reflectivity
            obj.gl.uniform1f(obj.shininessULoc,setMaterial.n); // pass in the specular exponent
            obj.gl.uniform1i(obj.usingTextureULoc,(currSet.material.texture != false)); // whether the set uses texture
            obj.gl.activeTexture(obj.gl.TEXTURE0); // bind to active texture 0 (the first)
            obj.gl.bindTexture(obj.gl.TEXTURE_2D, obj.textures[whichTriSet]); // bind the set's texture
            obj.gl.uniform1i(obj.textureULoc, 0); // pass in the texture and active texture 0

            // position, normal and uv buffers: activate and feed into vertex shader
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.vertexBuffers[whichTriSet]); // activate position
            obj.gl.vertexAttribPointer(obj.vPosAttribLoc,3,obj.gl.FLOAT,false,0,0); // feed
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.normalBuffers[whichTriSet]); // activate normal
            obj.gl.vertexAttribPointer(obj.vNormAttribLoc,3,obj.gl.FLOAT,false,0,0); // feed
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.uvBuffers[whichTriSet]); // activate uv
            obj.gl.vertexAttribPointer(obj.vUVAttribLoc,2,obj.gl.FLOAT,false,0,0); // feed

            // triangle buffer: activate and render
            obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER,obj.triangleBuffers[whichTriSet]); // activate
            obj.gl.drawElements(obj.gl.TRIANGLES,3*obj.triSetSizes[whichTriSet],obj.gl.UNSIGNED_SHORT,0); // render

        } // end for each triangle set

        // render each sphere
        var sphere, currentMaterial, instanceTransform = mat4.create(); // the current sphere and material
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.vertexBuffers[obj.vertexBuffers.length-1]); // activate vertex buffer
        obj.gl.vertexAttribPointer(obj.vPosAttribLoc,3,obj.gl.FLOAT,false,0,0); // feed vertex buffer to shader
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.normalBuffers[obj.normalBuffers.length-1]); // activate normal buffer
        obj.gl.vertexAttribPointer(obj.vNormAttribLoc,3,obj.gl.FLOAT,false,0,0); // feed normal buffer to shader
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER,obj.uvBuffers[obj.uvBuffers.length-1]); // activate uv
        obj.gl.vertexAttribPointer(obj.vUVAttribLoc,2,obj.gl.FLOAT,false,0,0); // feed
        obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER,obj.triangleBuffers[obj.triangleBuffers.length-1]); // activate tri buffer

        for (var whichSphere=0; whichSphere<obj.numSpheres; whichSphere++)
        {
            sphere = obj.inputSpheres[whichSphere];

            // define model transform, premult with pvmMatrix, feed to shader
            makeModelTransform(sphere);
            mat4.fromTranslation(instanceTransform,vec3.fromValues(sphere.x,sphere.y,sphere.z)); // recenter sphere
            mat4.scale(mMatrix,mMatrix,vec3.fromValues(sphere.r,sphere.r,sphere.r)); // change size
            mat4.multiply(mMatrix,instanceTransform,mMatrix); // apply recenter sphere
            hpvmMatrix = mat4.multiply(hpvmMatrix,hpvMatrix,mMatrix); // premultiply with hpv matrix
            obj.gl.uniformMatrix4fv(obj.mMatrixULoc, false, mMatrix); // pass in model matrix
            obj.gl.uniformMatrix4fv(obj.pvmMatrixULoc, false, hpvmMatrix); // pass in handed project view model matrix

            // reflectivity: feed to the fragment shader
            if (sphere.on)
                currentMaterial = HIGHLIGHTMATERIAL;
            else
                currentMaterial = sphere;
            obj.gl.uniform3fv(obj.ambientULoc,currentMaterial.ambient); // pass in the ambient reflectivity
            obj.gl.uniform3fv(obj.diffuseULoc,currentMaterial.diffuse); // pass in the diffuse reflectivity
            obj.gl.uniform3fv(obj.specularULoc,currentMaterial.specular); // pass in the specular reflectivity
            obj.gl.uniform1f(obj.shininessULoc,currentMaterial.n); // pass in the specular exponent
            obj.gl.uniform1i(obj.usingTextureULoc,(sphere.texture != false)); // whether the sphere uses texture
            obj.gl.activeTexture(obj.gl.TEXTURE0); // bind to active texture 0 (the first)
            obj.gl.bindTexture(obj.gl.TEXTURE_2D, obj.textures[obj.numTriangleSets+whichSphere]); // bind the set's texture
            obj.gl.uniform1i(obj.textureULoc, 0); // pass in the texture and active texture 0

            obj.gl.drawElements(obj.gl.TRIANGLES,obj.triSetSizes[obj.triSetSizes.length-1],obj.gl.UNSIGNED_SHORT,0); // render
        }
    }

    /* MAIN -- HERE is where execution begins after window load */

    main()
    {
        this.setupWebGL(); // set up the webGL environment
        this.loadModels(); // load in the models from tri file
        this.setupShaders(); // setup the webGL shaders
        this.loadLights();
        this.updatetoneparam(1.5);
        this.renderModels(this); // draw the triangles using webGL
    }



    updatetonemode()
    {
        //tonemappingmode
        var tonemode = this.gl.getUniformLocation(this.shaderProgram, "tonemappingmode");
        this.gl.uniform1i(tonemode,this.g_tone_mode);
    }

    updatetoneparam(val)
    {
        //tonemappingmode
        var expo = this.gl.getUniformLocation(this.shaderProgram, "exposure");
        this.gl.uniform1f(expo,val);
    }



    rotateobj(axis,direction,idx)
    {
        var newRotation = mat4.create();
        mat4.fromRotation(newRotation,direction*this.rotateTheta,axis); // get a rotation matrix around passed axis
        vec3.transformMat4(this.inputSpheres[idx].xAxis,this.inputSpheres[idx].xAxis,newRotation); // rotate model x axis tip
        vec3.transformMat4(this.inputSpheres[idx].yAxis,this.inputSpheres[idx].yAxis,newRotation); // rotate model y axis tip
    }


///load hdr file
    ishdr(f)
    {
        var vs = f.split(".");
        return vs[vs.length-1] === "hdr" ? 1:0;
    }

    loadhdr(f)
    {
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log(reader.result);
            var envMapInfo = parseHdr(reader.result);
            return envMapInfo.data;
        }
        reader.readAsBinaryString(f);
    }

////////////////////////////////////////////////////////////////
    gotoNT()
    {
        this.g_tone_mode = 0;
        this.updatetonemode();
    }

    gotoRT()
    {
        this.g_tone_mode = 1;
        this.updatetonemode();
    }

    gotoUT()
    {
        this.g_tone_mode = 2;
        this.updatetonemode();
    }

    setexpo(x)
    {
        this. updatetoneparam(x);
    }
}