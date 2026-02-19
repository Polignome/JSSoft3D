
function RGBToRed(rgb)          {return ((rgb & 0x000000FF) >> 0);}
function RGBToGreen(rgb)        {return ((rgb & 0x0000FF00) >> 8);}
function RGBToBlue(rgb)         {return ((rgb & 0x00FF0000) >> 16);}
function RGBToAlpha(rgb)        {return ((rgb& 0xFF000000) >> 24)&0x0ff;}

function RGBA(r,g,b,a)          {return (((a&0x0ff)<<24) | ((b&0x0ff)<<16) | ((g&0x0ff)<<8 ) | ((r&0x0ff)));}
function RGB(r,g,b)             {return RGBA(r,g,b,0xff); }

function LUMA_REC709(r, g, b)   {return (0.2126 * r + 0.7152 * g + 0.0722 * b);}
function GREY(r, g, b)          {return (LUMA_REC709(r, g, b) + 0.5)|0;}




function AddRGtoRGB(c1,c2)     {
//  let r=Math.min(RGBToRed(c1)+RGBToRed(c2),255);
//  let g=Math.min(RGBToGreen(c1)+RGBToGreen(c2),255);
//  let b=Math.min(RGBToBlue(c1)+RGBToBlue(c2),255);

  let r=(RGBToRed(c1)+RGBToRed(c2))>>1;
  let g=(RGBToGreen(c1)+RGBToGreen(c2))>>1;
  let b=(RGBToBlue(c1)+RGBToBlue(c2))>>1;


  return RGB(r,g,b);
}



function RGBToGray(color)
{
  let r = color % 256;
  let g = ((color / 256)|0) % 256;
  let b = (((color / 256)|0 / 256)|0) % 256
  return (0.299 * r + 0.587 * g + 0.114 * b) |0;
}

class Canvas  {


  constructor(name,width,height) {
      this._canvas = undefined;
      this. _ctx = undefined;
      this._imageData = undefined;
      this._buffer=new ArrayBuffer();
      //this._buffer.length=2;
      this._active_buffer_index=0;
      this._active_buffer_ptr=undefined;
      this._clear_color=RGBA(0,0,0,0xff);
      this.Init(name,width,height); 
 
      this._canvas.addEventListener("mousemove", (ev) => {
          let cols = canvas.width;
          let { offsetX, offsetY } = ev;
          this._mpx=offsetX;
          this._mpy=offsetY;
      });
  }

  
  DrawTexture(posx,posy,texture) {
    for (let y=0;y<texture.height;y++)
    {
      for (let x=0;x<texture.width;x++)
      {
        let color=texture.buffer[x+y*texture.width];
        this.PutPixel(posx+x,posy+y,color);         
      }
    }
}  
DrawRec(x1, y1, x2, y2, color) {
  this.DrawLine(x1, y1, x2, y1, color)
  this.DrawLine(x2, y1, x2, y2, color)
  this.DrawLine(x2, y2, x1, y2, color)
  this.DrawLine(x1, y2, x1, y1, color)
}


DrawLine(x1, y1, x2, y2, color) {
    // Differenzen berechnen
    
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    
    // Schrittrichtung bestimmen (1 oder -1)
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    
    // Initialer Fehlerwert
    let err = dx - dy;

    while (true) {
        // Pixel setzen
        this.PutPixel(x1, y1, color);

        // Ziel erreicht?
        if (x1 === x2 && y1 === y2) break;

        // Fehlerwert anpassen und Koordinaten rücken
        let e2 = 2 * err;
        
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

  SetClearColor(color) {
    this._clear_color=color;
  }

  EnableDepthtest() {this._depth=true;}
  DisableDepthtest() {this._depth=false;}

  get width()    {return this._canvas.width;}
  get height()   {return this._canvas.height;}
  get MouseX()   {return this._mpx;}
  get MouseY()   {return this._mpy;}
  get Canvas()   {return this._canvas;}

  
  

  Clear() 
  {
    if (this._active_buffer_ptr===undefined) return;
    this._active_buffer_ptr.fill(this._clear_color);  
  }

  get Buffer() {return this._active_buffer_ptr;} 

  GetActiveBuffer() {
    return this._active_buffer_ptr;
   }
    

Init(name,width,height) {
  
    this._canvas = document.getElementById(name);
    this._ctx = this._canvas.getContext("2d",{willReadFrequently: true});
    this._canvas.width= width;
    this._canvas.height= height;
    this._imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    this._buffer[0]= new Uint32Array(this._canvas.width* this._canvas.height);
    this._buffer[1]= new Uint32Array(this._canvas.width* this._canvas.height);
    this._active_buffer_index=0;
    this._active_buffer_ptr=this._buffer[this._active_buffer_index];

    this._imgdata = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    this._argb   =new Uint32Array(this._imageData.data.buffer);
  
  
}

flip() {
  this._active_buffer_index !=this._active_buffer_index;
  this._active_buffer_ptr=this._buffer[this._active_buffer_index];
}

Redraw() {
  this._argb.set(this._active_buffer_ptr);
  this._ctx.putImageData(this._imageData, 0, 0);
  return this._ctx;
} 

PutPixel(x,y,color) {
  if (x<0 || y<0 || x >= this.width || y>=this.height) return;
  this._active_buffer_ptr[x+y*this.width]=color;
  
}

SetPixel(pos,color) {
  if (pos<0 || pos >= this.width * this.height) return;
  this._active_buffer_ptr[pos]=color;
}


}