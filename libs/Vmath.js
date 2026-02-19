/////////////////////////////////////////////////////////////////////////////////////////////
//
// SameType ersetzt durch instanceof 
//
/////////////////////////////////////////////////////////////////////////////////////////////



class Matrix {
  constructor(N=1,M=1) {
    
    
        this._N=N;
        this._M=M;
        this._size=N*M;
        this._data = new Array(this._size);
        this._data[0]=0;
        for (let i=0;i<this._data.length;i++) this._data[i]=0;
        
    }


   toStr() {
    let s="" ;
	  for (let i = 0; i < this._N; i++)
	{
		s+= "[";
		for (let j = 0; j < this._M; j++)
		{
      var h=this.GetData(i, j).toFixed(5);
      s+=" "+h.padStart(12,".");
		}
		s += " ]";
    if (this._M>1)s += "\n";
	}
	
	s +=  "";
	return s;
   }


    get M() { return this._M;}
    get N() { return this._N;}
    get Data() {return this._data; }
    get Size() {return this._size;}
    
    get x() {assert(this._N > 0); return this._data[0];}
    get y() {assert(this._N > 1); return this._data[1];}
    get z() {assert(this._N > 2); return this._data[2];}
    get w() {assert(this._N > 3); return this._data[3];}

    get u() {assert(this._N > 0); return this._data[0];}
    get v() {assert(this._N > 1); return this._data[1];}

    set u(a) {assert(this._N > 0);this._data[0]=a;}
    set v(a) {asert(this._N > 1);this._data[1]=a;}


    set x(a) {assert(this._N > 0);this._data[0]=a;}
    set y(a) {assert(this._N > 1);this._data[1]=a;}
    set z(a) {assert(this._N > 2);this._data[2]=a;}
    set w(a) {assert(this._N > 3);this._data[3]=a;}

    Init(m) {
        //assert(this.M==m.M && this.N==m.N );
        for (let i=0;i<this._size;i++) this._data[i]=m.Data[i];
      }

    cross(m)
				{
					assert(this._N >= 3);

					let	tx = this.y * m.z - this.z * m.y;
					let	ty = this.z * m.x - this.x * m.z;
					let	tz = this.x * m.y - this.y * m.x;
          return new Vector3(tx,ty,tz);
           
    }


    newNxM() {
      var outp=undefined;
      if (this._M==1) {
        if(this._N==2)  outp = new Vector2();
        if(this._N==3)  outp = new Vector3();
        if(this._N==4)  outp = new Vector4();

      }  

      if (this._M==3) {
        if(this._N==3)  outp = new Matrix3x3();

      }  
      if (this._M==4) {
        if(this._N==4)  outp = new Matrix4x4();

      }  
      return outp; 
    }

    dot(m) 
		{
					let	result = 0;
					for (let i = 0; i < this._N; i++) result += this._data[i] * m.Data[i];
					return result;
		}

    add(v) {
       
     


      var outp = this.newNxM();//new Matrix(this._N,this._M);
           

      if (typeof v === "number" ) 
      {
        if (!Number.isFinite(v)) return outp;
        for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]+v;
        return outp;
      }
      
      
      
      for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]+v.Data[i];
      return outp;
    }

    sub(v) {
      var outp = this.newNxM();//new Matrix(this._N,this._M);
      if (typeof v === "number") {
        if (!Number.isFinite(v)) return outp;
        for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]-v;
        return outp;
      }
      for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]-v.Data[i];
      return outp;
    }

    mul(v) {
      var outp = this.newNxM();//new Matrix(this._N,this._M);
      
      if (typeof v === "number") {
         if (!Number.isFinite(v)) return outp;
        for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]*v;
        return outp;
      }
      if (this.M != v.M || this.N != v.N)
      {
        console.log(typeof v);
        console.log(this.M+" "+v.M+"  "+this.N+" "+v.N+" --> "+v);
      }

      for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]*v.Data[i];
      return outp;
    }

    div(v) {
      var outp = this.newNxM();//new Matrix(this._N,this._M);
      if (typeof v === "number") {
        if (!Number.isFinite(v)) return outp;
        let a=1.0/v;
        for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]*a;
        return outp;
      }
      for (let i=0;i<this._size;i++) outp.Data[i]=this._data[i]/v.Data[i];
      return outp;
    }

    total()
				{
					let	tot =  0;
					for (let i = 0; i < this._size; i++) tot += this._data[i];
					return tot;
		}
 
    GetData(i,j)   
    {
    
         return this._data[j*this._M+i]
    }    

    m(i,j)   
        {
          return this._data[j*this._M+i]
    }    


    SetData(i,j,d)   
        {
          this._data[(j*this._M)+i]=d;
    }    

    convertTo2DArray() {
      var a=new Array();
      a.length=this._N;
      
      for (let y=0;y<this._N;y++) a[y]= new Array(this._M);
        
      


      for (let y=0;y<this._M;y++)
      {
        for (let x=0;x<this._N;x++)
        {
           a[x][y]=this.GetData(x,y);
        }
      }

      return a;
    }

    transpose()
				{
					assert(this._N == this._M);


					let result = new Matrix(this._N,this._M);
					for (let j = 0; j < this._M; j++)
					{
						for (let i = 0; i < this._N; i++)
						{
		          
              result.SetData(j,i,this.GetData(i,j));
						}
					}
          for (let k=0;k<this._M*this._N;k++) this._data[k] = result.Data[k];
	  }
        
    determinant()
				{
					assert(this._N == 4 && this._M == 4);
             
					
					return	  (this.m(0,0) * this.m(1,1) - this.m(1,0) * this.m(0,1)) * (this.m(2,2) * this.m(3,3) - this.m(3,2) * this.m(2,3))
						- (this.m(0,0) * this.m(2,1) - this.m(2,0) * this.m(0,1)) * (this.m(1,2) * this.m(3,3) - this.m(3,2) * this.m(1,3))
						+ (this.m(0,0) * this.m(3,1) - this.m(3,0) * this.m(0,1)) * (this.m(1,2) * this.m(2,3) - this.m(2,2) * this.m(1,3))
						+ (this.m(1,0) * this.m(2,1) - this.m(2,0) * this.m(1,1)) * (this.m(0,2) * this.m(3,3) - this.m(3,2) * this.m(0,3))
						- (this.m(1,0) * this.m(3,1) - this.m(3,0) * this.m(1,1)) * (this.m(0,2) * this.m(2,3) - this.m(2,2) * this.m(0,3))
						+ (this.m(2,0) * this.m(3,1) - this.m(3,0) * this.m(2,1)) * (this.m(0,2) * this.m(1,3) - this.m(1,2) * this.m(0,3));
		}

    invert()
				{
          assert(this._N == 4 && this._M == 4);
        
					let	d = this.determinant();
					if (d == 0.0) return;

					d = 1.0 / d;
          
					
					var result = new Matrix(this._N,this._M);
					result.SetData(0,0, d * (this.m(1,1) * (this.m(2,2) * this.m(3,3) - this.m(3,2) * this.m(2,3)) + this.m(2,1) * (this.m(3,2) * this.m(1,3) - this.m(1,2) * this.m(3,3)) + this.m(3,1) * (this.m(1,2) * this.m(2,3) - this.m(2,2) * this.m(1,3))));
					result.SetData(1,0, d * (this.m(1,2) * (this.m(2,0) * this.m(3,3) - this.m(3,0) * this.m(2,3)) + this.m(2,2) * (this.m(3,0) * this.m(1,3) - this.m(1,0) * this.m(3,3)) + this.m(3,2) * (this.m(1,0) * this.m(2,3) - this.m(2,0) * this.m(1,3))));
					result.SetData(2,0, d * (this.m(1,3) * (this.m(2,0) * this.m(3,1) - this.m(3,0) * this.m(2,1)) + this.m(2,3) * (this.m(3,0) * this.m(1,1) - this.m(1,0) * this.m(3,1)) + this.m(3,3) * (this.m(1,0) * this.m(2,1) - this.m(2,0) * this.m(1,1))));
					result.SetData(3,0, d * (this.m(1,0) * (this.m(3,1) * this.m(2,2) - this.m(2,1) * this.m(3,2)) + this.m(2,0) * (this.m(1,1) * this.m(3,2) - this.m(3,1) * this.m(1,2)) + this.m(3,0) * (this.m(2,1) * this.m(1,2) - this.m(1,1) * this.m(2,2))));
					result.SetData(0,1, d * (this.m(2,1) * (this.m(0,2) * this.m(3,3) - this.m(3,2) * this.m(0,3)) + this.m(3,1) * (this.m(2,2) * this.m(0,3) - this.m(0,2) * this.m(2,3)) + this.m(0,1) * (this.m(3,2) * this.m(2,3) - this.m(2,2) * this.m(3,3))));
					result.SetData(1,1, d * (this.m(2,2) * (this.m(0,0) * this.m(3,3) - this.m(3,0) * this.m(0,3)) + this.m(3,2) * (this.m(2,0) * this.m(0,3) - this.m(0,0) * this.m(2,3)) + this.m(0,2) * (this.m(3,0) * this.m(2,3) - this.m(2,0) * this.m(3,3))));
					result.SetData(2,1, d * (this.m(2,3) * (this.m(0,0) * this.m(3,1) - this.m(3,0) * this.m(0,1)) + this.m(3,3) * (this.m(2,0) * this.m(0,1) - this.m(0,0) * this.m(2,1)) + this.m(0,3) * (this.m(3,0) * this.m(2,1) - this.m(2,0) * this.m(3,1))));
					result.SetData(3,1, d * (this.m(2,0) * (this.m(3,1) * this.m(0,2) - this.m(0,1) * this.m(3,2)) + this.m(3,0) * (this.m(0,1) * this.m(2,2) - this.m(2,1) * this.m(0,2)) + this.m(0,0) * (this.m(2,1) * this.m(3,2) - this.m(3,1) * this.m(2,2))));
					result.SetData(0,2, d * (this.m(3,1) * (this.m(0,2) * this.m(1,3) - this.m(1,2) * this.m(0,3)) + this.m(0,1) * (this.m(1,2) * this.m(3,3) - this.m(3,2) * this.m(1,3)) + this.m(1,1) * (this.m(3,2) * this.m(0,3) - this.m(0,2) * this.m(3,3))));
					result.SetData(1,2, d * (this.m(3,2) * (this.m(0,0) * this.m(1,3) - this.m(1,0) * this.m(0,3)) + this.m(0,2) * (this.m(1,0) * this.m(3,3) - this.m(3,0) * this.m(1,3)) + this.m(1,2) * (this.m(3,0) * this.m(0,3) - this.m(0,0) * this.m(3,3))));
					result.SetData(2,2, d * (this.m(3,3) * (this.m(0,0) * this.m(1,1) - this.m(1,0) * this.m(0,1)) + this.m(0,3) * (this.m(1,0) * this.m(3,1) - this.m(3,0) * this.m(1,1)) + this.m(1,3) * (this.m(3,0) * this.m(0,1) - this.m(0,0) * this.m(3,1))));
					result.SetData(3,2, d * (this.m(3,0) * (this.m(1,1) * this.m(0,2) - this.m(0,1) * this.m(1,2)) + this.m(0,0) * (this.m(3,1) * this.m(1,2) - this.m(1,1) * this.m(3,2)) + this.m(1,0) * (this.m(0,1) * this.m(3,2) - this.m(3,1) * this.m(0,2))));
					result.SetData(0,3, d * (this.m(0,1) * (this.m(2,2) * this.m(1,3) - this.m(1,2) * this.m(2,3)) + this.m(1,1) * (this.m(0,2) * this.m(2,3) - this.m(2,2) * this.m(0,3)) + this.m(2,1) * (this.m(1,2) * this.m(0,3) - this.m(0,2) * this.m(1,3))));
					result.SetData(1,3, d * (this.m(0,2) * (this.m(2,0) * this.m(1,3) - this.m(1,0) * this.m(2,3)) + this.m(1,2) * (this.m(0,0) * this.m(2,3) - this.m(2,0) * this.m(0,3)) + this.m(2,2) * (this.m(1,0) * this.m(0,3) - this.m(0,0) * this.m(1,3))));
					result.SetData(2,3, d * (this.m(0,3) * (this.m(2,0) * this.m(1,1) - this.m(1,0) * this.m(2,1)) + this.m(1,3) * (this.m(0,0) * this.m(2,1) - this.m(2,0) * this.m(0,1)) + this.m(2,3) * (this.m(1,0) * this.m(0,1) - this.m(0,0) * this.m(1,1))));
					result.SetData(3,3, d * (this.m(0,0) * (this.m(1,1) * this.m(2,2) - this.m(2,1) * this.m(1,2)) + this.m(1,0) * (this.m(2,1) * this.m(0,2) - this.m(0,1) * this.m(2,2)) + this.m(2,0) * (this.m(0,1) * this.m(1,2) - this.m(1,1) * this.m(0,2))));
					for (let k=0;k<this._M*this._N;k++) this._data[k] = result.Data[k];
		}


    fill(value)
				{
					for (let i = 0; i < this._N*this._M; i++) this._data[i]=value;
		}

    lengthSquared()
    {
      
      return this.dot(this);
    }
 
    length() 
    {
      
      return Math.sqrt(this.lengthSquared());
    }

    setLength(len)
    {
      
      let ll=this.length();
      let	l = 0;
      if (ll !=0) l=len / ll;         

      this._data[0]*=l;
      this._data[1]*=l;
      this._data[2]*=l;
      //this.x = this.x*l;
      //this.y = this.y*l;
      //this.z = this.z*l;
    }

    distance(m) 
    {
      var temp= this.sub(m);
      
      return temp.length();
    }

    normalize()
    {
      this.setLength(1);
      if (Math.abs(this._data[0])<Number.EPSILON)this._data[0]=0;
      if (Math.abs(this._data[1])<Number.EPSILON)this._data[1]=0;
      if (Math.abs(this._data[2])<Number.EPSILON)this._data[2]=0;
      
    }

    setXVector(m)
    {
      for (let  i = 0; i < this._N; i++)
      {
        this.SetData(i,0,m.GetData(i,0));
      }
    }
 
    setYVector(m)
    {
      for (let i = 0; i < this._N; i++)
      {
        this.SetData(i,1,m.GetData(i,0));
      }
    }
 
    setZVector(m)
    {
      for (let i = 0; i < this._N; i++)
      { 
        this.SetData(i,2,m.GetData(i,0)); 
      }
    }


    extractXVector()
    {
      var n= new Vector3(0,0,0);
      for (let  i = 0; i < this._N; i++)
      {
        n.SetData(i,0,this.GetData(i,0));
      }
      return n;
    }

    extractYVector(m)
    {
      var n= new Vector3();
      for (let i = 0; i < this._N; i++)
      {
        n.SetData(i,0,this.GetData(i,1));
      }
      return n;
    }


    extractZVector(m)
    {
      var n= new Vector3();
      for (let i = 0; i < this._N; i++)
      { 
        n.SetData(i,0,this.GetData(i,2)); 
        
      }
      return n;
    }
  
    static lookat(v, theta = 0)
    {
      var	zAxis = new Vector3(v);
      
      zAxis.normalize();
      var yAxis=new Vector3();;
      yAxis.fill(0);
      
      if (!zAxis.x && !zAxis.z)	yAxis.z = -zAxis.y;
      else	yAxis.y =  1;
  
      var	xAxis = new Vector3(yAxis.cross(zAxis));
      
      xAxis.normalize();
      yAxis = xAxis.cross(zAxis);
      yAxis.normalize();
      yAxis = yAxis.mul(-1);
      var m=new Matrix3x3(xAxis, yAxis, zAxis);
      return m.concat(this.zRotation(theta));
    }

    orthoNormalize()
    {
      assert(this._N == 3 && this._M == 3);

      var	xVector = this.extractXVector();
      var	yVector = this.extractYVector();
      var	zVector = this.extractZVector();

     // xVector -= yVector * (xVector * yVector);
     // xVector -= zVector * (xVector * zVector);
      xVector=xVector.sub(yVector.mul(xVector.mul(yVector)));
      xVector=xVector.sub(zVector.mul(xVector.mul(zVector)));
      xVector.normalize();

      //yVector -= xVector * (yVector * xVector);
      //yVector -= zVector * (yVector * zVector);
      yVector=yVector.sub(xVector.mul(yVector.mul(xVector)));
      yVector=yVector.sub(zVector.mul(yVector.mul(zVector)));
      yVector.normalize();

      zVector = new Vector3(xVector.cross(yVector));

      this.setXVector(xVector);
      this.setYVector(yVector);
      this.setZVector(zVector);
    }

    abs()
    {
      for (let i = 0; i < this._N*this._M; i++)
        this._data[i] = Math.abs(this._data[i]);
    }

    static	projectPerspectiveD3D(fov, aspect, n, f)
				{
					var	w  = 1 / Math.tan(fov /  2);
					var	h  = 1 / Math.tan(fov /  2);
					if (aspect > 1.0)	w /= aspect;
					else			h *= aspect;
					var	q  = f / (f - n);

					var result= new Matrix4x4();
					result.fill(0);
					result.SetData(0,0, w);
					result.SetData(1,1, h);
					result.SetData(2,2, q);
					result.SetData(3,2, -q*n);
					result.SetData(2,3,1);
					return result;
		}

    static	projectPerspectiveBlinn(fov,aspect,n,f)
				{
					var	w  = Math.cos(fov /  2);
					var	h  = Math.cos(fov /  2);
					if (aspect > 1.0)	w /= aspect;
					else			h *= aspect;
					var	s  = Math.sin(fov /  2); // ???
					var	d  =  1 - n/f;


         

					var	result= new Matrix4x4();
					result.fill(0);
					result.SetData(0,0,w);
					result.SetData(1,1,h);
					result.SetData(2,2,s / d);
					result.SetData(3,2,-(s * n / d));
					result.SetData(2,3, s);
					return result;
		}

    static	projectPerspectiveGlFrustum(l,r,b,t,n,f)
	  {
					var result= new Matrix4x4();
					result.fill(0);
					result.SetData(0,0, (2*n)/(r-l));
					result.SetData(2,0, (r+l)/(r-l));
					result.SetData(1,1, (2*n)/(t-b));
					result.SetData(2,1, (t+b)/(t-b));
					result.SetData(2,2, (-(f+n))/(f-n));
					result.SetData(3,2, (-2*f*n)/(f-n));
					result.SetData(2,3, -1);
					return result;
		}

    static projectGlOrtho(l,r,b,t,n,f)
  	{
					var result= new Matrix4x4();
					result.fill(0);
					result.SetData(0,0,2/(r-l));
					result.SetData(3,0, -((r+l)/(r-l)));
					result.SetData(1,1, 2/(t-b));
					result.SetData(3,1,-((t+b)/(t-b)));
					result.SetData(2,2, (-2)/(f-n));
					result.SetData(3,2, -((f+n)/(f-n)));
					result.SetData(3,3, 1);
					return result;
		}

    static projectOrtho(xScale,yScale)
		{
          
					var result= new Matrix4x4();
					result.fill(0);
					result.SetData(0,0,xScale);
					result.SetData(1,1,yScale);
					result.SetData(3,3,1);
					return result;
		}


  }







class Vector2 extends Matrix {
  constructor(x=undefined,y=undefined) {
    super(2,1);

    if (x instanceof Vector2 || (x instanceof Matrix  && x.M===2 && x.N==1)) 
    {
      this.Init(x);
      return;
    }
    if (!((typeof x === "number" ) && (typeof y === "number" ) ))
    {
      return;
    } 


    if (x!==undefined || Number.isFinite(x)) {this.x=x;} else return; 
    if (y!==undefined || Number.isFinite(y)) {this.y=y;} else return;
    
      
    
  }
}

class Vector3 extends Matrix {
  constructor(x=0,y=0,z=0) {
    super(3,1);

    
    if (x instanceof Vector3 || (x instanceof Matrix  && x.M===3 && x.N==1)) 
    {
      this.Init(x);
      return;
    }
  
    if (!((typeof x === "number" ) && (typeof y === "number" ) && (typeof z === "number" )))
    {
      return;
    } 


    if (x!==undefined || Number.isFinite(x)) {this.x=x;} else return; 
    if (y!==undefined || Number.isFinite(y)) {this.y=y;} else return;
    if (z!==undefined || Number.isFinite(z)) {this.z=z;} else return;
    


  }
   swap(swap_axis="")
  {
       if (swap_axis=="xy" || swap_axis=="yx") {
           let t=this.y;
           this.y=this.x;
           this.x=t;
       }

       if (swap_axis=="xz" || swap_axis=="zx") {
           let t=this.x;
           this.x=this.z;
           this.z=t;
       }

       if (swap_axis=="yz" || swap_axis=="zy") {
           let t=this.y;
           this.y=this.z;
           this.z=t;
       }
      }
}

class Vector4 extends Matrix {
  constructor(x=undefined,y=undefined,z=undefined,w=undefined) {
    super(4,1);
      
    if (x instanceof Vector4 || (x instanceof Matrix  && x.M===4 && x.N==1)) 
    {
      this.Init(x);
      return;
    }

    if (!((typeof x === "number" ) && (typeof y === "number" ) && (typeof z === "number" ) && (typeof w === "number" )))
    {
      return;
    } 


    if (x!==undefined || Number.isFinite(x)) {this.x=x;} else return; 
    if (y!==undefined || Number.isFinite(y)) {this.y=y;} else return;
    if (z!==undefined || Number.isFinite(z)) {this.z=z;} else return;
    if (w!==undefined || Number.isFinite(w)) {this.w=w;} else return;

  }
}

class Matrix3x3 extends Matrix {
  constructor(v0=undefined,v1=undefined,v2=undefined,
              v3=undefined,v4=undefined,v5=undefined,
              v6=undefined,v7=undefined,v8=undefined) 
{
    super(3,3);
    
    
    if (v0 instanceof Matrix3x3) 
    {
      this.Init(v0);
      return;
    }
    var h1=new Vector3();
    var h2=new Matrix(3,1);


    if  ((v0 instanceof Vector3 || (v0 instanceof Matrix && v0.M===3 && v0.N ===1)) &&
         (v1 instanceof Vector3 || (v1 instanceof Matrix && v1.M===3 && v1.N ===1)) &&
         (v2 instanceof Vector3 || (v2 instanceof Matrix && v2.M===3 && v2.N ===1))) {
          this.setXVector(v0);
          this.setYVector(v1);
          this.setZVector(v2);
    
        }
    

    

    if (v0!==undefined && (typeof v0 === "number" && Number.isFinite(v0))) {this.Data[0]=v0;} else return;
    if (v1!==undefined && (typeof v1 === "number" && Number.isFinite(v1))) {this.Data[1]=v1;} else return;
    if (v2!==undefined && (typeof v2 === "number" && Number.isFinite(v2))) {this.Data[2]=v2;} else return;
    if (v3!==undefined && (typeof v3 === "number" && Number.isFinite(v3))) {this.Data[3]=v3;} else return;
    if (v4!==undefined && (typeof v4 === "number" && Number.isFinite(v4))) {this.Data[4]=v4;} else return;
    if (v5!==undefined && (typeof v5 === "number" && Number.isFinite(v5))) {this.Data[5]=v5;} else return;
    if (v6!==undefined && (typeof v6 === "number" && Number.isFinite(v6))) {this.Data[6]=v6;} else return;
    if (v7!==undefined && (typeof v7 === "number" && Number.isFinite(v7))) {this.Data[7]=v7;} else return;
    if (v8!==undefined && (typeof v8 === "number" && Number.isFinite(v8))) {this.Data[8]=v8;} else return;

  }

  concat(m) 
  {
   
    
    if (m instanceof Vector3)
    {
        var result= new Vector3();
        result.fill( 0);
        for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
        result.SetData(i,0, result.m(i,0)+  this.m(j,i) * m.m(j,0));
        return result;      
    }

    if (m instanceof Vector4)
    {
        var result= new Vector4();
        result.fill( 0);
        for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
        result.SetData(i,0, result.m(i,0)+  this.m(j,i) * m.m(j,0));
        return result;      
    }
    var	result= new Matrix(3,3);
    result.fill(0);
  
    for (let i = 0; i < 3 ; i++)
    for (let j = 0; j < 3 ; j++)
    for (let k = 0; k < 3; k++)
  
    result.SetData(i,j, result.m(i,j)+  this.m(i,k) * m.m(k,j));
  
    return result;
}

static identity()
{
    

    // Make it identity

    var result= new Matrix(3, 3);
    var ptr=0;
    
    for (let j = 0; j < 3; j++)
    {
      for (let i = 0; i < 3; i++, ptr++)
      {
        if (i == j)	result.Data[ptr] =  1;
        else	result.Data[ptr] =  0;
      }
    }
    return result;
}

 static	xRotation(theta)
  {
    

    let	result = this.identity();

    // Fill it in

    var	ct = Math.cos(theta);
    var	st = Math.sin(theta);
    result.SetData(1,1, ct);
    result.SetData(2,1, st);
    result.SetData(1,2,-st);
    result.SetData(2,2, ct);
    return result;
}

static		yRotation(theta)
  {
    let	result = this.identity();

    // Fill it in

    var	ct =  Math.cos(theta);
    var	st =  Math.sin(theta);
    result.SetData(0,0,  ct);
    result.SetData(2,0,  st);
    result.SetData(0,2, -st);
    result.SetData(2,2,  ct);
    return result;
}

static	zRotation(theta)
  {

    let	result = this.identity();

    // Fill it in

    var	ct = Math.cos( theta);
    var	st = Math.sin( theta);
    result.SetData(0,0, ct);
    result.SetData(1,0,-st);
    result.SetData(0,1, st);
    result.SetData(1,1, ct);
    return result;
}

static rotation(xTheta, yTheta, zTheta)
{
    var z=this.zRotation(zTheta);
    var y=this.yRotation(yTheta);
    var x=this.xRotation(xTheta);
    
    var yx=y.concat(x);
    var xyz=yx.concat(z);
    return xyz;
}
  


static translation(m)
{
    var result= new Matrix(3,3);
    result = this.dentity();
    
    for (let i = 0; i < 3; i++)
    {
      
      result.SetData(2,i,result.GetData(2,i)+ m.GetData(i,0) ) ;
    }
    return new result;
}





}

class Matrix4x4 extends Matrix {

  compare( M) {
    if (M instanceof Matrix4x4) {
        if (M.M != this.M && M.N != this.N) return false;
        for (let i=0;i<this.Data.length;i++) if (M.Data[i] != this.Data[i]) return false;
        return true;
   }
    return false;

  }
  constructor(v0=undefined,v1=undefined,v2=undefined,v3=undefined,
              v4=undefined,v5=undefined,v6=undefined,v7=undefined,
              v8=undefined,v9=undefined,va=undefined,vb=undefined,
              vc=undefined,vd=undefined,ve=undefined,vf=undefined) 
    {
    super(4,4);

     
    if (v0 instanceof Matrix4x4)
    {
      this.Init(v0);
      return;
    }


    if  ((v0 instanceof Vector4 || (v0 instanceof Matrix && v0.M===4 && v0.N ===1)) &&
         (v1 instanceof Vector4 || (v1 instanceof Matrix && v1.M===4 && v1.N ===1)) &&
         (v2 instanceof Vector4 || (v2 instanceof Matrix && v2.M===4 && v2.N ===1)) &&
         (v3 instanceof Vector4 || (v3 instanceof Matrix && v3.M===4 && v3.N ===1))) 
         {
            this.Data[0]=v0.x;
            this.Data[1]=v0.y;
            this.Data[2]=v0.z;
            this.Data[3]=v0.w;

            this.Data[4]=v1.x;
            this.Data[5]=v1.y;
            this.Data[6]=v1.z;
            this.Data[7]=v1.w;

            this.Data[8]=v2.x;
            this.Data[9]=v2.y;
            this.Data[10]=v2.z;
            this.Data[11]=v2.w;

            this.Data[12]=v3.x;
            this.Data[13]=v3.y;
            this.Data[14]=v3.z;
            this.Data[15]=v3.w;
            return;   
    
        }



    if (v0!==undefined && (typeof v0 === "number" && Number.isFinite(v0))) {this.Data[0]=v0;} else return;
    if (v1!==undefined && (typeof v1 === "number" && Number.isFinite(v1))) {this.Data[1]=v1;} else return;
    if (v2!==undefined && (typeof v2 === "number" && Number.isFinite(v2))) {this.Data[2]=v2;} else return;
    if (v3!==undefined && (typeof v3 === "number" && Number.isFinite(v3))) {this.Data[3]=v3;} else return;
    if (v4!==undefined && (typeof v4 === "number" && Number.isFinite(v4))) {this.Data[4]=v4;} else return;
    if (v5!==undefined && (typeof v5 === "number" && Number.isFinite(v5))) {this.Data[5]=v5;} else return;
    if (v6!==undefined && (typeof v6 === "number" && Number.isFinite(v6))) {this.Data[6]=v6;} else return;
    if (v7!==undefined && (typeof v7 === "number" && Number.isFinite(v7))) {this.Data[7]=v7;} else return;
    if (v8!==undefined && (typeof v8 === "number" && Number.isFinite(v8))) {this.Data[8]=v8;} else return;

    if (v9!==undefined && (typeof v9 === "number" && Number.isFinite(v9))) {this.Data[9] =v9;}else return;
    if (va!==undefined && (typeof va === "number" && Number.isFinite(va))) {this.Data[10]=va;}else return;
    if (vb!==undefined && (typeof vb === "number" && Number.isFinite(vb))) {this.Data[11]=vb;}else return;
    if (vc!==undefined && (typeof vc === "number" && Number.isFinite(vc))) {this.Data[12]=vc;}else return;
    if (vd!==undefined && (typeof vd === "number" && Number.isFinite(vd))) {this.Data[13]=vd;}else return;
    if (ve!==undefined && (typeof ve === "number" && Number.isFinite(ve))) {this.Data[14]=ve;}else return;
    if (vf!==undefined && (typeof vf === "number" && Number.isFinite(vf))) {this.Data[15]=vf;}else return;

  }


  static LookAt2(eye,center, up )
  {
   var  Matrix = new Matrix4x4();
   
   

   var f=center.sub(eye);
   f.normalize();
   var u=new Vector3(up);
   u.normalize();
   
   var s=f.cross(u);
   s=s.cross(f);

   var h=new Vector3(-s.dot(eye),-u.dot(eye),f.dot(eye));   

   console.log("u:"+u.toStr());
   console.log("s:"+s.toStr());
   console.log("f:"+f.toStr());
   console.log("h:"+h.toStr());
   console.log("h:"+h.toStr());



/*
   var m= new Matrix4x4(s.x, s.x, s.x, 0,
          u.x, u.y, u.z, 0,
    -f.x, -f.y, -f.z, 0,
    h.x,h.y, h.z ,1);
*/
/*    
var m= new Matrix4x4(s.x, u.x, -f.x, h.x ,
  s.y, u.y, -f.y, h.y,
  s.z, u.z, -f.z, h.z,
  0.0, 0.0,  0.0, 1.0);
*/

var m= new Matrix4x4(s.x, s.y, s.z, 0 ,
                     u.x, u.y, u.z, 0,
                    -f.x, -f.y, -f.z, 0,
                     h.x, h.y, h.z, 1);

m.transpose();
                       
                       return m;
     

}

  static identity()
  {

    var result= new Matrix4x4();
    var ptr=0;
    
    for (let j = 0; j < 4; j++)
    {
      for (let i = 0; i < 4; i++, ptr++)
      {
        if (i == j)	result.Data[ptr] =  1;
        else	result.Data[ptr] =  0;
      }
    }
    return result;
  }

  static	xRotation(theta)
  {
    

    let	result = this.identity();

    // Fill it in

    var	ct =  Math.cos(theta);
    var	st =  Math.sin(theta);
    result.SetData(1,1, ct);
    result.SetData(2,1, st);
    result.SetData(1,2,-st);
    result.SetData(2,2, ct);
    return result;
  }

static		yRotation(theta)
  {
    let	result = this.identity();

    // Fill it in

    var	ct =  Math.cos(theta);
    var	st =  Math.sin(theta);
    result.SetData(0,0,  ct);
    result.SetData(2,0,  st);
    result.SetData(0,2, -st);
    result.SetData(2,2,  ct);
    return result;
  }

static	zRotation(theta)
  {

    let	result = this.identity();

    // Fill it in

    var	ct = Math.cos( theta);
    var	st = Math.sin( theta);
    result.SetData(0,0, ct);
    result.SetData(1,0,-st);
    result.SetData(0,1, st);
    result.SetData(1,1, ct);
    return result;
  }
  

concat(m) 
  {
     
    var p=4;  
    
      if (m instanceof Vector3)
      {
      var	res= new Vector4();
      var	mm= new Vector4(m.x,m.y,m.z,1);
      res.fill(0);
  
      for (let i = 0; i < 4; i++)
      {
					for (let j = 0; j < 4; j++)
          {
//			  		console.log(res.GetData(i,0)+this.GetData(j,i)*mm.GetData(j,0));
            res.SetData(i,0,res.GetData(i,0)+this.GetData(j,i)*mm.GetData(j,0));
          }
      }
          return res;
    };

    var	result= new Matrix4x4();
    result.fill(0);
    
    for (let i = 0; i < this._N; i++) {
       for (let j = 0; j < this._M; j++) {
        for (let k = 0; k < p; k++) {
            result.SetData(i,j,result.GetData(i,j)+this.GetData(i,k)*m.GetData(k,j));
        }
       }
      
    }  
    
    
    return result;
}



static translate(x,y,z) {
  var	result=Matrix4x4.identity();
					
  

  result.Data[3] = result.Data[3] + x;
  result.Data[7] = result.Data[7] + y;
  result.Data[11] = result.Data[11] + z;
  result.Data[15] = result.Data[15] + 1;



  return result;

}


static scale(x,y,z)
				{
					
           
					var	result=Matrix4x4.identity();
					
          result.SetData(0,0,result.m(0,0)*x);
					result.SetData(1,1,result.m(1,1)*y);
					result.SetData(2,2,result.m(2,2)*z);
					return result;
				}

static xyzRotation(xTheta, yTheta, zTheta)
{
  return this.rotation(xTheta, yTheta, zTheta);
}

static rotation(xTheta, yTheta, zTheta)
{
    var z=this.zRotation(zTheta);
    var y=this.yRotation(yTheta);
    var x=this.xRotation(xTheta);
    
    var yx=y.concat(x);
    var xyz=yx.concat(z);
    return xyz;
  }

  static translation(m)
  {
    var result= new Matrix4x4();
    result = this.identity();
    /*
    result.SetData(3,0,result.GetData(3,0)+m.x);
    result.SetData(3,1,result.GetData(3,1)+m.y);
    result.SetData(3,2,result.GetData(3,2)+m.z);
    result.SetData(3,3,result.GetData(3,3)+m.w);
*/
    
    for (let i = 0; i < 4; i++)
    {
      result.SetData(3,i,result.GetData(3,i)+ m.GetData(i,0) ) ;  
    }
    
    return result;
  }
}





/*
        concat(m) 
        {
          var	result= new Matrix(this._N,4);
          result.fill(0);
        
          for (let i = 0; i < this._N ; i++)
          for (let j = 0; j < this._N ; j++)
          for (let k = 0; k < this._N; k++)
        
          result.SetData(i,j, result.m(i,j)+  this.m(i,k) * this.m(k,j));
        
          return result;
      }

      */