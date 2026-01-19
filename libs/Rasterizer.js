
const POLY_FILLED   = 1<<1;
const POLY_AFFINE_TEXTURED = 1<<2;
const POLY_PERSPECTIVE_TEXTURED = 1<<3;
const POLY_LINED_FILLED_ZEBUFFER    = 1<<4;
const POLY_FILLED_ZEBUFFER    = 1<<5;
const POLY_LINED = 1<<6;

const MAX_HZB_LEVEL = 4; 
const FIXED_POINT = 16;
const ONE = 1 << FIXED_POINT;

function fixmul( a,  b) {
    return  ( a *  b >> FIXED_POINT);
}

function toFix( doubleval ) {
    return  (doubleval * ONE)|0;
}

function intVal( intfix ) {
     return intfix >> FIXED_POINT;
}

function doubleVal( intfix ) {
     return  intfix / ONE;
}



class HierarchicalZBuffer {
    constructor(width, height) {
        this.levels = [];
        this.buildEmpty(width, height);
    }

    buildEmpty(width, height) {
        this.levels = [];
        let w = width;
        let h = height;

        while (true) {
            this.levels.push({
                w, h,
                z: new Float32Array(w * h)
            });

            if (w === 1 && h === 1) break;
            w = Math.max(1, w >> 1);
            h = Math.max(1, h >> 1);
        }
    }

    // Level 0 mit echtem Z-Buffer füllen
    setBaseLevel(zbuffer) {
        this.levels[0].z.set(zbuffer);
    }

    // Mip-Kette aufbauen
    build() {
        for (let l = 1; l < this.levels.length; l++) {
            const prev = this.levels[l - 1];
            const cur  = this.levels[l];

            for (let y = 0; y < cur.h; y++) {
                for (let x = 0; x < cur.w; x++) {

                    const x0 = x * 2;
                    const y0 = y * 2;

                    let minZ = Infinity;

                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            const px = x0 + dx;
                            const py = y0 + dy;
                            if (px < prev.w && py < prev.h) {
                                const idx = py * prev.w + px;
                                minZ = Math.min(minZ, prev.z[idx]);
                            }
                        }
                    }

                    cur.z[y * cur.w + x] = minZ;
                }
            }
        }
    }


isOccludedRect(minX, maxX, minY, maxY, depth) {



for (let level = Math.min(MAX_HZB_LEVEL, this.levels.length - 1);level >= 0; level--) 
//    for (let level = this.levels.length - 1; level >= 0; level--) 
{

        const L = this.levels[level];
        const scale = 1 << level;

        const x0 = Math.floor(minX / scale);
        const x1 = Math.floor(maxX / scale);
        const y0 = Math.floor(minY / scale);
        const y1 = Math.floor(maxY / scale);

        let fullyCovered = true;

        for (let y = y0; y <= y1 && fullyCovered; y++) {
            for (let x = x0; x <= x1; x++) {
                const idx = y * L.w + x;

                // Wenn irgendwo noch Platz vor dem Occluder ist → sichtbar
                if (depth > L.z[idx]) {
                    fullyCovered = false;
                    break;
                }
            }
        }

        // Wenn dieses Level schon komplett verdeckt ist → fertig
        if (fullyCovered) return true;
    }

    return false;
}



}






class Rasterizer {
    constructor(canvas) {
        this._edgeTable  = new Array;
        this._spans  = new Array;
        this._activeEdges= new Array();
        this._use_BVH =true;
        this._xScale =  1;//0.0198;
        this._yScale =  1;//0.0170;
        this._canvas=canvas;
        this._width=0;
        this._height=0;
        this._screenCenter_x=this._width/2;
        this._screenCenter_y=this._height/2;
        
        this._LOESCHEN=0;

        this._primitives_in=0;
        this._primitives_rendered=0;
        this._primitives_mask_culled=0;
        this._primitives_aabb_frustum_culled=0;
        this._primitives_frustum_culled=0;

        this._spans_in=0;
        this._spans_rendered=0;

        this._enable_culling=false;    //0=culling off 1==backface culling

        this._maxscale =0;
        this._maxscale = 0;
        this._maxscreenscaleinv = 0;
        this._perspectiveCorrect=false;

        this._dummy_texture = new Texture() ;
      
        this._zbuffer_old= new Float64Array();
        this._zbuffer= new Float64Array();
        this._hzbuffer= new HierarchicalZBuffer();
        this._nbuffer= new Float32Array();

        this._max_depth=1.0;
        this._max_depth_h=this._max_depth/2;
        this.resize(this._canvas.width,this._canvas.height);
        this._use_zbuffer=true;

        this._bhv=null;

         
         this._spanrenderer= new SpanRenderer(this);
     
         //this._occlusionMask= new OcclusionMask(100,200); 
         this._primitives=new Array();

        this._canvas.Canvas.addEventListener("resize", (ev) => {
            let {width, height } = ev;
            this.resize(width,height);
        });
    

    }
   
 isOccludedRectWithPrevZ(minX, maxX, minY, maxY, minDepth) {
    
   return this._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minDepth);

    const width = this.width();
    // console.log("-> ",minX, maxX, minY, maxY, minDepth)
    for(let y = minY; y <= maxY; y++) {
        for(let x = minX; x <= maxX; x++) {
            const idx = y * width + x;
           // this._zbuffer_old[idx]=minDepth;
            if(minDepth > this._zbuffer_old[idx]) return false; // sichtbar
        }
    }
    return true; // vollständig verdeckt
}

    FlipZBuffer() {
       let temp=this._zbuffer;
       this._zbuffer = this._zbuffer_old;
       this._zbuffer_old=temp;

    }

   getStatistic() {
    return {prims_in: this._primitives_in, 
            prims_ren: this._primitives_rendered,
            prims_mask: this._primitives_mask_culled,
            prims_aabb_frus: this._primitives_aabb_frustum_culled
        };
   }


   Start() {
        this._spanrenderer.Start();
        this._occlusionMask.clear();
        this._hzbuffer.setBaseLevel(this._zbuffer_old);
        this._hzbuffer.build();

   }
    get SpansIn()  {return this._spanrenderer._m_spans_in;}
    get SpansOut() {return this._spanrenderer._m_spans_out;}

   EnableBackfaceCulling(culling) {
    this._enable_culling=culling;
   }

   isBackfaceCullingEnabled() {return this._enable_culling;}
   

   FlushPrimitives() {
    this._primitives=new Array();
   }
   
   AddPrimitive(primitive) {
          if (!(primitive instanceof PrimitiveBase)) return;
          this._primitives.push(primitive);
          this._primitives_in=this._primitives.length;
   }
    
   PerspectiveCorrect() {
     return this._perspectiveCorrect;
   }

   GetZBuffer() {
      return this._zbuffer;
   }

   ZBufferToScreen() {
        for (let y=0;y<this._height;y++) {
          for (let x=0;x<this._width;x++) 
          {  
            var c= this._zbuffer[x+y*this._width];
            c=Math.min((c*255.0)|0,255);
            this._canvas.PutPixel(x,y,RGBA(c,c,c,0xff));
        
          }
       }
    }
    
    
    ZBufferToScreenOLD(posx=0,posy=0,scale=1) {
        let pp=0;   
        for (let l=0;l<this._hzbuffer.levels.length;l++)  
        {
            let level=this._hzbuffer.levels[l];
            
            for (let y=0;y<level.h;y++) {
              for (let x=0;x<level.w;x++) {
                var c=level.z[x+y*level.w];
                c=Math.min((c*255.0)|0,255);
        
        
                this._canvas.PutPixel(pp+posx+x>>scale,posy+y>>scale,RGBA(c,c,c,0xff));
                
              }
            }
          pp+=level.w;
        }       
        return;
        
        
        for (let y=0;y<this._height;y++) {
          for (let x=0;x<this._width;x++) 
          {  
            var c=this._zbuffer_old[x+y*this._width];
            c=Math.min((c*255.0)|0,255);
            this._canvas.PutPixel(posx+x>>scale,posy+y>>scale,RGBA(c,c,c,0xff));
        
          }
    }
    }


    NBufferToScreen() {
        
        
        for (let y=0;y<this._height;y++) {
           for (let x=0;x<this._width;x++) 
           {
              var c=(this._nbuffer[x+y*this._width]*255.0)|0;
              this._canvas.PutPixel(x,y,RGBA(c,c,c,0xff));
        
          }
        }
    }

   
    BuildBHV() {
        if (!this._use_BVH) return;
        this._bhv=buildBVH(this._primitives);
    }
   
   ClearZBuffer() {
    this._zbuffer.fill(this._max_depth/2);
   }
   
   SetBuffer(x,y,z) {
    if (z<0|| z>=this._height*this._width) return false;
    
    if (z<=this._zbuffer[x+y*this._width]) return false;
    this._zbuffer[x+y*this._width]=z;
    return true;
 }


    PutPixel(x,y,color) {
        this._canvas.PutPixel(x,y,color);
    }
 
    GetActiveBuffer() {
       return this._canvas. GetActiveBuffer() ;

    }

    GetActiveZBuffer() {
       return this._zbuffer ;

    }

    GetActiveNBuffer() {
       return this._nbuffer ;

    }

 PutBuffer(pos,z) {
     let zz=this._max_depth_h-z;
    if (zz>=this._zbuffer[pos]) return false;
    this._zbuffer[pos]=zz;
     return true;

}



get maxscal() {return this._maxscale;}
    get maxscreenscaleinv() {return this._maxscreenscaleinv;}

    RenderPrimitives(camera) {
         
        this._LOESCHEN+=0.001;
    
    
        var xform=cam.GetCombinedMatrix();
        var frustum = new Frustum();
        frustum.createByCam(cam);
        
        

        if (this._use_BVH)
        {
           
      



/*

            //let primitives =traverseBVH_FrontToBack(this._primitives,this._bhv,frustum,cam) ;
            let primitives =traverseBVH_FrontToBack2(this._primitives,this._bhv,frustum,xform,this._width,this._height) ;
            this._primitives_after_bvh=primitives.length;
            for (let i=0;i<primitives.length;i++) {
        		this.primitives_in++
                 let current_primitive=primitives[i];
                 
   		        let res=current_primitive.plane.Classify(cam.position);
                if (res==BACK) continue;
                
                let result=current_primitive.ClipByFrustum(frustum);
                if (result[1]<0 || result[0]===undefined) continue;
                if (result[0].verts.length<3) continue;
                let cliped_primitive=result[0];
                this._primitives_cliped++;

                let o=cliped_primitive.TransformToScreen(xform);
                if (o[0]) continue;
                if (!cliped_primitive.Project(this)) continue;    
                this._primitives_visible++;
                this._spanrenderer.AddPrimitive(cliped_primitive,this._dummy_texture) ;            
            }
            */

traverseBVH_OcclusionRender(
    this._primitives,
    this._bhv,
    frustum,
    cam,
    xform,
    this._width,
    this._height,
    this
);
         
        } else {
    
             for (let i=0;i<this._primitives.length;i++) {
        		this._primitives_in++
                let current_primitive=this._primitives[i];
                
                if (frustum.intersectsAABB(aabb)) continue;
   		        let res=current_primitive.plane.Classify(cam.position);
                if (res==BACK) continue;
                let result=current_primitive.ClipByFrustum(frustum);
                if (result[1]<0 || result[0]===undefined) continue;
                if (result[0].verts.length<3) continue;
                let cliped_primitive=result[0];
                this._primitives_cliped++;

                let o=cliped_primitive.TransformToScreen(xform);
                if (o[0]) continue;
                if (!cliped_primitive.Project(this)) continue;    
                this._primitives_visible++;
                this._spanrenderer.AddPrimitive(cliped_primitive,this._dummy_texture) ;            

            }
        }
       
       } 

    Render() {
        this._spanrenderer.Render();
         // Node als Occluder markieren
         
    }

    width() {return this._width; } 
    height() {return this._height; } 

    screenCenterX() {return this._screenCenter_x; } 
    screenCenterY() {return this._screenCenter_y; } 
    
    xScale() {return this._xScale;}
    yScale() {return this._yScale;}

    resize(width,height) {

        if (this._width==width && this._height==height) return;
        this._width=width|0;
        this._height=height|0;
        this._screenCenter_x=(this._width/2)|0;
        this._screenCenter_y=(this._height/2)|0;

        this._zbuffer= new Float64Array(this.width()*this.height());
        this._zbuffer_old= new Float64Array(this.width()*this.height());
        this._hzbuffer= new HierarchicalZBuffer(this.width(),this.height());
        this._zbuffer.fill(this._max_depth);
        this._zbuffer_old.fill(this._max_depth);

        this._nbuffer= new Float32Array(this.width()*this.height());
        this._nbuffer.fill(this._max_depth);
        
        this._occlusionMask= new OcclusionMask(this.width(),this.height());
        console.log("Resize ",this.width(),this.height())
        console.log("Resize ",this._occlusionMask.width,this._occlusionMask.height," -> ",this._occlusionMask.tilesX,this._occlusionMask.tilesY)
     
     
    }
  
    get canvas() {return this._canvas;}
    set canvas(a) {this._canvas=a;}
    get max_depth() {return this._max_depth};



}