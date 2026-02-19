const BACK_OWNER = -1;
const ROOT_OWNER = 0;
const FRONT_OWNER = 1;

const ROOT_NODE =0;
const NORMAL_NODE =1;
const LEAF_NODE = 2;
const SUB_LEAF_NODE =3;
const SOLID_SPACE_NODE =4;


class SolidNode {

}

class NonSolidNode {

}



function Finde_besten_Splitter(polyliste ,gewichtung = 8) 
{
  
   
   let best_index = -1
   let blnSplitter_gefunden = false
   
   ulBest_Score = 1000000
   
   for (let i=0;i<polyliste.length;i++) {
     let lFront = 0;
     let lBack = 0;
     let lPlanar = 0;
     let lSplits = 0;
     const pSplitter=polyliste[i];
    
    if (pSplitter._was_best_splitter) continue;  
     
       for (let j=0;j<polyliste.length;j++)
       {
            const pAkt_Poly = polyliste[j];
            
            if (i===j || pAkt_Poly._can_not_be_splitter || pAkt_Poly._create_from_aabb) continue
           

           let nKlasse=pSplitter.plane.Classify(pAkt_Poly);

           if( nKlasse === FRONT) lFront = lFront + 1; else
           if( nKlasse === BACK) lBack = lBack + 1; else
           if( nKlasse ===  PLANAR) lPlanar = lPlanar + 1; else lSplits = lSplits + 1;
     
       }
     
      let ulScore = Math.abs(lFront + lBack) + (lSplits * gewichtung);
        
       if (ulScore<=ulBest_Score)
        if (((lFront > 0) && (lBack > 0)) || (lSplits > 0))
       {
            ulBest_Score = ulScore;
            blnSplitter_gefunden = true;
            best_index = i;
       }


    } 
    if (!blnSplitter_gefunden) return -1;
    return best_index;
}





class BSPNode {

  constructor(primitives,makesolid=false,tree=null,parent=null,owner=0,leaf_id=-1) {


     this._plane=null; 
     this._parent=null; 
     this._front=null;
     this._back=null;
     this._owner=0;
     this._prims=new Array();     
     this._node_id=-1;
     this._node_type=NORMAL_NODE;
     this._solid=false;
     this._potential_portal=false;
     this._leaf_id=leaf_id;
     this._has_aabb_primitivs=false;  
     this._checked=false;
     this._portals=new Array();

     

     if (!this._parent) this._node_type=ROOT_NODE;
        
     this._aabb= new AABB(primitives);


     
     let bestsplitter=-2;
     if (!makesolid) bestsplitter=Finde_besten_Splitter(primitives);
     


     if (bestsplitter==-1 || makesolid)   
     {
        

        if (bestsplitter==-1 && !makesolid) 
        {
           for (let p of primitives) {
            if (p._create_from_aabb)  {this._has_aabb_primitivs =true; break;}
           }
            this._prims=primitives;
           this._node_type=LEAF_NODE;

           this._leaf_id=tree._leafs.length;
           tree._leafs.push(this);
        }
        
        let found=false;

        for (let p of primitives) {
            if (p._was_best_splitter) continue;
            found = true;
            p._was_best_splitter=true;
            this._plane=new Ray(p.plane);
            this._front=new BSPNode(primitives,true,tree,this,FRONT_OWNER,this._leaf_id)
        }
        
      
              if (found==false) {this._solid=true; }
        return;
     } 


    

     this._plane=new Ray(primitives[bestsplitter].plane);
     primitives[bestsplitter]._was_best_splitter=true;
     this._potential_portal=true;

     this._node_id=tree._nodes.length;
     tree._nodes.push(this);
     


     let fl=[];
     let bl=[];

    


     for (let p of primitives) {
        let result=this._plane.Classify(p);
        if (result === FRONT) fl.push(p); 
        if (result === BACK)  bl.push(p); 
        
        if (result === PLANAR)  {
            if (this._plane.normal.dot(p.plane.normal)>=0) {
                fl.push(p); 
            } else {
                
                bl.push(p);
            }
        }
        
        if (result===SPANNING) {
            let s=p.SplitPolyByPlane(this._plane);
            if (s[0]) fl.push(s[0]); 
            if (s[1]) bl.push(s[1]); 
        }
    

    }
     
      //  console.log(s)
         
        if (fl.length>0 ) this._front=new BSPNode(fl,makesolid,tree,this,FRONT_OWNER,leaf_id);
        if (bl.length>0 ) this._back=new BSPNode(bl,makesolid,tree,this,BACK_OWNER,leaf_id);
         
     
    }



    DebugNode() {
        let s="";
        if (this._node_type==ROOT_NODE) s+="R";
        if (this._solid) s+="S!!!!!!!!";
        //if (this._node_type==NORMAL_NODE) s+="N:";
        //if (this._node_type==LEAF_NODE) s+="L:";
        //if (this._node_type==SUB_LEAF_NODE) s+="!!!!!!!!S:";
        
        if (this._front!=null) s+="F"+this._front.DebugNode();
        if (this._back!=null) s+="B"+this._back.DebugNode();   
        return s;

    }
    DeletePrimitivs() {
this._prims=[];     
    }
      ExtractPrims(out) {
        if (this._node_type===LEAF_NODE)  
             for (let p of this._prims) {
                let pp=new Polygon(p);
                out.push(pp);
             }
        if (this._front!=null) this._front.ExtractPrims(out);
        if (this._back!=null) this._back.ExtractPrims(out);   
      } 
 
 
      ClipPortal(portal,out) {
           
          if (this._solid) {
            
            if (portal.erzeugt_in==-1) portal.erzeugt_in= this._leaf_id;
            else portal.gestrandet_in=this._leaf_id;
            out.push(portal);
 
            return;
          }
  
         portal=this._aabb.ClipPortal(portal);
         
        let result=this._plane.Classify(portal.verts);
        
        

        if (result===FRONT) 
        {
            if (this._front) this._front.ClipPortal(portal,out);
            return;
        } 
        
        if (result===BACK) 
        {
            if (this._back) this._back.ClipPortal(portal,out);
            return;
        } 
        if (result===SPANNING) {
            
            
            let v=portal.SplitByPlane(this._plane);

            if (v[0] && this._front) this._front.ClipPortal(v[0],out); 
            if (v[1] && this._back)  this._back.ClipPortal(v[1],out);
                 

            
           return;
        }

        if (result===PLANAR) 
        {

            let nl=this._plane.normal.dot(portal.plane.normal);
            if (this._front && this._back) 
            {
                let out2=new Array();
                if (nl>=0) 
                {
                   this._front.ClipPortal(portal,out2); 
                   for (let p of out2) this._back.ClipPortal(p,out);   
                   return   
                }
                this._back.ClipPortal(portal,out2); 
                for (let p of out2) this._front.ClipPortal(p,out);
                return;
            }

           
           
            if (this._front && nl>=0) this._front.ClipPortal(portal,out); //Blos nicht ändern
            else if (this._back ) this._back.ClipPortal(portal,out);

            return;


        } 
    
    }





   



     render(engine,camera_position,frustum,xform)
     {
     


       if (engine._use_node_frustum_culling) 
        {
        
        
           // ---- Frustum Culling ----
           if (!frustum.intersectsAABB(this._aabb)) {
              engine._node_aabb_frustum_culled++;
              return;
           }
        }
          // ---- Projection ----
           const bbox = this._aabb.projectAABBToScreen(
            xform, engine.width, engine.height
           );
        

           if(!bbox) {
               engine._node_aabb_project_culled++;
               return;
          }

           let minX = Math.floor(bbox.minX);
           let maxX = Math.ceil(bbox.maxX);
           let minY = Math.floor(bbox.minY);
           let maxY = Math.ceil(bbox.maxY);
           let minW = bbox.minDepth; 
    
           const DEPTH_EPSILON = 1e-5*2;
            
            
           if(engine._use_node_hzbuffer_culling  && engine._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minW- DEPTH_EPSILON)) {
             engine._node_hzb_culled++;
            return;
           }
        
        this.nodes_checkt++; 
     
     
     
     
     
     
        if (this._node_type==LEAF_NODE) 



    {
          for (let p of this._prims)  {
                
             if (p.plane.Classify(camera_position) == BACK) {
                engine._primitives_back_face_culling++;
                continue;
             }
             let result = p.ClipByFrustum(frustum);
             if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) {
                engine._primitives_frustum_culling++;
                continue;
             }
             
             let clipped = result[0];
             let o = clipped.TransformToScreen(xform);
             if (o[0]) {
              engine._primitives_transform_culling++;
              continue;
             }
             if (!clipped.Project(engine)) {
                 engine._primitives_project_culling++;
                continue;
             }
                engine._spanrenderer.AddPrimitive(clipped,engine._dummy_texture);
                engine._primitives_rendered++;
               
            }


           return;
        }


       let result= this._plane.Classify(camera_position);
        if (result===FRONT) {
            if (this._front!=null) this._front.render(engine,camera_position,frustum,xform);
            if (this._back!=null)  this._back.render(engine,camera_position,frustum,xform);
            return;
        }

        if (this._back!=null)  this._back.render(engine,camera_position,frustum,xform);
        if (this._front!=null) this._front.render(engine,camera_position,frustum,xform);


    }




}


class BSPTree {
    constructor(primitives=nothing) {
        this._root=null;
        this._nodes=new Array();
        this._leafs=new Array();
        this.build(primitives);
    }

    get nodes() {return this._nodes;}
    set nodes(a) {this._nodes=a;}

    get leafs() {return this._leafs;}
    set leafs(a) {this._leafs=a;}

get total_node_count() {
    return this._nodes.length;
}
    build(primitives) {
        this._nodes=new Array();
        console.log("Build BSP Polys in :" + primitives.length);
        this._root= new BSPNode(primitives,false,this,null);
    }


    ExtractPrims() {
        let out = new Array();
        if (this._root!=null)this._root.ExtractPrims(out);
        return out;
    }

    render(camera,engine) {

       engine._primitives_rendered = 0;
       engine._node_hzb_culled = 0;
       engine._node_aabb_frustum_culled = 0;
       engine._node_aabb_project_culled = 0;
       engine._primitives_back_face_culling = 0;
       engine._primitives_frustum_culling=0;
       engine._primitives_transform_culling=0;
       engine._primitives_project_culling=0;
        this.nodes_checkt=0;

        var xform=camera.GetCombinedMatrix();


        var frustum = new Frustum();
        frustum.createByCam(cam);
        
        if (this._root===null) return;
        this._root.render(engine,camera.position,frustum,xform);
     
     
     
       
     
     
     
     
        return true;
    }
    
    DebugTree() {
   return;
        let s="-> ";
        if (this._root!=null) s+=this._root.DebugNode();   
        
        console.log(s);
        return s;


    }
    ClipPortal(portal) {
//            let p=this._aabb.ClipPortal(portal);
            let l=new Array();
            this._root.ClipPortal(portal,l);
            return  l;

    }
}



class NonVisPolygonsRemover {
 

  static StepLeafs(leaf) {

    if (leaf._checked) return;
      leaf._checked=true;
    
      leaf.DeletePrimitivs();
      for (let p of leaf._portals)
      {
        if (p._leaf1) this.StepLeafs(p._leaf1);
        if (p._leaf2) this.StepLeafs(p._leaf2);
      }

  }


  static Remove(bsp) {


    for (let leaf of bsp.leafs)
      {
        if (leaf._has_aabb_primitivs) {
           
               this.StepLeafs(leaf);
        }
    
    }
    for (let l of bsp.leafs) l._checked=false;    
    }


}