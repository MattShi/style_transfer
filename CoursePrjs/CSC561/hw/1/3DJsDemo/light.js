/**
 * Created by stone on 12/09/2016.
 */

///<reference path="vector3.js" />
///<reference path="color.js" />

class Light
{
    constructor(location,color,amb,diffuse,spec)
    {
        try
        {
            this.amb = amb ;
            this.diffuse = diffuse;
            this.spec = spec;
            this.color = color;
            this.location = location;
        }
        catch(e) {
            console.log(e);
        }
    }
}