
const POLY_FILLED   = 1<<1;
const POLY_AFFINE_TEXTURED = 1<<2;
const POLY_PERSPECTIVE_TEXTURED = 1<<3;
const POLY_LINED_FILLED_ZEBUFFER    = 1<<4;
const POLY_FILLED_ZEBUFFER    = 1<<5;
const POLY_LINED = 1<<6;


const FIXED_POINT = 16;







class Rasterizer {
    constructor(canvas) {
        this._use_BVH =true;
        this._use_zbuffer=true;
        this._enable_culling=false;    //0=culling off 1==backface culling

        
        this._xScale =  1;//0.0198;
        this._yScale =  1;//0.0170;
        this._canvas=canvas;
        this._width=0;
        this._height=0;
        this._screenCenter_x=this._width/2;
        this._screenCenter_y=this._height/2;
        
        this._LOESCHEN=0;


        this._spans_in=0;
        this._spans_rendered=0;


        this._maxscale =0;
        this._maxscale = 0;
        this._maxscreenscaleinv = 0;
        
      

        this._max_depth=1.0;
        this._max_depth_h=this._max_depth/2;
        this.resize(this._canvas.width,this._canvas.height);
        
    //    this._bhv=null;

        this._zbuffer= null;//new Float64Array();
        this._hzbuffer= new HierarchicalZBuffer();
        this._spanrenderer= new SpanRenderer(this);

        this._primitives=new Array();
        this._bvh= new BVH(this);

        this._z_test_buffer= null;//new Float64Array();


        this._dummy_texture = new Texture() ;
     
       this.xform = new Matrix4x4();
      this.frustum = new Frustum();


       this._primitives_in =0;
       this._primitives_rendered = 1;
       this._node_hzb_culled = 2;
       this._node_aabb_frustum_culled = 3;
       this._node_aabb_project_culled = 4;
       this._primitives_back_face_culling = 5;
       this._primitives_frustum_culling=6;
       this._primitives_transform_culling=7;
       this._primitives_project_culling=8;

       this._use_node_frustum_culling=true;
       this._use_node_hzbuffer_culling=true;

        this._clear_spanbuffer=true;
        this._use_spanbuffer=true;
        
        this._canvas.Canvas.addEventListener("resize", (ev) => {
            let {width, height } = ev;
            this.resize(width,height);
        });
    

    }
   
 isOccludedRectWithPrevZ(minX, maxX, minY, maxY, minDepth) {
    
   return this._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minDepth);

 
}
 

   Reset() {
    this._primitives= new Array();
    this._bvh       = new BVH(this);

   }

   getStatistic() {
    
    return { 
       primitives_in:                this._primitives_in,
       primitives_renderd:           this._primitives_rendered,
       mode_hzb_culled:              this._node_hzb_culled,
       node_aabb_frustum_culled:     this._node_aabb_frustum_culled,
       node_aabb_project_culled:     this._node_aabb_project_culled,
       primitives_back_face_culling :this._primitives_back_face_culling,
       primitives_frustum_culling:   this._primitives_frustum_culling,
       primitives_transform_culling :this._primitives_transform_culling,
       primitives_project_culling:   this._primitives_project_culling,
       spans_in:                     this._spanrenderer._spans_in,
       spans_out:                    this._spanrenderer._spans_out
      };

   }


   Start(camera) {

        if (this._zbuffer==null) {
           this._zbuffer= new Float64Array(this.width()*this.height());
           this._zbuffer.fill(this._max_depth);
           this._hzbuffer= new HierarchicalZBuffer(this.width(),this.height());
        }
        
        this._hzbuffer.setBaseLevel(this._zbuffer);
        this._hzbuffer.build();

        
        if (this._use_spanbuffer)   {
             this._spanrenderer.Start();
        } else {
            this.ClearZBuffer();
            this.canvas.Clear();
        }
       // WriteToLog(this._zbuffer);
      this.xform=camera.GetCombinedMatrix();
      this.frustum = new Frustum();
      this.frustum.createByCam(cam);
      this.camera=camera;


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
   
   get primitives() {return this._primitives;}
   get HZB() {return this._hzbuffer;}

   AddPrimitive(primitive) {
          if (Array.isArray(primitive)) 
          {
            for (let p of primitive) this.AddPrimitive(p);
            return;
          }
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
    
   ZTestBufferToScreen() {
        for (let y=0;y<this._height;y++) {
          for (let x=0;x<this._width;x++) 
          {  
            var c= this._z_test_buffer[x+y*this._width];
            c=Math.min((c*255.0)|0,255);
            this._canvas.PutPixel(x,y,RGBA(c,c,c,0xff));
        
          }
       }
    }
    




DrawLine(a,b) {
                var x1=a.x|0;
                var y1=a.y|0;
                var z1=a.z;
                var x2=b.x|0;
                var y2=b.y|0;
                var z2=b.z;

                
                var dx = Math.abs(x2 - x1);
                var dy = Math.abs(y2 - y1);
                var dz = (z2 - z1);
                var sx = (x1 < x2) ? 1 : -1;
                var sy = (y1 < y2) ? 1 : -1;
                var err = dx - dy;
                var l=Math.sqrt(dx*dx+dy*dy);
                var sz= dz/l;
                
                var cr1=a.color.x*255;
                var cg1=a.color.y*255;
                var cb1=a.color.z*255;
                var cr2=b.color.x*255;
                var cg2=b.color.y*255;
                var cb2=b.color.z*255;

                
                var dr= (cr2-cr1)/l;
                var dg= (cg2-cg1)/l;
                var db= (cb2-cb1)/l;
                
                
                if (this.SetBuffer(x1,y1,z1)) canvas.PutPixel(x1,y1,RGBA(cr1|0,cg1|0,cb1|0,0xff));
              //  return;
                while (!((x1 == x2) && (y1 == y2))) {
                    var e2 = err << 1;
                    if (e2 > -dy) {
                        err -= dy;
                        x1 += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y1 += sy;
                    }

                    // Set coordinates
                    cr1+=dr;
                    cg1+=dg;
                    cb1+=db;
                    
                    z1+=sz;
                    

                    if (this.SetBuffer(x1,y1,z1)) canvas.PutPixel(x1,y1,RGBA(cr1|0,cg1|0,cb1|0,0xff));
                    
                  }
            }


  Project(verts) {
            
            let sverts= new Array(verts.length);
            
            for (let j = 0; j <verts.length; j++)
            {
                var	ow = 1.0 /verts[j].screen.w;
                sverts[j]       = new SVec();
    
                sverts[j].color = verts[j].color;
                sverts[j].x     = (this.screenCenterX() + verts[j].screen.x * ow * this.screenCenterX() * this.xScale())  ;
                sverts[j].y     = (this.screenCenterY() - verts[j].screen.y * ow * this.screenCenterY() * this.yScale()) ;
                sverts[j].z     = verts[j].screen.w;
                sverts[j].w     = ow;
    
                if (sverts[j].x < -0.5)                        sverts[j].x = -0.5;
                if (sverts[j].x > (this.width() - 0.5))  sverts[j].x = this.width() - 0.5;
                if (sverts[j].y < -0.5)                        sverts[j].y = -0.5;
                if (sverts[j].y > (this.height() - 0.5)) sverts[j].y = this.height() - 0.5;
    
//        		if (rasterizer.PerspectiveCorrect() == 0) ow = 1.0;
//      		if (this.render_type != POLY_PERSPECTIVE_TEXTURED) ow = 1.0;
        
                sverts[j].u = verts[j].texture.x * ow;
                sverts[j].v = verts[j].texture.y * ow;
                
                if (j<verts.length-1) sverts[j].next = sverts[j+1];
            }
            //_sverts[verts.length-1].next = undefined;
           return sverts;       
    }

  TransformToScreen(verts) {
            var	codeOff = -1;
            var	codeOn = 0;
            var code=0;
            
            for (let j = 0; j < verts.length; j++)
            {
                let w= verts[j].world;
                var s= this.xform.concat(w);
                
                verts[j].screen.x=s.x;
                verts[j].screen.y=s.y;
                verts[j].screen.z=s.z;
                verts[j].screen.w=s.w
                
                
                code =	(s.x >  s.w ?  1:0) | (s.x < -s.w ?  2:0) |
                        (s.y >  s.w ?  4:0) | (s.y < -s.w ?  8:0) |
                        (s.z <  0.0 ? 16:0) | (s.z >  s.w ? 32:0);
                codeOff &= code;
                codeOn  |= code;
            }
            
            
            return new Array(codeOff,codeOn);
    }

DrawLine3D(a,b,c1=new Vector3(1,0,0),c2=undefined) {
  let v0=new Vert(a);
  let v1=new Vert(b);
  v0._color.x=v1._color.x=c1.x;
  v0._color.y=v1._color.y=c1.y;
  v0._color.z=v1._color.z=c1.z;
  if (c2) {
    v1._color.x=c2.x;
    v1._color.y=c2.y;
    v1._color.z=c2.z;
  }

  let aa=[v0,v1];
 // let aa=this.frustum.ClipLine(v0,v1);
  if (!aa ||!aa[0]||!aa[1]) return;
  let o=this.TransformToScreen(aa);
  if (o[0]) return;
  let s=this.Project(aa);
  this.DrawLine(s[0],s[1]);

}
    
    ZBufferToScreenOLD(posx=0,posy=0,scale=1) {

        for (let y=0;y<this._height;y++) {
          for (let x=0;x<this._width;x++) 
          {  
            var c= this._hzbuffer.help[x+y*this._width];
            
            this._canvas.PutPixel(x,y,c);
        
          }
       }
       return;


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
  
    
    }

   
    BuildBVH() {
       
       // this._bhv=buildBVH(this._primitives);
       this._bhv= new BVH(this); 
       this._bhv.build(this._primitives);
    }

    
    BuildBSP() {
       this._bhv= new BSPTree(this._primitives); 
    }


   ClearZBuffer() {
    this._zbuffer.fill(-(this._max_depth/2));
    this._z_test_buffer.fill(-(this._max_depth/2));

}
   
   SetBuffer(x,y,z) {
    if (z<0|| z>=this._height*this._width) return false;
    if (z<=this._zbuffer[x+y*this._width]) return false;
    this._zbuffer[x+y*this._width]=z;
    return true;
   }

   PutBuffer(pos,z) {
    if (z<=this._zbuffer[pos]) return false;
    this._zbuffer[pos]=z;
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






    get maxscal() {return this._maxscale;}
    get maxscreenscaleinv() {return this._maxscreenscaleinv;}

    RenderPrimitives() {
      this._clear_spanbuffer= this._bhv.render(this.camera,this);
    } 


    Render() {
        if (this._use_spanbuffer) this._spanrenderer.Render();


  
    }

    width() {return this._width; } 
    height() {return this._height; } 

    screenCenterX() {return this._screenCenter_x; } 
    screenCenterY() {return this._screenCenter_y; } 
    
    xScale() {return this._xScale;}
    yScale() {return this._yScale;}

    resize(width,height) {
        this._clear_spanbuffer=true;
        if (this._width==width && this._height==height) return;
        this._width=width|0;
        this._height=height|0;
        this._screenCenter_x=(this._width/2)|0;
        this._screenCenter_y=(this._height/2)|0;

        this._zbuffer= new Float64Array(this.width()*this.height());
        this._zbuffer.fill(this._max_depth);
        
        this._hzbuffer= new HierarchicalZBuffer(this.width(),this.height());

        console.log("RESize :"+this._zbuffer.length);
        
        
    }
  
    get canvas() {return this._canvas;}
    set canvas(a) {this._canvas=a;}
    get max_depth() {return this._max_depth};



}