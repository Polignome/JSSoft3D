


class BrusFace {
    constructor(v0,v1,v2,texture_name,t0,t1,t2,swap_axis="") {
       this.v0=v0;
       this.v1=v1;
       this.v2=v2;
       this.t0=t0;
       this.t1=t1;
       this.t2=t2;
       this.verts=new Array();         
       this.texture_name=texture_name;
       
                    
      if (swap_axis!="") {
       this.v0.swap(swap_axis);
       this.v1.swap(swap_axis);
       this.v2.swap(swap_axis);
       
       this.plane=Ray.CalcPlaneBy3Vectors(v2,v1,v0);
      } else this.plane=Ray.CalcPlaneBy3Vectors(v0,v1,v2);
       
       
      

    }

    snap(v, eps = 0.001) {
      return Math.abs(v) < eps ? 0 : Math.round(v / eps) * eps;
   }

    SplitByPlane(plane) 
     {
       var fpoly=[];
       var bpoly=[];


       for (let i=0;i<this.verts.length;i++)
       {
         var j=(i+1) % this.verts.length;
         var v0=this.verts[i];
         var v1=this.verts[j];
         var res0=plane.Classify(v0);
         var res1=plane.Classify(v1);
    
         
         if (res0==COPLANAR ) {
           fpoly.push(new Vector3(v0)); 
           bpoly.push(new Vector3(v0)); 
         }
    
         if (res0==FRONT) 
         { 
           fpoly.push(new Vector3(v0));
         }

         if (res0==BACK) 
         { 
          bpoly.push(new Vector3(v0));
         }
         
         if ((res0==FRONT && res1==BACK) || (res1==FRONT && res0==BACK))
         {
           var aDot=v0.dot(plane.normal);
           var bDot=v1.dot(plane.normal);
           var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
           var  v = new Vector3(v0.x + (scaled * (v1.x - v0.x)),
                                v0.y + (scaled * (v1.y - v0.y)),
                                v0.z + (scaled * (v1.z - v0.z)));
             
          if (USE_AXIS_SORT_AND_VECTOR_SNAP) v.snap();                                
          
           fpoly.push(new Vector3(v));
           bpoly.push(new Vector3(v));
         }
       }  
       
       if (fpoly.length < 3) fpoly=null;
       if (bpoly.length < 3) bpoly=null;
        

        return [fpoly,bpoly];
     }







    CreateByPlane(size=1000000) {
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


     mergeVerts(polyA, polyB, epsilon = 1e-6) {

     
    // --- 2. Shared edge finden ---
    let aIndex = -1;
    let bIndex = -1;

    for (let i = 0; i < polyA.length; i++) {
        const a0 = polyA[i];
        const a1 = polyA[(i + 1) % polyA.length];

        for (let j = 0; j < polyB.length; j++) {
            const b0 = polyB[j];
            const b1 = polyB[(j + 1) % polyB.length];

            // entgegengesetzte Edge!
            if (a0.Equal(b1,epsilon) && a1.Equal(b0,epsilon)) {
                aIndex = i;
                bIndex = j;
                break;
            }
        }
        if (aIndex !== -1) break;
    }

    if (aIndex === -1) return null;

    // --- 3. Merge (Shared Edge wird ausgelassen) ---
    const result = [];

    // Polygon A (ohne shared edge)
    let i = (aIndex + 1) % polyA.length;
    while (i !== aIndex) {
        result.push(polyA[i]);
        i = (i + 1) % polyA.length;
    }

    // Polygon B (ohne shared edge)
    let j = (bIndex + 1) % polyB.length;
    while (j !== bIndex) {
        result.push(polyB[j]);
        j = (j + 1) % polyB.length;
    }

    // --- 4. Duplicate Vertices entfernen ---
    const deduped = [];
    for (let v of result) {
        if (!deduped.some(d => d.Equal(v,epsilon))) {
            deduped.push(v);
        }
    }

    // --- 5. Kollineare Punkte entfernen ---
    const cleaned = [];
    for (let k = 0; k < deduped.length; k++) {

        const prev = deduped[(k - 1 + deduped.length) % deduped.length];
        const curr = deduped[k];
        const next = deduped[(k + 1) % deduped.length];

        const v1 = curr.sub( prev);
        const v2 = next.sub( curr);

        const c = v1.cross(v2);
        const lenSq = c.dot(c);

        if (lenSq > epsilon * epsilon) {
            cleaned.push(curr);
        }
    }

    if (cleaned.length < 3) return null;

    return cleaned;
}



    MergePolygons(fragment_list,fragment)
    {
       if (fragment_list.length<=0) {
        fragment_list.push(fragment);
        return false;
       }

       for (let i=0;i<fragment_list.length;i++) {
           let f=this.mergeVerts(fragment_list[i],fragment);
           if (f) {
            console.log("Coneckt\n")
            fragment_list[i]=f; 
            return true;
          }
       }
        fragment_list.push(fragment);
        return false;
    }

    RebuildFaces() {
        
       let temp=new Array();
       for (let i=0;i<this.face_list.length;i++)temp.push(new Array())

        for (let p of this.primitives )
        {
          console.log(p._id)
          this.MergePolygons(temp[p._id],p);  
        }
    }
    
    get faces() {return this.face_list;}
    set faces(a) {this.face_list=a;}


    AddFace(face) {
      this.face_list.push(face);        
    }


     classifyPlane(normal, epsilon = 0.001) 
      {
        const ax = Math.abs(normal.x);
        const ay = Math.abs(normal.y);
        const az = Math.abs(normal.z);

        if (ax > 1 - epsilon && ay < epsilon && az < epsilon) return 0; // X
        if (ay > 1 - epsilon && ax < epsilon && az < epsilon) return 1; // Y
        if (az > 1 - epsilon && ax < epsilon && ay < epsilon) return 2; // Z

        return 3; // schräg
     }



     BuildFaces(keep=1) {
      for (let f of this.face_list) 
      {
          f.CreateByPlane();
          for (let f2 of this.face_list) {
             if (f2==f) continue;
             if (f2.plane.Classify(f.verts) === SPANNING)   {
                let help=f.SplitByPlane(f2.plane);
                if (help[0]) f.verts=help[0];
                
             }
          }   
      }




      this._aabb= new AABB();
      let planes= new Array();
      this.primitives= new  Array();
  
      if (USE_AXIS_SORT_AND_VECTOR_SNAP) this.face_list.sort((a, b) => 
      {
          let ca = this.classifyPlane(a.plane.normal);
          let cb = this.classifyPlane(b.plane.normal);

          return ca !== cb  ? ca - cb 
                 : Math.abs(b.plane.normal.x + b.plane.normal.y + b.plane.normal.z) 
                 - Math.abs(a.plane.normal.x + a.plane.normal.y + a.plane.normal.z);
       });


      let id=0;
      for (let f of this.face_list) {
        let verts= new Array();
        for (let v of f.verts) verts.push(new Vert(v));
        this._aabb.Add(verts)
        let p=new Polygon(verts,true,0.1);
        p._texture=global_texture_manager.GetTextureByName(f.texture_name);
        p.render_type=POLY_PERSPECTIVE_TEXTURED;
        p.calcPlane();
        p.setWorldTexture(0.01,0.01);
        p._id=id;
        id++;
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
