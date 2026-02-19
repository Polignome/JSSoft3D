const OCCLUDER_MIN_AREA = 80 * 80;


class BVHNode {
    constructor() {
        this.bounds = new AABB();
        this.left = null;
        this.right = null;

        this.first = 0;   // Index im Polygon-Array
        this.count = 0;   // Anzahl der Polygone
    }

    isLeaf() {
        return this.count > 0;
    }
}


class BVH {
    constructor(engine) {
       this._engine=engine;
       this._root=null;
       this.total_node_count=0;
       this.nodes_checkt=0;
       this.xform_old=new Matrix4x4(); 
    }
    
    
    build(polygons) {
        this.total_node_count=0;
        this._root=this.buildBVH(polygons);
        this._engine._primitives_in=polygons.length;
    }
    

    render(camera,engine) {
        var xform=camera.GetCombinedMatrix();


        var frustum = new Frustum();
        frustum.createByCam(cam);
        this.traverseBVH_OcclusionRender(engine._primitives,this._root,frustum,camera,xform,engine._width,engine._height,engine);
        return true;
    }

    
 traverseBVH_OcclusionRender(
    polygons,
    root,
    frustum,
    camera,
    xform,
    viewportW,
    viewportH,
    engine
) {
    const stack = [];
    stack.push(root);
       
       engine._primitives_rendered = 0;
       engine._node_hzb_culled = 0;
       engine._node_aabb_frustum_culled = 0;
       engine._node_aabb_project_culled = 0;
       engine._primitives_back_face_culling = 0;
       engine._primitives_frustum_culling=0;
       engine._primitives_transform_culling=0;
       engine._primitives_project_culling=0;
        this.nodes_checkt=0;

    while (stack.length > 0) {

        const node = stack.pop();

        
        if (engine._use_node_frustum_culling) 
        {
        
        
           // ---- Frustum Culling ----
           if (!frustum.intersectsAABB(node.bounds)) {
              engine._node_aabb_frustum_culled++;
              continue;
           }
}
          // ---- Projection ----
           const bbox = node.bounds.projectAABBToScreen(
            xform, viewportW, viewportH
           );
        

           if(!bbox) {
               engine._node_aabb_project_culled++;
              continue;
          }

           let minX = Math.floor(bbox.minX);
           let maxX = Math.ceil(bbox.maxX);
           let minY = Math.floor(bbox.minY);
           let maxY = Math.ceil(bbox.maxY);
           let minW = bbox.minDepth; 
    
           const DEPTH_EPSILON = 1e-5*2;
            
            
           if(engine._use_node_hzbuffer_culling  && engine._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minW- DEPTH_EPSILON)) {
             engine._node_hzb_culled++;
             continue;
           }
        
        this.nodes_checkt++; 
        // ---- Leaf ----
        if (node.isLeaf()) {
            const end = node.first + node.count;
            for (let i = node.first; i < end; i++) {
                
             if (polygons[i].plane.Classify(camera.position) == BACK) {
                engine._primitives_back_face_culling++;
                continue;
             }
             let result = polygons[i].ClipByFrustum(frustum);
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

 


                // Idealerweise sollte renderPrimitive ein Rect zurückgeben!
                engine._spanrenderer.AddPrimitive(clipped,engine._dummy_texture);
                engine._primitives_rendered++;
               
            }

            // ---- Occluder Update ----
         
            continue;
        }

        // ---- Front-to-Back ----
        const left  = node.left;
        const right = node.right;

        if (!left || !right) {
            if (left)  stack.push(left);
            if (right) stack.push(right);
            continue;
        }

        const pL = left.bounds.projectAABBToScreen(xform, viewportW, viewportH);
        const pR = right.bounds.projectAABBToScreen(xform, viewportW, viewportH);

        if (!pL && !pR) continue;
        if (!pL) { stack.push(right); continue; }
        if (!pR) { stack.push(left);  continue; }

        if (pL.minDepth < pR.minDepth) {
            stack.push(right);
            stack.push(left);
        } else {
            stack.push(left);
            stack.push(right);
        }
    }

  

}



    buildBVH(polygons, first=0, count=polygons.length) {
         let node = new BVHNode();
         this.total_node_count++;
    
        // Bounds berechnen
        node.bounds.reset();
 
        for (let i = first; i < first + count; i++) {
          let bound=new AABB(polygons[i]);
          node.bounds.Add(bound);
        }


       // Leaf-Kriterium
       if (count <= 4) {
          node.first = first;
          node.count = count;
          return node;
       }

       // Größte Achse
       let size = node.bounds.size();
       let axis = 0;
       if (size.y > size.x) axis = 1;
       if (size.z > size[["x","y"][axis]]) axis = 2;

    
    // Sortieren nach Centroid
       polygons
        .slice(first, first + count)
        .sort((a,b) => a.centroid[["x","y","z"][axis]] - b.centroid[["x","y","z"][axis]]);

       let mid = first + Math.floor(count / 2);

       node.left = this.buildBVH(polygons, first, mid - first);
       node.right = this.buildBVH(polygons, mid, count - (mid - first));
    
       return node;
   }

    
}

