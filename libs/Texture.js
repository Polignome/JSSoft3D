



const Intern_DummyTexture_width=64;
const Intern_DummyTexture_height=64;
var Intern_DummyTexture= new Int32Array(Intern_DummyTexture_width*Intern_DummyTexture_height);
var Intern_DummyTexture_init=false;
const		subShift = 4;			// Sub-affine span size
const		subSpan = 1 << subShift;	
const MIPMAPLEVEL =4; 






function CreateDummy( width,height,ra = 255,ga = 255,ba = 255,
                                   rb = 255,gb = 0,bb = 0)
{
  
  if( width < height) cheker_size = width / 8;
  else cheker_size = height / 8; 
  
  var screen_buffer= new Int32Array(width*height);
  var s=false;
  var seed=4;
  for(let x = 0;x<width - 1;x++)
  {
     if (x % cheker_size == 0) s =!s;
  
    for(let y = 0;y<height - 1;y++)
    {
      
      if (y % cheker_size == 0)  s = !s;
      screen_buffer[x+y*width] = RGBA(ra, ga, ba,0xff);
      if (s == false) 
      screen_buffer[x+y*width] = RGBA(rb, gb, bb,0xff);


    }
  }     
  return screen_buffer;
}




class Texture {
    constructor() {
        if (Intern_DummyTexture_init==false) {
            Intern_DummyTexture_init=true;
            Intern_DummyTexture.set(CreateDummy(Intern_DummyTexture_width,Intern_DummyTexture_height));
        }

        
        this._width=Intern_DummyTexture_width;
        this._height=Intern_DummyTexture_height;
        this._buffer=new Array();
        for (let i=0;i<MIPMAPLEVEL;i++) this._buffer.push(new Int32Array((this._width>>i)*(this._height>>i)));
        
        this._buffer[0].set(Intern_DummyTexture);
        this.buildMipMaps();
    }

	getPixel(x,y) {return this._buffer[0][x+y*this._width];}
	getPixelL(x,y,w) 
	{    let c=this._buffer[0][x+y*this._width];
	    let ww=w*4; 
		let r=RGBToRed(c);
	    let g=RGBToGreen(c);
	    let b=RGBToBlue(c);
		r=Math.min(r*ww,r);
		g=Math.min(g*ww,g);
		b=Math.min(b*ww,b);
		return RGB(r|0,g|0,b|0);
	}
	getPixelM(x,y,w) { 
        let l=w*4;
        l=Math.min((1/l)>>1,MIPMAPLEVEL);
        let ww=this._width>>l;
        let hh=this._height>>l;
        let xx=x*ww;
        let yy=y*hh;
        
        console.log("Level "+l+" ["+xx+" "+yy+"] "+" ["+ww+" "+hh+"] ");
        
        return this._buffer[l][xx+yy*(this._width>>l)];
    }


    buildMipMaps() {
         for (let i=1;i<MIPMAPLEVEL;i++) {

            for (let x;x<this.width>>i;x++)
              for (let y;y<this.height>>i;y++) 
              {
               
                this._buffer[i][x+y*(this._width>>i)]=RGBA(0,0,0,0xff);
              
              }
         }
    }
    get width() {return this._width;}
    get height() {return this._height;}
    get buffer() {return this._buffer;}
}













