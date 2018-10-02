
 attribute vec3 vtPos;
 attribute vec3 vtNormal;
 uniform vec3 vEyePos;
 varying vec3 vNormal;
 varying vec3 vPosition;
 varying vec3 vEyeD;
 void main(void)
 {
    vec4 vworldp = vec4(vtPos,1.0);
    vPosition   = vworldp.xyz;
    vNormal     = vec4(vtNormal,0.0).xyz;
    gl_Position = vec4(vtPos, 1.0);
    vEyeD = vEyePos - vPosition;
 }