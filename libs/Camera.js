/////////////////////////////////////////////////////////////////////////////////////////////
//
// SameType ersetzt durch instanceof 
//
/////////////////////////////////////////////////////////////////////////////////////////////



const	pi2 =  3.141592654 /  2;
Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

function degrees(rad) {
    return rad / (Math.PI / 180);
  }
function radians(degrees)
{
 
  return degrees * (Math.PI/180);
}



const MaxVerticalAngle  = 85;
 
class Movement {
    
    constructor(pos = new Vector3(0,0,0),lookat= Vector3(0,0,0) )
    {


        if (pos instanceof Vector3 && lookat instanceof Vector3) 
        {
            this._position            = new Vector3(pos);
            this._horizontalAngle     = 0.0;
            this._verticalAngle       = 0.0;
            this.LookAt(lookat);
            return;
        }

        if (pos instanceof Movement) 
        {
          this._position            = pos.position;
          this._horizontalAngle     = pos.horizontalAngle;
          this._verticalAngle       = pos.verticalAngle;
        return;
        }
        this._position            = new Vector3(1,1,1);
        this._horizontalAngle     = 0.0;
        this._verticalAngle       = 0.0;
        this.LookAt(new Vector3(0,0,0));

    
    }

    Set(pos = new Vector3(0,0,0),lookat= Vector3(0,0,0) ) {


        if (pos instanceof Vector3 && lookat instanceof Vector3) 
        {
        this._position            = new Vector3(pos);
        this._horizontalAngle     = 0.0;
        this._verticalAngle       = 0.0;
        this.LookAt(lookat);
        return;
        }

        if (pos instanceof Movement) 
        {
          this._position            = pos.position;
          this._horizontalAngle     = pos.horizontalAngle;
          this._verticalAngle       = pos.verticalAngle;
        return;
        }

    }

    get horizontalAngle() 
     {return this._horizontalAngle;} 
    get verticalAngle()   {return this._verticalAngle;} 

    get position()
    {
      return this._position;
    }

    set position(a)
    {
      this._position= new Vector3(a);
    }
    
    NormalizeAngles()
    {
        this._horizontalAngle = Math.fmod(this._horizontalAngle, 360)
      if (this._horizontalAngle < 0)  this._horizontalAngle = this._horizontalAngle + 360
      if (this._verticalAngle > MaxVerticalAngle) this._verticalAngle = MaxVerticalAngle
      if( this._verticalAngle < -MaxVerticalAngle) this._verticalAngle = -MaxVerticalAngle;
    } 
 
    set offsetPosition(offset)
    {
      this._position = this._position.add(offset);
    }
 
    offsetOrientation(upAngle, rightAngle)
    {
        this._horizontalAngle = this._horizontalAngle + radians(rightAngle)
        this.NormalizeAngles();
        this._verticalAngle   = this._verticalAngle + radians(upAngle)
        this.NormalizeAngles();
        
    }

    LookAt(position)
    {
      var direction=position.sub(this._position);
      direction.normalize;
      this._verticalAngle = radians(Math.asin(-direction.y));
      this._horizontalAngle = -radians(Math.atan2(-direction.x, -direction.z));
      
      this.NormalizeAngles();
    
    }

        
    forward()
    {
        var o=this.orientation();
        var v=o.concat(new Vector4(0,0,-1,1));
        return new Vector3(v.x,v.y,v.z);  
    }

    right()
    {
        var o=this.orientation();
        var v=o.concat(new Vector4(1,0,0,1));
        return new Vector3(v.x,v.y,v.z);  

    }

    up()
    {
        var o=this.orientation();
        var v=o.concat(new Vector4(0,1,0,1));
        return new Vector3(v.x,v.y,v.z);  

    }
   

   Move(x=0,y=0,z=0) {
    if (x!=0)this.offsetPosition=this.right().mul(x);
    if (y!=0)this.offsetPosition=this.forward().mul(y);
    if (z!=0)this.offsetPosition=this.up().mul(z);
   }
   
   Turn(speed1,speed2) 
   {
    
    this.offsetOrientation(speed1, speed2);
   }

}



class Camera extends Movement {
    constructor(fov=0,aspect=0,near=0,far=0) 
    {
        super(new Vector3(0,0,0),new Vector3(0,0,0));
        this._fieldOfView         = fov;
        this._nearPlane           = near;
        this._farPlane            = far;
        this._viewportAspectRatio = aspect;


    }
    
 
    get near()  {return this._nearPlane;}
    get far()   {return this._farPlane;} 
    get fov()   {return this._fieldOfView;} 
    get aspect(){return this._viewportAspectRatio;}

    set near(a)  {this._nearPlane=a;}
    set far(a)   {this._farPlane=a;} 
    set fov(a)   {this._fieldOfView=a;} 
    set aspect(a){this._viewportAspectRatio=a;}
     

    GetCombinedMatrix() {
        return cam.View().concat(cam.GetPerspectiveMatrix());
    }

    GetPerspectiveMatrix(blinn=true)
    {
       
       if (blinn) return Matrix4x4.projectPerspectiveBlinn(this.fov, this.aspect, this.near, this.far);
        return erspectiveXform = Matrix4x4.projectPerspectiveD3D(this.fov, this.aspect, this.near, this.far);
    }

    GetAxis() 
    {
      var v=forward();  
      var absNormal= new Vector3(Math.abs(v.x),Math.abs(v.y),Math.abs(v.y));
      if (absNormal.x >= absNormal.y && absNormal.x >= absNormal.z) return 0; 
      if (absNormal.y >= absNormal.x && absNormal.y >= absNormal.z) return 1;
      return 2;    
    }


    orientation()
    {
       return Matrix4x4. xyzRotation(radians(this._verticalAngle), radians(this._horizontalAngle), 0);
    }
 

    View() 
    {
       var v = new Vector4(-this.position.x,-this.position.y,-this.position.z,1);
       var trans = Matrix4x4.translation(v);       
       return trans.concat(this.orientation());        
    }


}