



class Portal {


    constructor(p,scale=100000) {

       this._leaf1=null;  
       this._leaf2=null;  
       this._portal_id=-1;        
       this.leave_id=-1;
       this.gestrandet_in=-1;
       this.erzeugt_in=-1;
       this._brother=null; 
       this.verts = new Array();
       this.plane = new Ray(3);
      
       this.color=new Vector3();

       if (p instanceof Ray ) {
        this.CreateByPlane(p,scale)
          this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]);
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
          this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]);
          this.CopyAttribs(p);   

        } 
    }


    reverse() {
     this.verts=this.verts.reverse();
     this.plane =Ray.CalcPlaneBy3Vectors(this.verts[0],this.verts[1],this.verts[2]);
    }
    get id() {return this._portal_id;}
    set id(a) {this._portal_id=a;}

    CopyAttribs(p) {
        this.leave_id=p.leave_id;
        this._portal_id=p._portal_id;
        this._leaf1=p._leaf1;
        this._leaf2=p._leaf2;

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
    
           if (USE_AXIS_SORT_AND_VECTOR_SNAP) v.snap();                                

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


const PORTALS_VALID=0;
const PORTALS_NULL=1;
const PORTALS_SAME = 2;
const PORTALS_BROTHERS=3;
const PORTALS_COPLANAR = 4
const PORTALS_SOURCE_LOOK_AT_TARGET=5;
const PORTALS_TARGET_LOOK_AT_SOURCE=6;

class AntiPenumbra {
     constructor(planes=null) 
     {
         

         this._planes=new Array();
         if (planes) {
            for (let p of planes) this._planes.push(new Ray(p));
         }
     }

    static CeckPortals(source_portal,target_portal) {
        if (!source_portal || !target_portal)        return PORTALS_NULL;
        if (source_portal._brother == target_portal) return PORTALS_SAME;
        if (source_portal._brother == target_portal) return PORTALS_BROTHERS;
        if (source_portal == target_portal._brother) return PORTALS_BROTHERS;
        
        let res1 =source_portal.plane.Classify(target_portal);
        let res2 =target_portal.plane.Classify(source_portal);
        if (res1===COPLANAR) return PORTALS_COPLANAR;
        if (res1===FRONT) return PORTALS_SOURCE_LOOK_AT_TARGET;
        if (res2===FRONT) return PORTALS_TARGET_LOOK_AT_SOURCE;
       return PORTALS_VALID;
    }


     static Build(source_portal,target_portal) {
        if (!this.CeckPortals(source_portal,target_portal)==false) return null;

        let center_of_source=source_portal.center();
        let center_of_target=target_portal.center();
        
      var potential_portal_planes=new Array();
        for (let v0 of source_portal.verts)
        {
          
          for (let i=0;i<target_portal.verts.length;i++)
          {
          
              let v1=target_portal.verts[i];
              let v2=target_portal.verts[(i+1)%target_portal.verts.length];
              let test_plane= Ray.CalcPlaneBy3Vectors(v0,v1,v2);
              let res1=test_plane.Classify(center_of_source);  
              let res2=test_plane.Classify(center_of_target);  


              if (res1==res2) continue;
              if (!(res1==BACK && res2 == FRONT)) continue;
              let valid=true;
              
              for (let p of potential_portal_planes) {
                 if ((p.Classify(v0)===PLANAR) && (p.Classify(v1)===PLANAR) && (p.Classify(v2)===PLANAR)) {
                    valid=false;
                    break;
                 }
              }
              if (valid) {
                potential_portal_planes.push(test_plane);
              }
          } 
        
         }

         

         if (potential_portal_planes.length!=target_portal.verts.length) return null;
         var temp=new Portal(target_portal);
         
     //   temp.reverse();

         potential_portal_planes.push(temp.plane);
         potential_portal_planes.reverse();
         return new AntiPenumbra(potential_portal_planes);
     }


     BuildPolygons(scale=1000) {
      let polys=new Array();
      
      for (let p0 of this._planes)
      {
        let poly= Polygon.CreateByPlane(p0,scale);
        for (let p1 of this._planes) {
          if (p0==p1) continue;
          let res=p1.Classify(poly);
          if (res!=SPANNING) continue;
          poly=poly.SplitPolyByPlane(p1)[0];
        }

        polys.push(poly);
      }
      return polys; 
    } 


     IsPrimitive(v) {
      if (v instanceof Polygon) return this.IsPrimitiveVisible(v);       
      if (v instanceof Portal)  return this.IsPortalVisible(v);
      
      return false;
     }

     IsPrimitiveVisible(primitive) 
     {
        for (let p of this._planes )  
          {
             if (p.Classify(primitive)===BACK) return false;
        }
        return true;
     }

     IsPortalVisible(portal)
     {
        for (let p of this._polygons )  
          {
             if (p.plane.Classify(portal)===BACK) return false;
        }
        return true;
     }

     ClassifyPortal(p) {
      let front=0;
      let back=0;
      for (let p of this._planes)
      {
        let t = p.Classify(p);
        if (t===FRONT) front++;
        if (t===BACK) back++;
        if (t===SPANNING) {back++;front++;}
      }
      if (front==0 && back==0) return PLANAR;
      if (front>0 && back>0) return SPANNING;
      if (front==0 && back>0) return BACK;
      return FRONT;
    } 

     ClassifyPrimitive(p) {
      let front=0;
      let back=0;
      for (let p of this._planes)
      {
        let t = p.Classify(p);
        if (t===FRONT) front++;
        if (t===BACK) back++;
        if (t===SPANNING) {back++;front++;}
      }
      if (front==0 && back==0) return PLANAR;
      if (front>0 && back>0) return SPANNING;
      if (front==0 && back>0) return BACK;
      return FRONT;
    } 

    Classify(p) 
    {
      if (v instanceof Polygon) return this.ClassifyPrimitive(p);       
      if (v instanceof Portal)  return this.ClassifyPortal(p);
      return false;
    } 
    
    SplitFront(in_portal)
    {
      let s= new Portal(in_portal);
      for (let p of this._planes)
      {
        if (p.Classify()===SPANNING) {
            s=s.SplitByPlane(p)[0]; 
        }
      }
      return s;
    }
}






class NonVisPolygonsRemover {
  static StepLeafs(leaf) {

    if (leaf._checked) return;
        leaf._checked=true;
        leaf._inside=false;
    
      //leaf.DeletePrimitivs();
      for (let p of leaf._portals)
      {
        this.StepLeafs(p._leaf1);
        this.StepLeafs(p._leaf2);
      }

  }


  static Remove(bsp) {

    for (let leaf of bsp._leaf_list)
      {
        if (leaf.hasIllegalGeometry()) {
               this.StepLeafs(leaf);
        } 
    }
    for (let l of bsp._leaf_list) l._checked=false;    
    }
}





class VIS {


  static CalcFrustum(source_portal,target_portal)
  {
     if (target_portal._checked) return;
     target_portal._checked=true;
     var portals = Array();

     for (let i=0;i<source_portal.verts.length;i++)
     {
      let v=[]; 
      v.push(source_portal.verts[i]);

      for (let j=0;j<target_portal.verts.length;j++) {
          v.push(target_portal.verts[j]);
          v.push(target_portal.verts[(j+1)%target_portal.verts.length]);

          var new_portal=new Portal(v);
          let cs=new_portal.plane.Classify(source_portal.center());
          let ct=new_portal.plane.Classify(target_portal.center());
          let valide= false;         
          
          
          if (cs==ct) continue;
          

          if (cs===FRONT && ct===BACK) valide=true;

          if (valide) {
            for (let p of portals) {
                if ((p.plane.Classify(new_portal.verts[0]) === PLANAR) &&
                    (p.plane.Classify(new_portal.verts[1]) === PLANAR) &&
                    (p.plane.Classify(new_portal.verts[2]) === PLANAR)) valide=false;
            }
             if (valide) {
              portals.push(new_portal); 
             }

          }
      }
    }


    


  }

  static CalcVis(source_portal) {
     let target_leaf = source_portal._leaf2;
     
     for (let target_portal of target_leaf._portals) {
       if (target_portal==source_portal) continue;
       if (target_portal._brother == source_portal) continue;
     
       let res=source_portal.plane.Classify(target_portal);
         
       if (res===FRONT) continue;
       this.CalcFrustum(source_portal,target_portal);



      }

    }
  
  
  
  static DoVIS(bsp) {
    let portals = bsp.ExtractPortals(true);
    let leafs = bsp._leaf_list;
    for (let p of portals)
    { 
         this.CalcVis(p);        
    }
  }

}

