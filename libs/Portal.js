
class Portal {


    constructor(p,scale=100000) {

       this._leaf1=null;  
       this._leaf2=null;  
       
       this.leave_id=-1;
       this.gestrandet_in=-1;
       this.erzeugt_in=-1;

       this.verts = new Array();
       this.plane = new Ray(3);

       this.color=new Vector3();

       if (p instanceof Ray ) {
        this.CreateByPlane(p,scale)
        this.plane = new Ray(p); 
       } else
       if (p instanceof Array && p.length>0 && p[0] instanceof Vector3 ) {
        for (let pp of p) this.verts.push(new Vector3(pp));
         this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]);
       } else
       if (p instanceof Array && p.length>0 && p[0] instanceof Vert ) {
         for (let pp of p) this.verts.push(new Vector3(pp.world));
         this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]);  
       } else
       if (p instanceof Polygon) {
         for (let pp of p.verts) this.verts.push(new Vector3(PushSubscription.world));
         this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]); 
       } else
       if (p instanceof Portal) {
         for (let pp of p.verts) this.verts.push(new Vector3(pp));
         this.plane= new Ray(p.plane);   
         this.CopyAttribs(p);   

        } 
    }

    CopyAttribs(p) {
        this.leave_id=p.leave_id;
        this.gestrandet_in=p.gestrandet_in;
        this.erzeugt_in=p.erzeugt_in;
        this.color=new Vector3(p.color);
    }

    CreateByPlane(plane,size=10000) {
        this.verts=new Array();

        var absnormal=new Vector3(plane.normal);        
         var aa=new Vector3(0.0,0.0,0.0);
         absnormal.abs();
  
         if (absnormal.y > absnormal.z) {
             if (absnormal.z > absnormal.x)  aa.z = 1.0; else aa.x = 1.0;
         } else {
             if (absnormal.y <= absnormal.x) aa.y = 1.0; else aa.x = 1.0;
         }
  
        var normal=new Vector3(plane.normal); 
  
        var u = aa.cross(normal);u.normalize();
        var v = u.cross(normal);v.normalize();
        u=u.mul(size);
        v=v.mul(size);
  
        var a=plane.origin.add(u.sub(v));
        var b=plane.origin.add(u.add(v));
        var c=plane.origin.sub(u.sub(v));
        var d=plane.origin.sub(u.add(v));

        this.verts.push(d);
        this.verts.push(c);
        this.verts.push(b);
        this.verts.push(a);
        this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]); 
    }
  
    
calcPlane() {
       this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]); 
}

 center() {
        let out = new Vector3()
        for (let v of this.verts)   
        {
          out=out.add(v);
        }
        out=out.div(this.verts.length);
        return out;
    }


SplitByPlane(plane) 
     {
       var fpoly=new Portal();
       var bpoly=new Portal();

       fpoly.CopyAttribs(this);
       bpoly.CopyAttribs(this);      

       for (let i=0;i<this.verts.length;i++)
       {
         var j=(i+1) % this.verts.length;
         var v0=this.verts[i];
         var v1=this.verts[j];
         var res0=plane.Classify(v0);
         var res1=plane.Classify(v1);
    
         
         if (res0===COPLANAR ) {
           fpoly.verts.push(new Vector3(v0)); 
           bpoly.verts.push(new Vector3(v0)); 
         }
    
         if (res0===FRONT) 
         { 
           fpoly.verts.push(new Vector3(v0)); 
         }

         if (res0===BACK) 
         { 
           bpoly.verts.push(new Vector3(v0)); 
         }
         




         if ((res0===FRONT && res1===BACK) || (res1===FRONT && res0===BACK))
         {
           var aDot=v0.dot(plane.normal);
           var bDot=v1.dot(plane.normal);
           var scaled = ((-plane.D) - aDot) / ((bDot - aDot));

           
    
           let v = new Vector3(v0.x + (scaled * (v1.x - v0.x)),
                               v0.y + (scaled * (v1.y - v0.y)),
                               v0.z + (scaled * (v1.z - v0.z)));
    
    
           fpoly.verts.push(v);
           bpoly.verts.push(new Vector3(v));
         }
       }  
       if (fpoly.verts.length < 3) fpoly=null;
        else fpoly.calcPlane();

       if (bpoly.verts.length < 3) bpoly=null;
        else bpoly.calcPlane();

        return [fpoly,bpoly];
     }
    






}







class PortalBuilder {

    static BuildPortals(bsp) {
        let pre= new Array();
       
          
        for (let node of bsp.nodes) 
        {
            
            let p=new Portal(node._plane,100000)
            
            p.color=new Vector3(Math.min(Math.random()*2,1),
                                Math.min(Math.random()*2,1),Math.min(Math.random()*2,1));
           
            let l=new Array();
            
               node.ClipPortal(p,pre);

        }
        
      




        for (let p of pre) {

            p.color=new Vector3(Math.min(Math.random()*2,1),
                                Math.min(Math.random()*2,1),Math.min(Math.random()*2,1));



          p._leaf1 = bsp._leafs[p.erzeugt_in];
          p._leaf2 = bsp._leafs[p.gestrandet_in];

          bsp._leafs[p.erzeugt_in]._portals.push(p);
          bsp._leafs[p.gestrandet_in]._portals.push(p);
       }  



       return pre;


    }
}


