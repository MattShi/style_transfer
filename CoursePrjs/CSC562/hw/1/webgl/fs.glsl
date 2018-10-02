precision mediump float;

varying vec3 vPosition;
uniform vec3 cameraPosition;
uniform int reflections;  // max = 10
uniform bool shadows;

uniform int spherenumber;  // max = 32
uniform vec3 sphereCenters[32];//center + radius
uniform float sphererad[32];
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

bool gettrianglepnt(int idx,out vec3 a)
{
   for(int i = 0; i < 96; i++)
   {
       if((i == idx) && (i < trianglesnumber*3))
       {
           a = trianglespnts[i];
           return true;
       }
   }
   return false;
}

bool getspherem(int idx,out vec3 amb, out vec3 dif,out vec3 spec)
 {
     for(int i = 0; i < 32; i++)
     {
         if((i == idx) && (i < spherenumber))
         {
             amb = sphamb[i];
             dif = sphdiff[i];
             spec = sphspec[i];
             return true;
         }
     }
     return false;
 }

bool gettrianglem(int idx,out vec3 amb, out vec3 dif,out vec3 spec)
{
   for(int i = 0; i < 32; i++)
   {
       if((i == idx) && (i < trianglesnumber))
       {
           amb = triamb[i];
           dif = tridiff[i];
           spec = trispec[i];
           return true;
       }
   }
   return false;
}

bool getlightingm(int idx,out vec3 amb, out vec3 dif,out vec3 spec)
{
   for(int i = 0; i < 32; i++)
   {
       if((i == idx) && (i < lgtsnumber))
       {
           amb = lgtamb[i];
           dif = lgtdiff[i];
           spec = lgtspec[i];
           return true;
       }
   }
   return false;
}

bool getlightpos(int idx,out vec3 lightpos)
{
    for(int i = 0; i < 32; i++)
    {
        if((i == idx) && (i < lgtsnumber))
        {
            lightpos = lgtpos[i];
            return true;
        }
    }
    return false;
}

/**
 * Check for an intersection with a sphere
 */
 /*
  var oc = minus(r.start(),this.center);
             var a = r.direction().suard_length();
             var b = 2*dot(r.direction(),oc);
             var c = oc.suard_length() - this.radius*this.radius;
             var k = b*b - 4*a*c;
 */
bool intersectSphere(vec3 sphereCenter, float spherer,vec3 rayStart, vec3 rayDirection, out float distance)
{
  vec3 rayToSphere = sphereCenter - rayStart;
  float b = dot(rayDirection, rayToSphere);
  //float d = b*b - dot(rayToSphere, rayToSphere) + 1.0;
  float d = b*b - dot(rayToSphere, rayToSphere) + spherer*spherer;

  if (d < 0.0)
  {
    distance = 10000.0;
    return false;
  }

  distance = b - sqrt(d);
  if (distance < 0.0)
  {
    distance = 10000.0;
    return false;
  }

  return true;
}

/**
 * Does the ray intersect a sphere, if so, output the sphere's index and distance from the ray start
 */
bool intersectSpheres(vec3 rayStart, vec3 rayDirection, out int sphereIndex, out float distance, out vec3 intersectPosition, out vec3 normal)
{
  float minDistance = -1.0, thisDistance = 0.0;
  for (int i = 0; i < 32; i++)
  {
    if (i < spherenumber)
    {
      if (intersectSphere(sphereCenters[i],sphererad[i],rayStart, rayDirection, thisDistance))
      {
        if (minDistance < 0.0 || thisDistance < minDistance)
        {
          minDistance = thisDistance;
          sphereIndex = i;
          intersectPosition = rayStart + minDistance * rayDirection;
          normal = intersectPosition - sphereCenters[i];
        }
      }
    }
  }

  if (minDistance <= 0.0)
  {
    sphereIndex = -1;
    distance = 10000.0;
    return false;
  }
  else
  {
    distance = minDistance;
    return true;
  }
}

bool intersectSpheresSimple(vec3 rayStart, vec3 rayDirection)
{
  float minDistance = -1.0, thisDistance = 0.0;
  for (int i = 0; i < 32; i++)
  {
    if (i < spherenumber)
    {
      if (intersectSphere(sphereCenters[i],sphererad[i], rayStart, rayDirection, thisDistance))
      {
        if (minDistance < 0.0 || thisDistance < minDistance)
        {
          minDistance = thisDistance;
        }
      }
    }
  }
  return (minDistance >= 0.0);
}

bool intersectSingleTriangle(vec3 rayStart, vec3 rayDirection,int nidx,out float distance)
{
    vec3 a,b,c;
    if(!gettrianglepnt(nidx,a))
    {
       return false;
    }
    if(!gettrianglepnt(nidx+1,a))
    {
       return false;
    }
    if(!gettrianglepnt(nidx+2,a))
    {
       return false;
    }
    vec3 veg1 = b - a;  //0 a 1 b 2 c
    vec3 veg2 = c - a;
    vec3 vt = rayStart - a;
    vec3 vp = cross(rayDirection,veg2);
    vec3 vq = cross(vt,veg1);
    float vpe1 = dot(vp,veg1);
    float vu = dot(vp,vt)/vpe1;
    float vv = dot(vq,rayDirection)/vpe1;

    if((vu > 0.0) && (vv > 0.0) && ((vu + vv) < 1.0))
    {
       distance = dot(vq ,veg2)/vpe1;
       return true;
    }
    else
    {
       return false;
    }
}

bool intersectTrianglesSimple(vec3 rayStart, vec3 rayDirection)
{
    float closestDis = -1.0;
    float hitDis = 0.0;
    for (int i = 0; i < 32; i++)
    {
      if (i < trianglesnumber)
      {
        if (intersectSingleTriangle(rayStart, rayDirection,i, hitDis))
        {
          if (closestDis < 0.0 || hitDis < closestDis)
          {
            closestDis = hitDis;
          }
        }
      }
    }
    return (closestDis >= 0.0);
}


bool isVisibleFromObjsToLights(vec3 rayStart,int nLight)
{
   bool bVisible = true;
   vec3 lightpos ;
   if(!getlightpos(nLight,lightpos))
   {
      return bVisible;
   }
   vec3 rayDirection = lightpos - rayStart;
   bVisible = !intersectSpheresSimple(rayStart,rayDirection);
   if(!bVisible)
   {
      return bVisible;
   }
   bVisible = !intersectTrianglesSimple(rayStart,rayDirection);
   return bVisible;
}

bool intersectTriangles(vec3 rayStart, vec3 rayDirection,out int idx,out vec3 normal,out vec3 intersectpnt)
{
    float closestDis = -1.0, hitDis = 0.0;
    for (int i = 0; i < 32; i++)
    {
      if (i < trianglesnumber)
      {
        if (intersectSingleTriangle(rayStart, rayDirection,i, hitDis))
        {
          if (closestDis < 0.0 || hitDis < closestDis)
          {
            closestDis = hitDis;
            idx = i;
            intersectpnt = rayStart + closestDis*rayDirection;
          }
        }
      }
    }
    return (closestDis >= 0.0);
}

vec3 calcolorbyBhong(int nlight, vec3 N, vec3 viewer,int nobjtype, int nobjIdx,vec3 pos)
{
     vec3 pxamb ,pxdiff,pxspec,lamb,ldiff,lspec,lpos;
     bool bsuc = false;
     if(nobjtype == 0)
     {
        bsuc = getspherem(nobjIdx,pxamb,pxdiff,pxspec);
     }
     else
     {
        bsuc = gettrianglem(nobjIdx,pxamb,pxdiff,pxspec);
     }
     bsuc = getlightingm(nlight,lamb,ldiff,lspec);
     bsuc = getlightpos(nlight,lpos);
     if(!bsuc)
     {
        return vec3(0.0,0.0,0.0);
     }


     vec3 L = pos-lpos;
     vec3 R = 2.0*dot(L,N)*N - L;
     vec3 V = normalize(viewer - pos);
     vec3 ambient = lamb*pxamb;
     vec3 diffuse  = ldiff*pxdiff*clamp(dot(L,N), 0.0, 1.0);
     vec3 specular = lspec*pxspec*pow(clamp(dot(R, V), 0.0, 1.0), 2.0);
     return clamp(ambient + diffuse + specular,0.0,1.0);
}

/**
 * Calculate the intensity of light at a certain angle - 0.0 means none, 1.0 means true colour, >1.0 for gloss/shine
 */
vec3 lightAt(vec3 position, vec3 normal, vec3 viewer, int nobjtype, int nobjIdx)
{
  vec3 light;
  float intensity = 0.0;
  vec3 color = vec3(0.0,0.0,0.0);
  vec3 reflection = vec3(0.0,0.0,0.0);

  for (int i = 0; i < 32; i++)
  {
    if(i < lgtsnumber)
    {
        light = lgtpos[i];
        if (!shadows || !isVisibleFromObjsToLights(position, i))
        {
           color += calcolorbyBhong(i,normal,viewer,nobjtype,nobjIdx,position);
        }
    }
  }

  return clamp(color,0.0,1.0);
}

/**
 * Check if our ray intersects with an object/floor
 */
bool intersectWorld(vec3 rayStart, vec3 rayDirection, out vec3 intersectPosition, out vec3 normal, out int ihitdx,out int ihittype)
{
  int idx = -1;
  float distance = -1.0;
  if (intersectSpheres(rayStart, rayDirection, idx, distance, intersectPosition, normal))
  {
     ihitdx = idx;
     ihittype = 0; //sphere
  }
  else if (intersectTriangles(rayStart, rayDirection, idx, normal,intersectPosition))
  {
     ihitdx = idx;
     ihittype = 1;//triangle
  }
  else
  {
    return false;
  }

  return true;
}

void main(void)
{
  vec3 cameraDirection = normalize(vPosition - cameraPosition);
  // start pos, normal, end pos
  vec3 position1, normal, position2;
  vec3 color, reflectedColor, colorMax;
  int nhitobj = -1;
  int nhittype = -1;

  if (intersectWorld(cameraPosition, cameraDirection, position1, normal, nhitobj, nhittype))
  {
    color = lightAt(position1, normal, -cameraDirection, nhitobj, nhittype);
    colorMax = (reflectedColor + vec3(0.7)) / 1.7;
    cameraDirection = reflect(cameraDirection, normal);

    // since integer modulo isn't available
    bool even = true;
    for (int i=0; i < 10; i++)
    {
      // since loops *have* to be unrolled due to no branches
      if (i < int(reflections))
      {
        if (even)
        {
          even = false;
          if (intersectWorld(position1, cameraDirection, position2, normal, nhitobj, nhittype))
          {
            color += lightAt(position1, normal, -cameraDirection, nhitobj, nhittype) * colorMax;
            colorMax *= (reflectedColor + vec3(0.7)) / 1.7;
            cameraDirection = reflect(cameraDirection, normal);
          }
          else
          {
            break;
          }
        }
        else
        {
          even = true;
          if (intersectWorld(position2, cameraDirection, position1, normal, nhitobj, nhittype))
          {
            color += lightAt(position2, normal, -cameraDirection, nhitobj, nhittype) * colorMax;
            colorMax *= (reflectedColor + vec3(0.7)) / 1.7;
            cameraDirection = reflect(cameraDirection, normal);
          }
          else
          {
            break;
          }
        }
      }
      else
      {
        break;
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
  else
  {
    gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
  }
  gl_FragColor = vec4(1,0,0,1.0);
}