/**
 * Created by matt on 12/2/16.
 */
///<reference path="three.js" />
///<reference path="OBJLoader.js"/>
///<reference path="datadef.js"/>

/*public
 * */
var G_C_BACKGROUND_COLOR = 0xf0f0f0;

var g_render = null;

var g_scene = null;
var g_global_camera = null;

var g_m_river = null;
var g_m_road = null;
var g_m_score = null;
var g_m_log = null;

var g_load_mgr = null;
var g_r_ray = null;


var g_o_river = null;
var g_o_road = null;
var g_o_grass = null;
var g_g_backgd = null;

var g_o_logs = [];
var g_o_cars = [];
var g_o_creature = [];
var g_o_frog = null;
var g_o_score = null;
var g_o_font = null;

var g_i_cars = [];
var g_i_logs = [];
var g_a_objs = null;

var g_a_frog_action = null;
var g_a_frog_status = null;
var g_a_PFS_mgr = null;
var g_a_Jump_mgr = null;
var g_a_score_mgr = null;

var g_s_hop_player = null;
var g_s_squash_player= null;
var g_s_plunk_player= null;
var g_s_suc_player = null;


var g_u_timer = null;

var G_C_timer_clapse = 1000;
var G_C_3D_OBJ_Z = 0;

var G_C_log_length_max = 120;
var G_C_log_length_min = 80;

var G_C_singleway_height = 60; // 1/10 * G_C_playfield_height
var G_C_gap_between_cars = 250;
var G_C_gap_between_logs = 100;
var G_C_gap_between_riverandroad = 50;

var G_C_log_size = 14;
var G_C_creature_size = 34;
var G_C_car_size = 36;
var G_C_frog_size = 36;
var G_c_frog_scale = 1.0;
var G_c_frog_last_pos = null;
var G_c_frog_scale_step = 0.2;

var G_C_single_offset = 12;

var G_C_playfield_length = 600;
var G_C_playfield_height = 600;
var G_C_river_height = 200;
var G_C_road_height = 300;


var G_C_obj_type_null = -1;
var G_C_obj_type_car = 0;
var G_C_obj_type_log = 1;
var G_C_obj_type_creature = 2;


var G_C_sounds_hop = 1;
var G_C_sounds_squash = 2;
var G_C_sounds_plunk = 3;
var G_C_sounds_suc = 3;


var G_C_wnd_width = 500;
var G_C_wnd_height = 600;

var G_C_camera_near = 0.1;
var G_C_camera_far = 500;

var G_C_game_log_speed = 2;
var G_C_game_car_speed = 2;
var G_C_game_frog_speed = 2;
var G_C_game_frog_move_step_x = 60; // 1/10 * G_C_playfield_height
var G_C_game_frog_move_step_y = 60; // 1/10 * G_C_playfield_height
var G_C_game_frog_steps_permove = 1;
var G_C_game_frog_times = 3;
var G_C_game_frame_elapse = 40;
var G_C_game_score_step = 10;
var G_C_game_score_factor = 1;
var G_C_game_play_sounds = 1;
var G_C_HTTP_PREFIX = "https://raw.githubusercontent.com/MattShi/CGHW4/master/";



function initial()
{
    G_C_singleway_height = 0.1 * G_C_playfield_height;
    G_C_game_frog_move_step_x = G_C_singleway_height; // 1/10 * G_C_playfield_height
    G_C_game_frog_move_step_y = G_C_singleway_height; // 1/10 * G_C_playfield_height
    ////
    g_a_frog_status = new FrogStatus(G_C_game_frog_times);
    g_a_PFS_mgr = new FPSMgr(G_C_game_frame_elapse);
    g_a_Jump_mgr = new JumpMgr();
    g_a_score_mgr = new ScoreMgr(G_C_game_score_step,G_C_game_score_factor);

    intial_scene();
    inital_light();
    intial_rendercontainor();
    intial_camera();
    starttimer();
    intial_background();
    intial_log_material();
    initial_obj_containor();
    load_sounds();
    load_objs();
    load_frog();
    updatescoreinfo();
    animate();
}

/*tools
 * */

function getrandomnumber(vmin,vmax)
{
    return Math.floor((Math.random() * vmax)) + vmin;
}


function getplayfiledrelatepos(vpos)
{
    var vroad = g_o_road.position;
    var vriver = g_o_river.position;
    if((vpos.y >= -0.4*G_C_playfield_height) &&(vpos.y <= 0)) // road
    {
        return {pos:Math.floor((vpos.y + 0.5*G_C_playfield_height)/G_C_singleway_height),type:G_C_obj_type_car};
    }
    else if((vpos.y <= 0.4*G_C_playfield_height) &&(vpos.y >= 0.1*G_C_playfield_height)) // river
    {
        return {pos:Math.floor((vpos.y + 0.5*G_C_playfield_height)/G_C_singleway_height),type:G_C_obj_type_log};
    }
    else
    {
        return {pos:-1,type:G_C_obj_type_null};
    }
}

function isSuc()
{
    if((g_o_frog.position.y > 0.4*G_C_playfield_height) && (g_o_frog.position.y <= 0.5*G_C_playfield_height))
    {
        return true;
    }
    else {
        return false;
    }

}

/*playfiled centered as {0,0,0}
 * */
function getplayfiedpartpos(b,t)
{
    return {b:(G_C_playfield_height*(b-0.5)),t:(G_C_playfield_height*(t-0.5))};
}

/**private
 */

function intial_rendercontainor()
{
    g_render = new THREE.WebGLRenderer();
    g_render.setClearColor(G_C_BACKGROUND_COLOR);
    g_render.setPixelRatio( window.devicePixelRatio );
    g_render.setSize(G_C_wnd_width, G_C_wnd_height);

    var container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.appendChild( g_render.domElement );

    document.addEventListener("keydown", onKeyDown, false);
}

function intial_scene()
{
    g_scene = new THREE.Scene();
    g_load_mgr = new THREE.LoadingManager();
    g_r_ray = new THREE.Raycaster();

}


function inital_light()
{
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    g_scene.add(light);
}

function intial_camera()
{
    g_global_camera = new THREE.OrthographicCamera( G_C_wnd_width/-2, G_C_wnd_width/2, G_C_wnd_height/2, G_C_wnd_height/-2, G_C_camera_near, G_C_camera_far );
    g_global_camera.position.x = 0;
    g_global_camera.position.y = 0;
    g_global_camera.position.z = 200;
}

function intial_log_material()
{
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var texture = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/log.jpg');
    g_m_log = new THREE.MeshBasicMaterial({map: texture});

}

/*
 -------------playfield--------------
 .....................................
 -------------river------------------
 -------log--------log---------------
 ------------log--------log----------
 -------------end river--------------
 .....................................
 -------------road--------------------
 ---------car------car----------------
 ---car-----------------car-----------
 -------------end  road---------------
 .....................................
 -----------end-----playfiled---------
 bottom to top: [0,0.1] grass ;[0.1,0.5] road [0.5,0.6][grass] [0.6,0.9] river [0.9,1.0]grass
 * */
function intial_background()
{
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var texture1 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+ 'images/river.jpeg');
    var material1 = new THREE.MeshBasicMaterial({map: texture1});

    var texture2 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/road.jpg');
    var material2 = new THREE.MeshBasicMaterial({map: texture2});

    var texture3 = THREE.ImageUtils.loadTexture( G_C_HTTP_PREFIX+'images/grass.jpg');
    var material3 = new THREE.MeshBasicMaterial({map: texture3});

    //
    var geograss = new THREE.PlaneGeometry( G_C_playfield_length, G_C_playfield_height);
    g_o_grass = new THREE.Mesh( geograss, material3);
    g_o_grass.position.x = 0;
    g_o_grass.position.y = 0;
    g_o_grass.position.z = G_C_3D_OBJ_Z;
    g_scene.add( g_o_grass );

    //road
    var vp = getplayfiedpartpos(0.1,0.5);
    G_C_road_height =  vp.t- vp.b;
    var georoad = new THREE.PlaneGeometry( G_C_playfield_length, G_C_road_height);
    g_o_road = new THREE.Mesh( georoad, material2 );

    g_o_road.position.y = vp.b + ( G_C_road_height)/2;
    g_o_road.position.z = G_C_3D_OBJ_Z+1;
    g_o_grass.add( g_o_road );

    //river
    vp = getplayfiedpartpos(0.6,0.9);
    G_C_river_height =  vp.t- vp.b;
    var georiver = new THREE.PlaneGeometry( G_C_playfield_length, G_C_river_height);
    g_o_river = new THREE.Mesh( georiver, material1);
    //g_o_river.position.x = 0;
    g_o_river.position.y = vp.b + (G_C_river_height)/2;
    g_o_river.position.z = G_C_3D_OBJ_Z+1;
    g_o_grass.add( g_o_river );

    //board
    loadFont();

    g_o_grass.updateMatrixWorld();
}

///////////////////////////////////////////
////load objs section
function load_objs()
{
    load_logs();
    load_creature();
    load_car_model();
}

function load_sounds()
{
    var audioListener = new THREE.AudioListener();
    g_s_hop_player = new THREE.Audio( audioListener );
    g_s_squash_player = new THREE.Audio( audioListener );
    g_s_plunk_player = new THREE.Audio( audioListener );
    g_s_suc_player = new THREE.Audio( audioListener );

    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var ahopload = new THREE.AudioLoader();
    ahopload.load(G_C_HTTP_PREFIX+'audio/hop.wav',
        function ( audioBuffer ) {
            g_s_hop_player.setBuffer( audioBuffer );
            g_scene.add(g_s_hop_player);
        },
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );

    var aplunkload = new THREE.AudioLoader();
    aplunkload.load(G_C_HTTP_PREFIX+'audio/plunk.wav',
        function ( audioBuffer ) {
            g_s_plunk_player.setBuffer( audioBuffer );
            g_scene.add(g_s_plunk_player);
        },
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );

    var asquashload = new THREE.AudioLoader();
    asquashload.load(G_C_HTTP_PREFIX+'audio/squash.wav',
        function ( audioBuffer ) {
            g_s_squash_player.setBuffer( audioBuffer );
            g_scene.add(g_s_squash_player);
        },
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );

    var asucload = new THREE.AudioLoader();
    asucload.load(G_C_HTTP_PREFIX+'audio/suc.wav',
        function ( audioBuffer ) {
            g_s_suc_player.setBuffer( audioBuffer );
            g_scene.add(g_s_suc_player);
        },
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );
}

function load_frog()
{
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var texture1 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/frog.png');
    var material1 = new THREE.MeshBasicMaterial({map: texture1});
    material1.transparent = true;

    var object = new THREE.Mesh(new THREE.BoxGeometry(G_C_frog_size, G_C_frog_size, G_C_frog_size),material1);
    object.position.x = 0;
    object.position.z = G_C_frog_size/2 ;
    object.position.y = -G_C_playfield_height/2  + G_C_frog_size/2 + G_C_single_offset;

    g_o_frog = object;
    g_scene.add(g_o_frog);

    g_a_frog_action = new FrogAction(object.position.clone(),new THREE.Vector3(0,0,0),G_C_game_frog_speed);
    g_a_frog_action.setsteps(G_C_game_frog_steps_permove);
    g_a_frog_action.calcstep();

    g_scene.updateMatrixWorld();
}


function load_car_model()
{
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var loader = new THREE.OBJLoader( g_load_mgr );
    loader.load(
        G_C_HTTP_PREFIX+'objs/car.obj',
        function ( object )
        {
            create_cars(object);
        });
}

function initial_obj_containor()
{
    g_a_objs = [];
    for(var vi = 0; vi < Math.floor(G_C_playfield_height/G_C_singleway_height); vi++)
    {
        g_a_objs[vi] = [];
    }
}

function resetgame()
{
    g_a_frog_status = new FrogStatus(G_C_game_frog_times);
    g_a_PFS_mgr = new FPSMgr(G_C_game_frame_elapse);
    g_a_Jump_mgr = new JumpMgr();
    g_a_score_mgr = new ScoreMgr(G_C_game_score_step,G_C_game_score_factor);


    initial_obj_containor();
    load_objs();
    resetfrogpos();
    resetfrogsize();
    g_a_frog_status.setSuc(false);
    g_o_river.updateMatrixWorld();
    g_scene.updateMatrixWorld();
    updatescoreinfo();
    animate();
}

function resetfrogpos()
{
    g_o_frog.position.x = 0;
    g_o_frog.position.z = G_C_frog_size/2 ;
    g_o_frog.position.y = -G_C_playfield_height/2  + G_C_frog_size/2 + G_C_single_offset;
}

function restartgame()
{
    if(null !== g_a_frog_status)
    {
        if(g_a_frog_status.timesleft() > 0 )
        {
            g_a_Jump_mgr.stopjump();
            resetfrogsize();
            resetfrogpos();

            for(var i = 0 ; i < g_i_cars.length; i++)
            {
                g_i_cars[i].running = true;
            }

            g_a_frog_status.recover();
            g_a_frog_status.setSuc(false);
        }
    }
}

function loadFont()
{
    var loader = new THREE.FontLoader();
    var loader = new THREE.FontLoader();

    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    loader.load( G_C_HTTP_PREFIX+'fonts/optimer_bold.typeface.json', function ( font )
    {
        g_o_font = font;
        g_o_score =  new THREE.TextGeometry("", {size: 10,
            height: 8,
            curveSegments: 4,
            font: g_o_font});

        var vp = getplayfiedpartpos(0.92,1.0);
        var vm = new THREE.MeshBasicMaterial( {color: 0x000000} );
        g_m_score = new THREE.Mesh(g_o_score, vm );
        g_m_score.position.x = 40 ;
        g_m_score.position.y = vp.b;
        g_m_score.position.z = G_C_3D_OBJ_Z + 1;

        g_m_score.rotation.x = 0;
        g_m_score.rotation.y = Math.PI * 2;

        g_o_grass.add( g_m_score );

        updatescoreinfo();

        g_o_grass.updateMatrixWorld();
        g_scene.updateMatrixWorld();
    } );
}


function updatescoreinfo()
{
    if(null !== g_o_score)
    {
        var vtxt = "Times left:" + g_a_frog_status.timesleft() + " ";
        vtxt += "  score: ";
        vtxt += g_a_score_mgr.getscore();
        vtxt += "  level: ";
        vtxt += g_a_score_mgr.getlevel();
        g_o_score =  new THREE.TextGeometry(vtxt, {size: 10,
            height: 7,
            curveSegments: 12,
            font: g_o_font});
        g_m_score.geometry = g_o_score;

    }
}

function create_cars(obj)
{
    g_i_cars = [];
    g_o_cars = [];
    g_o_road.children = [];

    var vmaterial = [];
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var texture1 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/car1.png');
    vmaterial.push(new THREE.MeshBasicMaterial({map: texture1}));
    vmaterial[0].transparent = true;

    var texture2 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/car2.png');
    vmaterial.push(new THREE.MeshBasicMaterial({map: texture2}));
    vmaterial[1].transparent = true;

    var texture3 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/car3.png');
    vmaterial.push(new THREE.MeshBasicMaterial({map: texture3}));
    vmaterial[2].transparent = true;

    var voriginpos = g_o_road.position;
    var vstartpos = 1;
    var vi = 0;
    for(vi = 0 ; vi < Math.floor(G_C_road_height/G_C_singleway_height) ; vi++)
    {
        for(var vj = 0 ; vj < G_C_playfield_length; vj += G_C_gap_between_cars)
        {
            var vcarlen = G_C_car_size*getrandomnumber(1,2);
            var object = new THREE.Mesh(new THREE.BoxGeometry(G_C_car_size, G_C_car_size, G_C_car_size),vmaterial[getrandomnumber(0,2)].clone());

            vj += (vcarlen);

            object.position.x = G_C_playfield_length/2 - vj;
            object.position.z = G_C_car_size/2;
            object.position.y = -G_C_road_height/2 + vi*G_C_singleway_height + G_C_singleway_height/2;
            object.userData = {type:G_C_obj_type_car,id:g_o_cars.length,xlen:G_C_car_size,ylen:G_C_car_size};

            object.matrixWorldNeedsUpdate = true;
            object.updateMatrixWorld();

            var cinfo = new CarInfo(0xff0000, G_C_game_car_speed, g_o_cars.length - 1);
            g_i_cars.push(cinfo);
            g_o_cars.push(object);

            g_o_road.add(object);

            g_a_objs[vi + vstartpos].push(object);

            vj += getrandomnumber(0,G_C_gap_between_cars);
        }
    }
    g_o_road.updateMatrixWorld();
    g_scene.updateMatrixWorld();
}

function load_logs()
{
    g_i_logs = [];
    g_o_logs = [];
    g_o_river.children = [];

    var vstartpos = 6;
    for(var vi = 0 ; vi < Math.floor(G_C_river_height/G_C_singleway_height) ; vi++)
    {
        for(var vj = 0 ; vj < G_C_playfield_length; vj += G_C_gap_between_logs)
        {
            var vlen = getrandomnumber(G_C_log_length_min,G_C_log_length_max);

            var vcl = new  THREE.CylinderGeometry(G_C_log_size,G_C_log_size,vlen);
            vcl.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
            var object = new THREE.Mesh( vcl, g_m_log.clone());

            vj += (vlen);

            object.position.z = G_C_log_size/2;
            object.position.y = -G_C_river_height/2 + vi*G_C_singleway_height + G_C_singleway_height/2 ;
            object.position.x = G_C_playfield_length/2 - vj ;
            object.userData = {type:G_C_obj_type_log,id:g_o_logs.length,xlen:vlen,ylen:G_C_log_size};

            object.matrixWorldNeedsUpdate = true;
            object.updateMatrixWorld();

            var info = new LogInfo(0xff0000,G_C_game_log_speed,g_o_logs.length-1);

            g_i_logs.push(info);
            g_o_logs.push(object);
            g_o_river.add(object);

            g_a_objs[vi + vstartpos].push(object);

            vj += G_C_gap_between_logs;
        }
    }
}

//by the side
function load_creature()
{
    var vmaterial = [];
    THREE.ImageUtils.crossOrigin = "anonymous";  // or
    var texture1 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/c1.png');
    vmaterial.push(new THREE.MeshBasicMaterial({map: texture1}));
    vmaterial[0].transparent = true;

    var texture2 = THREE.ImageUtils.loadTexture(G_C_HTTP_PREFIX+'images/c2.png');
    vmaterial.push(new THREE.MeshBasicMaterial({map: texture2}));
    vmaterial[1].transparent = true;

    var vj = 0;
    for(var vi = 0 ; vi < 2 ;vi++)
    {
        var object = new THREE.Mesh(new THREE.BoxGeometry(G_C_creature_size, G_C_creature_size, G_C_creature_size),vmaterial[getrandomnumber(0,1)].clone());

        vj += getrandomnumber(50,100);

        object.position.z = G_C_log_size/2;
        object.position.y = -G_C_river_height/2 + G_C_singleway_height  ;
        object.position.x = G_C_playfield_length/2 - vj ;
        object.userData = {type:G_C_obj_type_creature,id:vi,xlen:G_C_creature_size,G_C_creature_size:G_C_creature_size};

        object.matrixWorldNeedsUpdate = true;
        object.updateMatrixWorld();

        g_o_river.add(object);
        g_o_creature[vi] = object;
    }
}



//////////////////////////////////////////
////////timer section

function starttimer()
{
    g_u_timer = setTimeout(ontimer, G_C_timer_clapse);
}

function killtimer()
{
    if(null !== g_u_timer)
    {
        clearTimeout(g_u_timer);
    }
}

function ontimer()
{
    g_u_timer = setTimeout(ontimer, G_C_timer_clapse);
}

//////////////////
///key event section

function onKeyDown(kevent)
{
    var key = kevent.key;
    console.log(key + " down");
    var vmove = new THREE.Vector3(0,0,0);
    var bmove = false;
    switch(key)
    {
        case 'ArrowLeft': { vmove.x -= G_C_game_frog_move_step_x;bmove = true;};
            break;
        case 'ArrowRight': { vmove.x += G_C_game_frog_move_step_x;bmove = true;};
            break;
        case 'ArrowDown':{vmove.y -= G_C_game_frog_move_step_y;bmove = true;}
            break;
        case 'ArrowUp':{vmove.y += G_C_game_frog_move_step_y;bmove = true;}
            break;
        case 'c':{restartgame();}
            break;
        case 'r': {resetgame();}
        default:break;
    }
    if(bmove)
    {
        playsounds(G_C_sounds_hop);
        g_a_frog_action.setfromanddistance(g_o_frog.position,vmove);
        g_a_frog_action.calcstep();
    }
}


////operate objs section
function playsounds(stype)
{
    if(G_C_game_play_sounds <= 0)
    {
        return;
    }
    switch(stype)
    {
        case G_C_sounds_hop:
            if(null !== g_s_hop_player)
            {
                g_s_hop_player.play();
            }
            break;
        case G_C_sounds_squash:
            if(null !== g_s_squash_player)
            {
                g_s_squash_player.play();
            }
            break;
        case G_C_sounds_plunk:
            if(null !== g_s_plunk_player)
            {
                g_s_plunk_player.play();
            }
            break;
        case G_C_sounds_suc:
            if(null !== g_s_suc_player)
            {
                g_s_suc_player.play();
            }
            break;
        default:
            break;

    }
}

function moveobjs() {
    var vsize = g_o_cars.length;
    while(vsize > 0)
    {
        vsize--;
        var obj = g_o_cars[vsize];
        if(g_i_cars[vsize].running)
        {
            obj.position.x -= g_i_cars[vsize].s * g_a_score_mgr.getspeedfactor();
            if(obj.position.x <= -G_C_playfield_length/2)
            {
                obj.position.x =  G_C_playfield_length/2;
            }
        }

    }

    vsize = g_o_logs.length;
    while(vsize > 0)
    {
        vsize--;
        var obj = g_o_logs[vsize];
        if(g_i_logs[vsize].running)
        {
            obj.position.x -= g_i_logs[vsize].s * g_a_score_mgr.getspeedfactor();
            if(obj.position.x <= -G_C_playfield_length/2)
            {
                obj.position.x =  G_C_playfield_length/2;
            }
        }
    }

    vsize = g_o_creature.length;
    while(vsize > 0)
    {
        vsize--;
        var obj = g_o_creature[vsize];

        obj.position.x +=  2*g_a_score_mgr.getspeedfactor();
        if(obj.position.x > G_C_playfield_length/2)
        {
            obj.position.x =  -G_C_playfield_length/2;
        }
    }
}


function movefrog()
{
    if(g_a_frog_status.isSuc())
    {
        frogsucanimation();
        return ;
    }
    if((null !== g_a_frog_action) && (!g_a_frog_action.done))
    {
        g_o_frog.position = g_a_frog_action.getpos();
        if(g_o_frog.position.x < -G_C_playfield_length/2)
        {
            g_o_frog.position.x += G_C_playfield_length;
        }
        if(g_o_frog.position.x > G_C_playfield_length/2)
        {
            g_o_frog.position.x -= G_C_playfield_length;
        }
        if(g_o_frog.position.y < -G_C_playfield_height/2)
        {
            g_o_frog.position.y += (G_C_playfield_height );
        }
        if(g_o_frog.position.y > (G_C_playfield_height/2 ))
        {
            g_o_frog.position.y -= (G_C_playfield_height );
        }
    }
}


function collisiondetect()
{
    if(null === g_o_frog)
    {
        return ;
    }
    if(false === g_o_frog.visible)
    {
        return ;
    }
    var vfrojpos = g_o_frog.position.clone();
    var vup = new THREE.Vector3(0,1,0);
    var vdown = new THREE.Vector3(0,-1,0);
    var vright = new THREE.Vector3(1,0,0);
    var vleft = new THREE.Vector3(-1,0,0);
    var vzneg = new THREE.Vector3(0,0,-1);


    var vobjspos = getplayfiledrelatepos(vfrojpos);
    if(vobjspos.pos < 0)
    {
        return ;
    }
    var vdetectobjs = g_a_objs[vobjspos.pos];

    var vhit = false;
    var vobjnum = vdetectobjs.length;
    while(vobjnum > 0 && (!vhit))
    {
        vobjnum--;
        var vdirection = vdetectobjs[vobjnum].position.clone();
        vdirection.setFromMatrixPosition(vdetectobjs[vobjnum].matrixWorld);

        vdirection.sub(vfrojpos);
        vdirection.normalize();

        vhit = collisiondetectbydirection(g_r_ray,vfrojpos,vdirection,vdetectobjs);
    }
    if(!vhit)
    {
        if(vobjspos.type == G_C_obj_type_log)
        {
            jumptintotheriver();
        }
    }

}

function jumptintotheriver()
{
    playsounds(G_C_sounds_squash);
    g_a_frog_status.loseonechance();

}

function collisiondetectbydirection(r,pos,d,objs)
{

    for(var i = 0 ; i < objs.length ; i++)
    {
        var vobjpos = objs[i].position.clone();
        vobjpos.setFromMatrixPosition(objs[i].matrixWorld);

        var vx = Math.abs(vobjpos.x - pos.x);
        var vy = Math.abs(vobjpos.y - pos.y);
        if((vx < (objs[i].userData.xlen/2 + G_C_frog_size/2) && (vy < (objs[i].userData.ylen/2 + G_C_frog_size)/2)))
        {
            hitonaobj(objs[i]);
            return true;
        }
    }
    return false;
}

function hitonaobj(obj)
{
    if(obj.userData.type === G_C_obj_type_car)
    {
        playsounds(G_C_sounds_plunk);
        g_i_cars[obj.userData.id].running = false;
        g_a_frog_status.loseonechance();
    }
    else
    {
        movewithlog(obj.userData.id);

    }
}


function movewithlog(ilog)
{
    g_o_frog.position.x -= g_i_logs[ilog].s * g_a_score_mgr.getspeedfactor();
}

function frogfaliedanimation()
{
    if(null !== g_o_frog)
    {
        G_c_frog_scale += G_c_frog_scale_step;
        if(G_c_frog_scale > 2.0)
        {
            G_c_frog_scale = 0.5;
        }
        g_o_frog.scale.setScalar(G_c_frog_scale);
    }
}

function frogsucanimation()
{
    if(null !== g_o_frog)
    {
        var vt = g_a_Jump_mgr.getnextpos();
        if(vt%4 !== 0)
        {
            g_o_frog.position.y += 3;
        }
        else
        {
            g_o_frog.position.y -=  9;
        }
    }
}

function resetfrogsize()
{
    if(null !== g_o_frog)
    {
        g_o_frog.scale.set(1,1,1);
    }
}

function checkgame()
{
    if(g_a_frog_status === null)
    {
        return true;
    }

    return g_a_frog_status.isAlive();
}

function animate()
{
    requestAnimationFrame( animate );

    if(null !== g_a_PFS_mgr)
    {
        if(!g_a_PFS_mgr.shouldRedraw())
        {
            return;
        }
    }
    if(checkgame())
    {
        moveobjs();
        movefrog();
        collisiondetect();
    }
    else
    {
        if(!g_a_frog_status.isAlive())
        {
            frogfaliedanimation();
            updatescoreinfo();
        }
    }

    if(isSuc() && (!g_a_frog_status.isSuc()))
    {
        g_a_frog_status.setSuc(true);
        g_a_score_mgr.add();
        g_a_Jump_mgr.startjump(g_o_frog.position.clone());
        playsounds(G_C_sounds_suc);

        updatescoreinfo();
    }

    render();
}


///////////////////////////////////////
///render section
function render()
{
    try
    {
        var vpos = g_scene.position.clone();
        g_global_camera.lookAt(vpos);
        g_render.render( g_scene, g_global_camera );
    }
    catch(e)
    {
        console.log(e);
    }

}