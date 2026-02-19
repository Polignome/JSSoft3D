


class BrusFace {
    constructor(v0,v1,v2,texture_name,t0,t1,t2,swap_axis="") {
       this.v0=v0;
       this.v1=v1;
       this.v2=v2;
       this.verts=new Array();         
       
       
                    
      if (swap_axis!="") {
       this.v0.swap(swap_axis);
       this.v1.swap(swap_axis);
       this.v2.swap(swap_axis);
       
       this.plane=Ray.CalcPlaneBy3Vectors(v2,v1,v0);
      } else this.plane=Ray.CalcPlaneBy3Vectors(v0,v1,v2);
       
       
      

    }

      CreateByPlane(size=10000) {
        this.verts=new Array();
  
        var absnormal=new Vector3(this.plane.normal);        
         var aa=new Vector3(0.0,0.0,0.0);
         absnormal.abs();
  
         if (absnormal.y > absnormal.z) {
             if (absnormal.z > absnormal.x)  aa.z = 1.0; else aa.x = 1.0;
         } else {
             if (absnormal.y <= absnormal.x) aa.y = 1.0; else aa.x = 1.0;
         }
  
        var normal=new Vector3(this.plane.normal); 
  
     
  
        var u = aa.cross(normal);u.normalize();
        var v = u.cross(normal);v.normalize();
        u=u.mul(size);
        v=v.mul(size);
  
        var a=this.v0.add(u.sub(v));
        var b=this.v0.add(u.add(v));
        var c=this.v0.sub(u.sub(v));
        var d=this.v0.sub(u.add(v));

        this.verts.push(d);
        this.verts.push(c);
        this.verts.push(b);
        this.verts.push(a);

 /*       this.verts.push(a);
        this.verts.push(b);
        this.verts.push(c);
        this.verts.push(d);
*/
        }
  

  toStr() {
    var s="";
    for (let i=0;i<this.verts.length;i++) {
      s+="("+this.verts[i].x+" "+this.verts[i].y+" "+this.verts[i].z+")";
      if (i<<this.verts.length-1) s+" ";
    }
    s+=" A:" + this.axis;
    s+="\n"
    return  s;
  }
}


class Brush {
    constructor() {
       this.face_list = new Array();
       this.primitives= new Array();
       
       this.faces_vuild=false;
       this.csg_tree=null;
       this._aabb= new AABB();
    }

    
    get faces() {return this.face_list;}
    set faces(a) {this.face_list=a;}


    AddFace(face) {
      this.face_list.push(face);        
    }

    
    BuildFaces(keep=1) {
      this.face_list=ConvexBuilder.buildFromBrushfaces(this.face_list);
      this._aabb= new AABB();
      let planes= new Array();
      this.primitives= new  Array();
  
      for (let f of this.face_list) {
        let verts= new Array();
        for (let v of f.verts) verts.push(new Vert(v));
        
        this._aabb.Add(verts)
        let p=new Polygon(verts,true,0.1);
        p.render_type=POLY_PERSPECTIVE_TEXTURED;
        p.calcPlane();
        p.setWorldTexture(0.1,0.1);
        this.primitives.push(p);
        
        planes.push(p.plane);
      }
      
      this.cgs_tree=new CSGTree(planes);
    }


    GetNumFaces() {
        return this.face_list.length;
    }
    
   toStr() {
    var s="{\n";
    for (let i=0;i<this.face_list.length;i++)
    {
        s+=this.face_list[i].toStr()+"\n";
    }
    return s+"}\n";
   }

   clip(brush,strong=true) {
     let h=brush.cgs_tree;
     
     this.primitives=h.ClipUnion(this.primitives,strong)
     
     
     for (let p of this.primitives) p.SetColor(0,0,1)
    
    
   }
  }  
