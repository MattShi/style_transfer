/**
 * Created by fangyuan shi on 4/27/2017.
 */
var g_canvasctor = [];

function setupmulticanvas()
{
    //initial

    g_canvasctor[0] = new HdrCanvas("myWebGLCanvas1");
    g_canvasctor[1] = new HdrCanvas("myWebGLCanvas2");
    g_canvasctor[2] = new HdrCanvas("myWebGLCanvas3");
    //g_canvasctor[3] = new HdrCanvas("myWebGLCanvas4");

    //main
    g_canvasctor[0].main();
    g_canvasctor[0].gotoNT();
    //none
    g_canvasctor[1].main();
    g_canvasctor[1].gotoRT();

    g_canvasctor[2].main();
    g_canvasctor[2].gotoUT();
    //g_canvasctor[3].main();
    updateui(1.5);
}

function setexposure()
{
    var x = document.getElementById("expo");
    var currentVal = x.value;
    g_canvasctor[0].setexpo(currentVal);
    g_canvasctor[1].setexpo(currentVal);
    g_canvasctor[2].setexpo(currentVal);

    updateui(currentVal);
}

function updateui(x)
{
    document.getElementById("expval").value = x;
}