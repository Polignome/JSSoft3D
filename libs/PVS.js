
    
    
    function mergeVerts(polyA, polyB, epsilon = 1e-6) {

     let plane=Ray.CalcPlaneBy3Vectors(polyA[0],polyA[1],polyA[2]);
     if (plane.Classify(polyB)!=COPLANAR) return false;
     let plane2=Ray.CalcPlaneBy3Vectors(polyB[0],polyB[1],polyB[2]);

     let nl=plane.normal.dot(plane2.normal);
     if (nl<0) return null;
    if (polyA.length < 3 || polyB.length < 3) return null;

    // --- Helpers ---
    // --- 1. Coplanarity check ---
    const n=polyA[1].sub(polyA[0]).cross(polyA[2].sub(polyA[0]));
    

    const planeD = n.dot(polyA[0]);

    for (let p of polyB) {
        const dist = n.dot(p) - planeD;
        if (Math.abs(dist) > epsilon) {
            return null;
        }
    }

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


    
    
   


class CellPortal {
    constructor(owner_cell,verts,look_at_cell=null) {
        this._id=-1;
        this._owner=owner_cell;
        this._look_at_cell=look_at_cell;
        this._brother_portal=null;
        this.verts=new Array() 
        if (verts) this.AddVerts(verts);
        
    }

    AddVerts(verts,reverse=false) {
        for (let v of verts) this.verts.push(new Vector3(v));
        if (reverse) this.verts=this.verts.reverse();
    }

}


class Cell {
    constructor(leaf) {
        this._id=-1;  
        this._leafs = new Array();
        this._portals = new Array();
        this._polygons = new Array();
        this._leafs.push(leaf);
        
        for (let p of leaf._polygons) this._polygons.push(p);
        this._aabb = new AABB(this._polygons);
    }
    
    get polygons() {return this._polygons;}
    set polygons(s) {this._polygons=s;}

    get aabb() {return this._aabb;}
    set aabb(s) {this._aabb=s;}


   removePortal(portal) {
     let h=new Array();
     for (let p of this._portals) {
        if (p!=portal) h.push(p);
     }
     this._portals=h;
   }        
 
  optimizePortals() {
        // concecte alle portale die das gleiche sehen
        let a=new Array();
        let coun=0;
        DebugOut("Check "+this._portals.length+" Portals per Cell")
        for (let p0 of this._portals)
        {   coun++;
            let counter=0;
           for (let p1 of this._portals)
           {
               if (p0===p1) continue;
               if (p0._look_at_cell===p1._look_at_cell && mergeVerts(p0.verts,p1.verts)) counter++;
           } 
           
           DebugOut("Portal ["+coun+"/"+this._portals.length+"]  = "+counter+"\n");
        }
        DebugOut("\n");
    }


    insertLeaf(leaf) {
        for (let l of this._leafs) if (leaf==l) return;
        this._leafs.push(leaf); 
        for (let p of leaf._polygons) this._polygons.push(p);
//        this._aabb.Add(leaf.AABB);
        this._aabb.Add(leaf._polygons);

    }

    insertPortal(portal) {
        for (let p of this._portal) if (p==portal) return;
        this._portal.push(portal); 
    }

    insertLeafList(leaf) {
        for (let l of leaf) this.insertLeaf(l);
        
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
        
          



          for (let p of this._polygons)  
          {
                
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
        
     
        }
}


class CellMerger {
     constructor(bsp) {
        this._bsp=bsp;
        this._cells=new Array();
        this._portals=new Array();
        this.BuildCellList(); 
    }

   renderPortals(engine,portals) {
        {
            
            for (let p of portals) {
                let p1=new Polygon(p.verts);
                
                engine.DrawPoly(p1,new Vector3(1,1,0),20);
            }
        }
    
    }


 

     render(camera,engine) {
        var xform=camera.GetCombinedMatrix();
        var frustum = new Frustum();
        frustum.createByCam(cam);
        
        if (this._root===null) return;
        for (let cells of this._cells) {
           cells.render(engine,camera.position,frustum,xform);
            
        }
        
        
        return true;
    }

    renderCellHull(engine) 
    {
      
      for (let l of this._cells)
      {
         let polygons=l.aabb.BuildPolygons();
         for (let p of polygons) {
            
         }
        this.renderPortals(engine,l._portals)

        }
    
    }


    

    CeckCells(cell1,cell2) {
        let found=false;
        for (let p2 of cell2._portals) {
            if (p2._look_at_cell===cell1) {found=true;break;}
        }
        if (!found) return;
        
       
        for (let p1 of cell1._portals)
        {
            for (let p2 of cell2._portals)
            {
                 if (p1===p2 && p1._brother!=p2) {continue;}
                 if (p1._look_at_cell != p2._look_at_cell) continue;
                                   
                 // Portale sind coplanar und teilen sich eine edge 
                 let v=mergeVerts(p1.verts,p2.verts);
                 if (v) 
                 {
                    p1._brother_portal.verts=new Array(); 
                    p1._brother_portal.AddVerts(v,true);
                    p1.verts=v;
                 
                    p2._brother_portal._owner.removePortal(p2);

                    for (let p3 of cell2._portals) 
                    {
                      if (p3._look_at_cell===cell1) { continue;}
                       cell1._portals.push(p3);
                    }
                    for (let p3 of cell2._polygons) {
                     cell1._polygons.push(p3);
                    }
                    return cell1;
                }

            }
        }
        return null;
    } 
    


        


    StepCells() {
      let g0=true;
      let count=0; 
      DebugOut("Cells in "+this._cells.length+"\n");          
      
      while (count<this._cells.length)   
      {
        let cell=null;
        let c1= this._cells[count];
        for (let count2=count;count2<this._cells.length;count2++)
        {
            if (count2===count) continue;
            let c2= this._cells[count2];
            //DebugOut("Check "+c1._portals.length+" Portals per Cell")
            let h1= c1._portals.length;
            let h2= c2._portals.length;
            cell=this.CeckCells(c1,c2); 
            if (cell) 
            {
                 DebugOut("Merge  "+h1+"+"+h2+" = "+cell._portals.length+"\n");

                let temp=new Array();
              for (let c of this._cells) if (c!=c2) temp.push(c);
          
                this._cells=temp;
               count=0;
              break;
            }
         }
         
         if (!cell) count++;         
      }
      DebugOut("Cells out "+this._cells.length+"\n");    
      DebugOut("Portals in "+this._portals.length+"\n")      
      this._portals=new Array();
      
      for (let c of this._cells) {
        //c.optimizePortals();
        for (let p of c._portals) this._portals.push(p);
        
        
      }
      DebugOut("Portals Out "+this._portals.length+"\n")


       
    }

    BuildCellList() {
        
        for (let leaf of this._bsp._leaf_list)
        {
            let cell=new Cell(leaf);
            cell._id=this._cells.length;
            this._cells.push(cell);
        }
        let help=new Array();      
        
        for (let p of this._bsp._portal_list) {
            let n=new CellPortal(this._cells[p._leaf1._leaf_id],p.verts,this._cells[p._leaf2._leaf_id]);
            this._cells[p._leaf1._leaf_id]._portals.push(n);
            
            help.push(n);
        }
        for (let i =0;i< this._bsp._portal_list.length;i++) 
        {
            let p=this._bsp._portal_list[i];
            let c=help[i];
            
            c._brother_portal=help[p._brother.id];
            
        }

                 
        
        
     //   this.StepCells();
    }
}
