
//https://gamedev.stackexchange.com/questions/19774/determine-corners-of-a-specific-plane-in-the-frustum
//http://www.lighthouse3d.com/tutorials/view-frustum-culling/

const TOP_PLANE     =1<<1;
const BOTTOM_PLANE  =1<<2;
const LEFT_PLANE    =1<<3;
const RIGHT_PLANE   =1<<4;
const FRONT_PLANE   =1<<5;
const BACK_PLANE    =1<<6;
const ALL_PLANES    =TOP_PLANE | BOTTOM_PLANE | LEFT_PLANE | RIGHT_PLANE | FRONT_PLANE | BACK_PLANE

class Frustum {
    constructor(cam=undefined) {
        this._frustum =new Array();

        this._Cnear = new Vector3();
        this._Cfar =  new Vector3();
        this._Near_Top_Left     = new Vector3();
        this._Near_Top_Right    = new Vector3();
        this._Near_Bottom_Left  = new Vector3();
        this._Near_Bottom_Right = new Vector3();
        this._Far_Top_Left      = new Vector3();
        this._Far_Top_Right     = new Vector3();
        this._Far_Bottom_Left   = new Vector3();
        this._Far_Bottom_Right  = new Vector3();
    
        if (cam instanceof Frustum)
        {
            createByCam(cam);
            return;
        }
    }



intersectsAABB(aabb) {
    // Für jede Ebene des Frustums
    
    for (let plane of this._frustum) {
    
        // pVertex = „am weitesten in Richtung der Normal“
        let px = (plane.normal.x >= 0) ? aabb.max.x : aabb.min.x;
        let py = (plane.normal.y >= 0) ? aabb.max.y : aabb.min.y;
        let pz = (plane.normal.z >= 0) ? aabb.max.z : aabb.min.z;

        let distance = plane.normal.x * px +
                       plane.normal.y * py +
                       plane.normal.z * pz + plane.D;
            

        if (distance < 0) {
            // AABB liegt komplett außerhalb dieser Ebene
            return false;
        }
    }

    // AABB liegt teilweise oder vollständig innerhalb des Frustums
    return true;
};


    get NumPlanes() {return this._frustum.length;}

   

      

   createByCam(cam,test=false) {

   



    var P=cam.position;
    var v=cam.forward();
    var up=cam.up();
    var w=new Vector3(cam.right());
    var nDis=cam.near;
    var fDis=cam.far;
    var fov=cam.fov;
    var ar=cam.aspect 
    //var w=v.dot(up);
    this._frustum =new Array();
    v=v.mul(-1);
    //First we will get the width and height of the near plane

    var Hnear = 2 * Math.tan(fov / 2) * nDis;
    var Wnear = Hnear * ar;
    //Then we do the same for the far plane
    
    var Hfar = 2 * Math.tan(fov / 2) * fDis;
    var Wfar = Hfar * ar;
    
    
    this._Cnear = P.add(v.mul(nDis));
    this._Cfar = P.add( v.mul(fDis));
    var wnear= w.mul(Wnear / 2);  
    var wfar=  w.mul(Wfar / 2)  

    var upnear = new Vector3(up.mul(Hnear / 2));
    var ufar = new Vector3(up.mul(Hfar / 2));
    
    this._Near_Top_Left     = this._Cnear.add( upnear.sub(wnear));
    this._Near_Top_Right    = this._Cnear.add( upnear.add(wnear));
    this._Near_Bottom_Left  = this._Cnear.sub( upnear.sub(wnear));
    this._Near_Bottom_Right = this._Cnear.sub( upnear.add(wnear));
    
    this._Far_Top_Left      = this._Cfar.add(  ufar.sub(wfar));
    this._Far_Top_Right     = this._Cfar.add(  ufar.add(wfar));
    this._Far_Bottom_Left   = this._Cfar.sub(  ufar.sub(wfar));
    this._Far_Bottom_Right  = this._Cfar.sub(  ufar.add(wfar));
    


    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Near_Bottom_Right,this._Near_Bottom_Left,this._Near_Top_Right));
    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Far_Top_Left,this._Far_Top_Right,this._Far_Bottom_Left));
    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Near_Top_Right,this._Far_Top_Right,this._Far_Top_Left));

    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Near_Bottom_Right,this._Far_Bottom_Right,this._Far_Bottom_Left));
    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Far_Top_Right,this._Near_Top_Right,this._Near_Bottom_Left));
    this._frustum.push(Ray.CalcPlaneBy3Vectors(this._Near_Top_Left,this._Far_Top_Left,this._Far_Bottom_Right));


   
}

get planes() {return this._frustum;}

   convertToPrim() {


    var a= new Array();
     

    // FRONT

    {
      var p=new Primitive();
      p.AddVec(this._Near_Bottom_Right);   
      p.AddVec(this._Near_Bottom_Left);
      p.AddVec(this._Near_Top_Right);
      p.AddVec(this._Near_Top_Left);
      p.calcPlane();
      a.push(p);            
    }

   // BACK
   {
    var p=new Primitive();
    p.AddVec(this._Far_Top_Left);
    p.AddVec(this._Far_Top_Right);
    p.AddVec(this._Far_Bottom_Left);
    p.AddVec(this._Far_Bottom_Right);   
    p.calcPlane();
    a.push(p);            
  }
  

  // Oben
    {
      var p=new Primitive();

      p.AddVec(this._Near_Top_Right);
      p.AddVec(this._Far_Top_Right);
      p.AddVec(this._Far_Top_Left);
      p.AddVec(this._Near_Top_Left);
      p.calcPlane();
      a.push(p);            
     }
    
     
     // UNTEN
     {
      var p=new Primitive();
      
      p.AddVec(this._Near_Bottom_Right);
      p.AddVec(this._Far_Bottom_Right);
      p.AddVec(this._Far_Bottom_Left);
      p.AddVec(this._Near_Bottom_Left);
      p.calcPlane();
      a.push(p);            
     }
     
     //RIGHT
     {
      var p=new Primitive();
      p.AddVec(this._Far_Top_Right);
      p.AddVec(this._Near_Top_Right);
      p.AddVec(this._Near_Bottom_Left);
      p.AddVec(this._Far_Bottom_Left);
      p.calcPlane();
      a.push(p);            
     }

   
     // Left
     {
      var p=new Primitive();
      p.AddVec(this._Near_Top_Left);
      p.AddVec(this._Far_Top_Left);
      p.AddVec(this._Far_Bottom_Right);
      p.AddVec(this._Near_Bottom_Right);
      p.calcPlane();
      a.push(p);            
     }



      return a;
   }

}






















