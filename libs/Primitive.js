
class PrimitiveBase {
    constructor () {
        this._object_matrix    = Matrix4x4.identity();
        this._verts= new Array();
        this._sverts= new Array();
        this._render_type=POLY_LINED;
        this._was_best_splitter=false;
        this._can_not_be_splitter=false;
        this._potential_portal=true;
        this._create_from_aabb=false;
    }


 
    GetObjectMatrix() {
        return this._object_matrix;
     }    
     SetObjectMatrix(m) {
        this._object_matrix = new Matrix4x4(m);
     }    

    get render_type() {return this._render_type;} 
    set render_type(a) {this._render_type=a;} 

   
    Visible(camera) {
        return true;
    }

    ClipByFrustum (frustum) {
        return undefined;
    }

    TransformToScreen(matrix) {
        return true;
    }

    Project(rasterizer) {
        return true;
    }

    Render(rasterizer) {
        return true;
    }
    identity() {
        this._object_matrix    = Matrix4x4.identity();
    }

    Scale(x=1,y=1,z=1) {
        var scale = Matrix4x4.scale(x,y,z);
        this._object_matrix=this._object_matrix.concat(scale);

    }

    Translate(x=0,y=0,z=0) {
        var trans = Matrix4x4.translate(x,y,z);
        this._object_matrix=this._object_matrix.concat(trans);
        //this._transform_matrix
    }

    Rotate(x=1,y=1,z=1) {
        var rot = Matrix4x4.rotation(x,y,z);
        this._object_matrix=this._object_matrix.concat(rot);
    }

}

//var dummy_texture = new Texture();

class Polygon extends PrimitiveBase {

    /**
     * function 
     */
    constructor (p,invert=false,scale=1) {
            super();
           // this._verts= new Array();
           // this._sverts= new Array();
    
            this._plane= new Ray(3);
            this._center= new Vector3();
            this._recal_plane=true;
            this._recal_center=true;
            this._counterClock=true;
            this._screen_center = new Vector4();
            this._node_id=-1;               
            this._create_from_aabb=false;
           
         
            if (p instanceof Polygon) {

  
                 if (!invert) {
                    for (let i=0;i<p.verts.length;i++) 
                    {
                       var pp=new Vert(p.verts[i],scale);
                       this._verts.push(pp);
                    }
                } else {
                    for (let i=p.verts.length-1;i>-1;i--) 
                    {
                       var pp=new Vert(p.verts[i],scale);
                       this._verts.push(pp);
                    }


                }
                this._plane=new Ray(p._plane);
                //this.calcPlane();
                this.calcCenterOfMass();
                this.SetObjectMatrix(p.GetObjectMatrix());
                this._was_best_splitter=p._was_best_splitter;
                this._can_not_be_splitter=p._can_not_be_splitter;
                this._render_type=p._render_type;
                this._potential_portal=p._potential_portal;
                this._create_from_aabb=p._create_from_aabb;
    
                return;          
            }
            

            if (Array.isArray(p) && p.length>0 /*&& p[0] instanceof Vert*/)
            {
                var ve=new Vert();
                var vv=new Vector3();
                if (!invert) {
                  for (let i=0;i<p.length;i++) {
                    if (p[i] instanceof Vert ||  p[i] instanceof Vector3)
                    {
                       let pp = new Vert(p[i]);
                       pp.world.x=pp.world.x*scale;
                       pp.world.y=pp.world.y*scale;
                       pp.world.z=pp.world.z*scale;

                        this._verts.push(pp)
                    }
                  }
                } else {

                  for (let i=p.length;i>-1;i--) {
                    if (p[i] instanceof Vert ||  p[i] instanceof Vector3)
                    {
                       let pp = new Vert(p[i]);
                       pp.world.x=pp.world.x*scale;
                       pp.world.y=pp.world.y*scale;
                       pp.world.z=pp.world.z*scale;

                        this._verts.push(pp)
                    }

                    }
                }
    
                this.calcPlane();
                this.calcCenterOfMass();
                this.identity();
       
                return;          
            }
    
    }
    
    TransformByObjectMatrix() {
        var p=new Polygon(this);
        p.ClearVerts();
        var matrix= this.GetObjectMatrix();;
    
        for (let i=0;i<this.vertices.length;i++)
        {
            var w= new Vert(this.vertices[i]);
            var h=matrix.concat(w.world);
            
            w.world.x=h.x;
            w.world.y=h.y;
            w.world.z=h.z;
            
            p.AddVert(w); 
        }

        p.calcCenterOfMass();
        p.calcPlane();
        return p;
    }

    CoppyAttribs(p,copy_best_splitter=true) {
      if(copy_best_splitter)  this._was_best_splitter=p._was_best_splitter;
        this._can_not_be_splitter=p._can_not_be_splitter;
        this._render_type=p._render_type;
        this._potential_portal=p._potential_portal;
        this._create_from_aabb=p._create_from_aabb;

    }
    clalcAABB() {
        return new AABB(this);
    }


    setPlanarTexture(realx=0,realy=0,realw=1,realh=1)
    {
         let ali=this.plane.GetAlignement();
         let umin=0;
         let umax=0;
         let vmin=0;
         let vmax=0;


                        if (ali===0)
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.z ;
                                this._verts[i].texture.y =  this._verts[i].world.y ;
                                 
                                if (i===0) {
                                    umin=umax=this._verts[i].texture.x;
                                    vmin=vmax=this._verts[i].texture.y;
                                } else {
                                    umin=Math.min(umin,this._verts[i].texture.x);
                                    umax=Math.max(umax,this._verts[i].texture.x);
                                    vmin=Math.min(vmin,this._verts[i].texture.y);
                                    vmax=Math.max(vmax,this._verts[i].texture.y);

                                }
              
                            }
                        }
    
                        // Primary axis == Y
    
                        else if (ali===1)
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.x;
                                this._verts[i].texture.y =  this._verts[i].world.z;

                                
                                if (i===0) {
                                    umin=umax=this._verts[i].texture.x;
                                    vmin=vmax=this._verts[i].texture.y;
                                } else {
                                    umin=Math.min(umin,this._verts[i].texture.x);
                                    umax=Math.max(umax,this._verts[i].texture.x);
                                    vmin=Math.min(vmin,this._verts[i].texture.y);
                                    vmax=Math.max(vmax,this._verts[i].texture.y);

                                }

                            }
                        }
    
                        // Primary axis == Z
    
                        else
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.x;
                                this._verts[i].texture.y =  this._verts[i].world.y;

                                if (i===0) {
                                    umin=umax=this._verts[i].texture.x;
                                    vmin=vmax=this._verts[i].texture.y;
                                } else {
                                    umin=Math.min(umin,this._verts[i].texture.x);
                                    umax=Math.max(umax,this._verts[i].texture.x);
                                    vmin=Math.min(vmin,this._verts[i].texture.y);
                                    vmax=Math.max(vmax,this._verts[i].texture.y);

                                }


                            }
                        }
                 

            let udelta = Math.abs(umax - umin);
            let vdelta = Math.abs(vmax - vmin);

         


            for (let i=0;i<this._verts.length;i++)
           {
               this._verts[i].texture.x = (((this._verts[i].texture.x-umin) / udelta)*realw+realx);
               this._verts[i].texture.y = (((this._verts[i].texture.y-vmin) / vdelta)*realh+realy);
               
               
               

           }
   
    }
    


    setWorldTexture(uScale =  1,  vScale =  1)
                    {
                        // Calculate |normal|
    
                        let ali=this.plane.GetAlignement();                        // Primary axis == X
    
                        if (ali===0)
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.z * uScale;
                                this._verts[i].texture.y = -this._verts[i].world.y * vScale;
                            }
                        }
    
                        // Primary axis == Y
    
                        else if (ali===1)
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.x * uScale;
                                this._verts[i].texture.y = -this._verts[i].world.z * vScale;
                            }
                        }
    
                        // Primary axis == Z
    
                        else
                        {
                            for (let i=0;i<this._verts.length;i++)
                            {
                                this._verts[i].texture.x =  this._verts[i].world.x * uScale;
                                this._verts[i].texture.y = -this._verts[i].world.y * vScale;
                            }
                        }
    }
    
    /**
     * function 
     */
    AddVert(v) {
            this._verts.push(new Vert(v));
            this._recal_plane=true;
            this._recal_center=true;
    
    }
    
    /**
     * function 
     */
    AddVec(v) {
            this._verts.push(new Vert(v));
            this._recal_plane=true;
            this._recal_center=true;
    
    }
    
    /**
     * function 
     */
     AddVerts(v) {
            for (let i=0;i<v.length;i++)
            {
                
                this._verts.push(new Vert(v[i]));
            }
            this._recal_plane=true;
            this._recal_center=true;
    
    }
    
    /**
     * function 
     */
    get center() {this.calcCenterOfMass();return this._center;
    }

    get centroid () {this.calcCenterOfMass();return this._center;
    }
    
    /**
     * function 
     */
    get ScreenCenter() {return this._screen_center;}
    
    /**
     * function 
     */
    calcPlane(counterClock = false)
        {
            this._counterClock=counterClock;
            this._recal_center=false;
            this._plane.origin = this.vertices[0].world;
            var v0 = this.vertices[1].world.sub( this.vertices[0].world);
            var v1 = this.vertices[2].world.sub( this.vertices[1].world);
            this._plane.vector = v1.cross(v0);
            if (!counterClock) {
                this._plane.vector=this._plane.vector.mul(-1);
            } ;
            return this.plane;
    }
    
    /**
     * function 
     */
    calcCenterOfMass() 
        {
        
            if (!this._recal_center && this._verts.length<3) return this._plane;
            this._center=new Vector3(this._verts.world);
            this._recal_center=false;
    
    
            for (let i=1;i<this._verts.length;i++)
            {
                this._center=this._center.add(this._verts[i].world);
            }
            var m=1.0 / this._verts.length;
            this._center=this._center.mul(m);  
            return this._center;
    }
    
    /**
     * function 
     */
    get plane() {
            return this._plane;
    }
    
    
    GetPrimitiveTransformByObjectMatrix() {
        var objmatrix=this.GetRotateMatrix();
    }
    
    /**
     * function 
     */
    Project(rasterizer) {
            if (super.Visible(rasterizer)==false) return false; 
            this._sverts= new Array( this.verts.length);
            
            for (let j = 0; j < this.verts.length; j++)
            {
                var	ow = 1.0 /this.verts[j].screen.w;
                this._sverts[j]       = new SVec();
    
                this._sverts[j].color = this.verts[j].color;
                this._sverts[j].x     = (rasterizer.screenCenterX() + this.verts[j].screen.x * ow * rasterizer.screenCenterX() * rasterizer.xScale())  ;
                this._sverts[j].y     = (rasterizer.screenCenterY() - this.verts[j].screen.y * ow * rasterizer.screenCenterY() * rasterizer.yScale()) ;
                this._sverts[j].z     = this.verts[j].screen.w;
                this._sverts[j].w     = ow;
    
                if (this._sverts[j].x < -0.5)                        this._sverts[j].x = -0.5;
                if (this._sverts[j].x > (rasterizer.width() - 0.5))  this._sverts[j].x = rasterizer.width() - 0.5;
                if (this._sverts[j].y < -0.5)                        this._sverts[j].y = -0.5;
                if (this._sverts[j].y > (rasterizer.height() - 0.5)) this._sverts[j].y = rasterizer.height() - 0.5;
    
//        		if (rasterizer.PerspectiveCorrect() == 0) ow = 1.0;
      		if (this.render_type != POLY_PERSPECTIVE_TEXTURED) ow = 1.0;
        
                this._sverts[j].u = this.verts[j].texture.x * ow;
                this._sverts[j].v = this.verts[j].texture.y * ow;
                
                if (j<this.verts.length-1) this._sverts[j].next = this._sverts[j+1];
            }
            this._sverts[this.verts.length-1].next = undefined;
           return true;       
    }
    
    
    /**
     * function 
     */
    Visible(camera) {
            if (super.Visible(camera)==false) return false; 
            var res=this._plane.Classify(camera.position);
            if (res==BACK)  return false;
            return true;
    }
    
    /**
     * function 
     */
    
    /**
     * function 
     */
    
    TransformToScreen(xform) {
            var	codeOff = -1;
            var	codeOn = 0;
            var code=0;
            
            for (let j = 0; j < this._verts.length; j++)
            {
                let w= this._verts[j].world;
                var s= xform.concat(w);
                
                this._verts[j].screen.x=s.x;
                this._verts[j].screen.y=s.y;
                this._verts[j].screen.z=s.z;
                this._verts[j].screen.w=s.w
                
                code =	(s.x >  s.w ?  1:0) | (s.x < -s.w ?  2:0) |
                        (s.y >  s.w ?  4:0) | (s.y < -s.w ?  8:0) |
                        (s.z <  0.0 ? 16:0) | (s.z >  s.w ? 32:0);
                codeOff &= code;
                codeOn  |= code;
            }
            
            super.TransformToScreen(xform);
            return new Array(codeOff,codeOn);
    }
    
    ClearVerts() {this._verts= new Array();}
    
    /**
     * function 
     */
    get vertices() {return this._verts}
    
    /**
     * function 
     */
    get verts() {return this._verts}
    get sverts() {return this._sverts}
    
    /**
     * function 
     */
    SetTestColor() {
            var a=new Vector3(128,128,128);
    
            for (let i=0;i<this.verts.length;i++)
            {
                var c=new Vector3(this.verts[i].world);
                c.normalize();
                this.verts[i].color=a.add(c.mul(128));
    
            }
     
     
        }
    /**
     * function 
     */
    
        toStr() {
            var s="";
            for (let i=0;i<this.verts.length;i++)
            {
               let v=this.verts[i];
               s+="w:"+v.world.x+" "+v.world.y+" "+v.world.z+" | "+"t:"+v.texture.x+" "+v.texture.y+" | "+"s:"+v.screen.x+" "+v.screen.y+" "+v.screen.z+" "+v.screen.w+" \n";
    
            }
            return s;
        }  
    /**
     * function 
     */
    
        SetNormalColor(r=1,g=1,b=1)
        {
            this.calcPlane();
            for (let i=0;i<this.verts.length;i++)
            {
                var n=new Vector3(this.verts[i].world);
                n.normalize();
                this.verts[i].color=n.mul(0.5).add(new Vector3(0.5,0.5,0.5)); 
                
            }
    
        }

        SetNormalGray()
        {
            this.calcPlane();
            let n = this._plane.normal.mul(0.5).add(new Vector3(0.5,0.5,0.5)); 
            let g=LUMA_REC709(n.x,n.y,n.z);
            for (let i=0;i<this.verts.length;i++)
            {
                this.verts[i]._color.x=g;
                this.verts[i]._color.y=g;
                this.verts[i]._color.z=g;
            }
    
        }
    /**
     * function 
     */
    SetColor(r=1,g=1,b=1)
        {
            
            
            var c= new Vector3(r|0,g|0,b|0);
            //var c= new Vector3(this.plane.normal.x*r,this.plane.normal.y*g,this.plane.normal.z*b);
            for (let i=0;i<this.verts.length;i++)
            {
                this.verts[i].color=c;
    
            }
    
        }
    
    /**
     * function 
     */
    
    Render(rasterizer) {
     
        if (this._sverts.length < 3) return;
         //  DrawTexture(this._sverts,dummy_texture,rasterizer.canvas,rasterizer,rasterizer.width())
        return true;
        
    }
    
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
     ClassifyByFrustum(frustum) {
      var f= frustum.planes[0];
      for (let i=0;i<frustum.planes.length;i++) {
          var f= frustum.planes[i];
          var res=f.Classify(this);
          if (res==BACK || res==SPANNING)  return res;
      }
      return FRONT;
     }
    

     ClipPolyByPlane(plane,poly) 
     {
       var npoly=new Polygon();
       npoly.CoppyAttribs(this,false);
    
       for (let i=0;i<poly.verts.length;i++)
       {
         var j=(i+1) % poly.verts.length;
         var v0=poly.verts[i];
         var v1=poly.verts[j];
         var res0=plane.Classify(v0);
         var res1=plane.Classify(v1);
    
         
         if (res0==COPLANAR) {
           npoly.AddVert(new Vert(v0)); 
           continue;
         }
         if (res0==FRONT) 
         { 
           npoly.AddVert(new Vert(v0)); 
         }
         
         if ((res1==FRONT && res0==BACK) || (res0==FRONT && res1==BACK))
         {
           var aDot=v0.world.dot(plane.normal);
           var bDot=v1.world.dot(plane.normal);
           var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
           var v=new Vert();
    
           v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                                  v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                                  v0.world.z + (scaled * (v1.world.z - v0.world.z)));
    
           v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                                 (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                                 (v0.color.z + (scaled * (v1.color.z - v0.color.z))) );
    
    
                              
            v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)),v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));      
    
           npoly.AddVert(v);
         }
       }  
    
       if (npoly.verts.length < 3) return undefined;
        npoly.calcPlane();
        return npoly;
     }
    







SplitPolyByPlane(plane) 
     {
       var fpoly=new Polygon();
       var bpoly=new Polygon();

       fpoly.CoppyAttribs(this,false);
       bpoly.CoppyAttribs(this,false);

       for (let i=0;i<this.verts.length;i++)
       {
         var j=(i+1) % this.verts.length;
         var v0=this.verts[i];
         var v1=this.verts[j];
         var res0=plane.Classify(v0);
         var res1=plane.Classify(v1);
    
         
         if (res0==COPLANAR ) {
           fpoly.AddVert(new Vert(v0)); 
           bpoly.AddVert(new Vert(v0)); 
         }
    
         if (res0==FRONT) 
         { 
           fpoly.AddVert(new Vert(v0)); 
         }

         if (res0==BACK) 
         { 
           bpoly.AddVert(new Vert(v0)); 
         }
         




         if ((res0==FRONT && res1==BACK) || (res1==FRONT && res0==BACK))
         {
           var aDot=v0.world.dot(plane.normal);
           var bDot=v1.world.dot(plane.normal);
           var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
           var v=new Vert();
    
           v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                                 v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                                 v0.world.z + (scaled * (v1.world.z - v0.world.z)));
    
           v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                                 (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                                 (v0.color.z + (scaled * (v1.color.z - v0.color.z))) );
    
    
                              
            v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)),v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));      
    
           fpoly.AddVert(new Vert(v));
           bpoly.AddVert(new Vert(v));
         }
       }  
       bpoly.SetNormalColor(1,0,0);
       fpoly.SetNormalColor(0,1,0);
       
       if (fpoly.verts.length < 3) fpoly=null;
        else fpoly.calcPlane();

       if (bpoly.verts.length < 3) bpoly=null;
        else bpoly.calcPlane();

        return [fpoly,bpoly];
     }
    









     ClipByFrustum (frustum){
    
        var p=this;
      var res=this.ClassifyByFrustum(frustum); //Hakki
      if (res==BACK) return [undefined,-1];
      if (res==FRONT) return [p,0];
      
      var clip=0;
      for (let i=0;i<frustum.planes.length;i++)
      {
         if (frustum.planes[i].Classify(p)==SPANNING) {

           var p2=this.ClipPolyByPlane(frustum.planes[i],p);
           if (p2!=undefined) p=p2;
            clip=1;
          }
      }
      return [p,clip];
    }
    
    
}
    
class IndexedObject extends PrimitiveBase {
    constructor (a=undefined,b=undefined,indecesPerPolygon=0) {
        super(); 
        this._planes = new Array();
        this._verts = new Array();
        this._indices = new Int32Array();
        this._ipp =indecesPerPolygon;
        this._recal_center=true;
        
        if (a instanceof IndexedObject && Int32Array.isArray(b))
        {
        }


        if (Array.isArray(b) && Int32Array.isArray(b)) 
        {
            if (a[0] instanceof Vert) {
                this._indices.set(b);
                for (let i=0;i<a.length();i++) {
                    this._verts.push(new Vert(a[i]));
                }
                return; 
            }

            if (a[0] instanceof Vector3) {
                this._indices.set(b);
                for (let i=0;i<a.length();i++) {
                    this._verts.push(new Vert(a[i]));
                }
                return; 
            }


        }


    }


    get planes()  {return this._planes;}
    get vertices()   {return this._verts;}
    get indices() {return this._indices;}
    get ipp()     {return this._ipp;} 
    
    calcCenterOfMass() {
        
        if (!this._recal_center && this._verts.length<3) return this._plane;
        this._center=new Vector3(this._verts.world);
        this._recal_center=false;


        for (let i=1;i<this._verts.length;i++)
        {
            this._center=this._center.add(this._verts[i].world);
        }
        var m=1.0 / this._verts.length;
        this._center=this._center.mul(m);  
        return this._center;
    }
          
    TransformByObjectMatrix() {
        var p=new IndexedObject();
        var matrix= this.GetObjectMatrix();;
                  
        for (let i=0;i<this.vertices.length;i++)
        {
            var w= new Vert(this.vertices[i]);
            var h=matrix.concat(w.world);
            w.world.x=h.x;
            w.world.y=h.y;
            w.world.z=h.z;
            
            p.AddVert(w); 
        }

        p.calcCenterOfMass();
        p.calcPlanes();
        return p;
    }

}
