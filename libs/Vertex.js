class Vert {

    set texture(a) {this._texture=new Vector2(a);}     
    set world(a)   {this._world=new Vector3(a);}     
    set screen(a)  {this._screen=new Vector4(a);}     
    set color(a)   {this._color=new Vector3(a);}
    set normal(a)   {this._normal=new Vector3(a);}
    set light(a)   {this._light=new Vector3(a);}
   

    get color()   {return this._color;}
    get texture() {return this._texture;}     
    get world()   {return this._world;}     
    get screen()  {return this._screen;}     
    get normal()  {return this._normal;}     
    get light()  {return this._light;}     

    scale(v) {
        let out=new Vert(this);
        out._world.x*=v;
        out._world.y*=v;
        out._world.z*=v;
        return out;
    }

    constructor(v,scale=1) {
        if (v instanceof Vert)
        {
            this._texture = new Vector2(v.texture);
            this._world   = v._world.mul(scale);//new Vector3(v.world);
            this._screen  = new Vector4(v.screen);
            this._color   = new Vector3(v.color);
            this._normal  = new Vector3(v.normal);
            this._light   = new Vector3(v.light);
           return;
       }
      
        if (v instanceof Vector3)
        {
           this._texture = new Vector2();
           this._world   = v.mul(scale);//new Vector3(v);
           this._screen  = new Vector4();
           this._color   = new Vector3(1,1,1);
           this._normal  = new Vector3();
           this._light   = new Vector3(1,1,1);

           return;
      }

      this._texture = new Vector2();
      this._world   = new Vector3();
      this._screen  = new Vector4();
      this._color   = new Vector3(1,1,1);
      this._light   = new Vector3(0,0,0);
      this._normal  = new Vector3();

    }

    WorldToColor() {
        var n= new Vector3(this._world);
        n.normalize();
        var r = (128+n.x*128)|0;
        var g = (128+n.g*128)|0;
        var b = (128+n.b*128)|0;
        this.color=RGBA(r,g,b,0xff);
    }

}	


    


class SVec {
         
    constructor(x=0,y=0,z=0,w=0,u=0,v=0,iy=0) {
        if (x instanceof SVec) 
            
            
            {
            this._x=x.x;
            this._y=x.y;
            this._z=x.z;
            this._w=x.w;
            this._u=x.u;
            this._v=x.v;
            this._iy=x.iy;
            this._color=new Vector3(x.color);
            this._light=new Vector3(x.light);
            this._normal=new Vector3(x.normal);
            this._next=undefined;
            return;
        }
        this._color=new Vector3(1,1,1);
        this._normal=new Vector3(1,1,1);
        this._light=new Vector3(1,1,1);
        this._x=x;
        this._y=y;
        this._z=z;
        this._w=w;
        this._u=u;
        this._v=v;
        this._iy=iy;
        this._next=undefined;
    }
    set color(a) {this._color=new Vector3(a);}
    set normal(a) {this._normal=new Vector3(a);}
    set light(a) {this._light=new Vector3(a);}
    set x(a) {this._x=a;}
    set y(a) {this._y=a;}
    set z(a) {this._z=a;}
    set w(a) {this._w=a;}

    set u(a) {this._u=a;}
    set v(a) {this._v=a;}
    set iy(a) {this._iy=a;}

    get color() {return new Vector3(this._color);}
    get normal() {return new Vector3(this._normal);}
    get light() {return new Vector3(this._light);}
    get x() {return this._x;}
    get y() {return this._y;}
    get z() {return this._z;}
    get w() {return this._w;}

    get u() {return this._u;}
    get v() {return this._v;}
    get iy() {return this._iy;}

    set next(a) {this._next=a;}
    get next() {return this._next;}


}


