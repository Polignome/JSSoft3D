/////////////////////////////////////////////////////////////////////////////////////////////
//
// SameType ersetzt durch instanceof 
//
/////////////////////////////////////////////////////////////////////////////////////////////


const BACK = -1
const COPLANAR = 0
const PLANAR = COPLANAR
const FRONT = 1
const SPANNING = 3

const XAXIS =0;
const YAXIS =1;
const ZAXIS =2;




function GetACopy(v) {
    if (v instanceof Vector2) return new Vector2(v);
    
    if (v instanceof Vector3) return new Vector3(v);
    
    if (v instanceof Vector4) return new Vector4(v);
    
    if (v instanceof Vert) {
    
        
        var h =new Vert();
        h.setWorld(v.world);
        h.setTexture(v.texture);
        h.setScreen(v.screen);
        return h;
    }
    return undefined;

}


class Ray {
  constructor(N=3) {
    this._nCalculated = false;
    this._lCalculated = false;
    this._dCalculated = false;
    
    if (N instanceof Ray) {
        
        this._N=N.N;

        if (this._N==2) {
            this._origin = new Vector2(N.origin);
            this._vector = new Vector2(N.vector);
            this._normal = new Vector2(N.normal);
         }
    
         if (this._N==3) {
            this._origin = new Vector3(N.origin);
            this._vector = new Vector3(N.vector);
            this._normal = new Vector3(N.normal);
         }
         if (this._N==4) {
            this._origin = new Vector4(N.origin);
            this._vector = new Vector4(N.vector);
            this._normal = new Vector4(N.normal);
         }
         
         this._length = N.length;
         this._D = N.D;
        
         return;

    } 
    
    
    
    this._N=N;
    
    
    if (N==2) {
        this._origin = new Vector2();
        this._vector = new Vector2();
        this._normal = new Vector2();
     }

     if (N==3) {
        this._origin = new Vector3();
        this._vector = new Vector3();
        this._normal = new Vector3();
     }
     if (N==4) {
        this._origin = new Vector4();
        this._vector = new Vector4();
        this._normal = new Vector4();
     }
 

     this._length = 0.0;
     this._D = 0.0;
 }

  calc(o,v) {
     this.origin=o;
     this.vector=v; 
    
     this._nCalculated=false;
     this._lCalculated=false;
     this._dCalculated=false;
  }
  get N() {return this._N;}

  get origin() {return this._origin;}
  get vector() {return this._vector;}
  get normal() {return this._normal;}
  get length() {return this._length;}

  get nCalculated() {return this._nCalculated;}
  get lCalculated() {return this._lCalculated;}
  get dCalculated() {return this._dCalculated;}


  set origin(a) {this._dCalculated = false; 

    if (this._N==2)  { this._origin = new Vector2(a);return;}
    if (this._N==3)  { this._origin = new Vector3(a);return;}
    if (this._N==4)  { this._origin = new Vector4(a);return;}

}
  set vector(a) {this._nCalculated = false; 
                 this._lCalculated = false; 
                 this._dCalculated = false;
                 if (this._N==2)  { this._vector = new Vector2(a);return;}
                 if (this._N==3)  { this._vector = new Vector3(a);return;}
                 if (this._N==4)  { this._vector = new Vector4(a);return;}
                 }
  
  set normal(a) {  if (this._N==2)  { this._normal = new Vector2(a);return;}
                   if (this._N==3)  { this._normal = new Vector3(a);return;}
                   if (this._N==4)  { this._normal = new Vector4(a);return;}
                }
  set length(a) {this._length = a;}
    
    
  static  CalcPlaneBy3Vectors(a, b , c,counterClock=false)
  {
    var v0=b.sub(a);
    var v1=c.sub(b);
    var ray = new Ray();
    var v3 =v1.cross(v0);
    if (!counterClock) v3=v3.mul(-1);
    ray.origin=a;
    ray.vector=v3;
    return ray;
  }
  

   toStr() {
    var s="N: "+this.N+"\n"+  
          "o: "+this.origin.toStr()+"\n"+
          "v: "+this.vector.toStr()+"\n"+
          "n: "+this.normal.toStr()+"\n"+
          "l: "+this.length+"\n"+
          "D: "+this.D+"\n";
          return s;
   }
  
   
   distance(point) 
   {
       let r=new Ray(3);
       r.origin=point;
       r.normal.x=-this.normal.x;
       r.normal.y=-this.normal.y;
       r.normal.z=-this.normal.z;
       
       return this.intersect(r)[1];
   }

   intersect(r) 
   {
       var o=new Array(false,0.0);   
       let time = 0.0;
       var	denom = this.normal.dot(r.normal);

       if (denom == 0) return 0;
       o[0]=true;
       let	numer = this.normal.dot(r.origin);

       o[1] = -((numer + this.D) / denom);

       return o;
   }

   closest(point)
   {
       let	t = this.distance(point);
       if (this._N==2) return new Vector2(point.sub( normal().mul( t)));
       if (this._N==3) return new Vector3(point.sub( normal().mul( t)));
       return new Vector4(point.sub( normal().mul( t)));
   }

   get length()
   {
       if (!this._lCalculated)
       {
        this._length = this.vector.length();
        this._lCalculated = true;
       }

       return this._length;
   }

   set length(len)
   {

       if (this._nCalculated)	this.vector = normal.mul(len);
       else	this._vector.setLength(len);

       this._length = len;
       this._lCalculated = true;
   }

   get D() {
   if (!this._dCalculated)
   {
       this._D = -(this.origin.dot(this.normal));
       this._dCalculated = true;
   }

   return this._D;
  }

  get normal() 
  {
		if (!this.nCalculated)
		{
			this.normal = this._vector;
			this._normal.normalize();
			this._nCalculated = true;
		}

		return this._normal;
	}

    end(len=undefined) {
        if (len==undefined) this.origin.add(this.vector);
        return this.origin.add(this.normal.mul(len));
        
    }

    closest(point) 
	{
		var	t = this.distance(point);
		return point.sub(this.normal().mul(t));
	}


    flush()
	{
		this._nCalculated = false;
		this._lCalculated = false;
		this._dCalculated = false;
	}

    Classify(v)  {
        
        if (v instanceof Polygon)
         {
//            console.log("------------- Prim");
            return this.Classify(v.verts);  
             
        }


        if (v instanceof  Vector3) {
  //          console.log("------------- vector");
            var dir = this.origin.sub(v);
            var e=dir.dot(this.normal);
            if (e<0) return FRONT;
            if (e>0) return BACK;
            return COPLANAR;
        }
        if (v instanceof Vert) {
    //        console.log("------------- vert");    
            var dir = this.origin.sub(v.world);
            var e=dir.dot(this.normal);
            if (e<0) return FRONT;
            if (e>0) return BACK;
            return COPLANAR;
        }

        if (v instanceof Array) {
        
            
      //      console.log("------------- Arry");
            var front=0;               
            var back=0;               
                           
            for (let i=0;i<v.length;i++) {
              var res=this.Classify(v[i]);
              if (res==FRONT) front++; else
              if (res==BACK) back++; 
              
            }
            if (back==0 && front > 0) return FRONT;
            if (back >0 && front == 0) return BACK;
            if (back > 0 && front > 0) return SPANNING;
            return COPLANAR;
              
        }



    }


   SplitList(v) {
        var front=new Array();
        var back=new Array();
        

        for (let i=0;i<v.length;i++) {
            let i2 = (i + 1) % v.length;
            
            var a = this.Classify(v[i]);
            var b = this.Classify(v[i2]);
            
            
            if ( a == COPLANAR) 
            {
                

                front.push(GetACopy(v[i]));
                back.push(GetACopy(v[i]));
                continue;
            }
            if(a == FRONT)
            {
                
                front.push(GetACopy(v[i]));
                
            }
            if (a == BACK) {
                
                back.push(GetACopy(v[i]));
                
            }
        

            if ((a == FRONT && b==BACK) || (a == BACK && b== FRONT)) 
            {
                   
                var h=this.Split(v[i],v[i2]);
                
                back.push(h);
                front.push(GetACopy(h));
            }
            
        } 

        return new Array(front,back);
    }



  GetAlignement() {
        var	absNormal = new Vector3(this.normal);
        absNormal.abs();
        if (absNormal.x >= absNormal.y && absNormal.x >= absNormal.z) return XAXIS; 
        if (absNormal.y >= absNormal.x && absNormal.y >= absNormal.z) return YAXIS;
        return ZAXIS;
    }


    Split(a, b) {
        var aDot   =0.0;
        var bDot   =0.0;
        var scaled =0.0;
        
        if (a instanceof Array)
        { 
            return this.SplitList(a);
        }


        if (a instanceof Primitive)
        {
            
            var v=this.Split(a.verts);
            
            if (b==FRONT && v[0].length) 
            {
              
                var p= new Primitive();
                p.AddVerts(v[0]);
                return p;
            }
            if (b==BACK && v[0].length)  {
            
                var p= new Primitive();
                p.AddVerts(v[1]);
                return p;
            }
            if (v[0].length && v[1].length) 
            {
            
              var pf= new Primitive();
              pf.AddVerts(v[0]);
              var pb= new Primitive();
              pb.AddVerts(v[1]);
              return new Array(pf,pb);
            }
            
            return undefined;
        } 

    


        if (a instanceof Vert)
        {
            aDot=a.world.dot(this.normal);
            bDot=b.world.dot(this.normal);
            scaled = ((-this._D) - aDot) / ((bDot - aDot));
            var v=new Vert();

            v.setWorld(new Vector3(a.world.x + (scaled * (b.world.x - a.world.x)),a.world.y + (scaled * (b.world.y - a.world.y)),a.world.z + (scaled * (b.world.z - a.world.z))));
            v.setColor(new Vector3(a.color.x + (scaled * (b.color.x - a.color.x)),
                                   a.color.y + (scaled * (b.color.y - a.color.y)),
                                   a.color.z + (scaled * (b.color.z - a.color.z))));
            v.setTexture( new Vector2(a.texture.x + (scaled * (b.texture.x - a.texture.x)),v.texture.y = a.texture.y + (scaled * (b.texture.y - a.texture.y))));      

           return v;            
    
        }



        aDot=a.dot(this.normal);
        bDot=b.dot(this.normal);
        
      
        scaled = (((-this._D) - aDot)) / ((bDot - aDot))
        
        return new Vector3(a.x + (scaled * (b.x - a.x)),a.y + (scaled * (b.y - a.y)),a.z + (scaled * (b.z - a.z)))

}





   
   
  

}

function lineLineIntersection(A,B,C,D){
    // Line AB represented as a1x + b1y = c1
    var a1 = B.y - A.y;
    var b1 = A.x - B.x;
    var c1 = a1*(A.x) + b1*(A.y);
    
    // Line CD represented as a2x + b2y = c2
    var a2 = D.y - C.y;
    var b2 = C.x - D.x;
    var c2 = a2*(C.x)+ b2*(C.y);
    
    var determinant = a1*b2 - a2*b1;
    
    if (determinant == 0)
    {
        // The lines are parallel. This is simplified
        // by returning a pair of FLT_MAX
        return undefined; new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
    }
    else
    {
        var x = (b2*c1 - b1*c2)/determinant;
        var y = (a1*c2 - a2*c1)/determinant;
        return new Vector2(x|0, y|0);
    }
}