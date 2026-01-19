



const Intern_DummyTexture_width=64;
const Intern_DummyTexture_height=64;
var Intern_DummyTexture= new Int32Array(Intern_DummyTexture_width*Intern_DummyTexture_height);
var Intern_DummyTexture_init=false;
const		subShift = 4;			// Sub-affine span size
const		subSpan = 1 << subShift;	

const TEXTUTRE_AFFINE        	=0;
const TEXTUTRE_PERSPECTIVE  	=1;
const TEXTUTRE_SUB_PERSPECTIVE  =2;


var TextureMode=TEXTUTRE_PERSPECTIVE ;








class Event {
	constructor() {
		this._id=0;
		this._isOpen=false;
		this._surface=nullptr;
	}


    get id() {return this._id;}
    get isOpen() {return this._isOpen;}
    get surface() {return this._surface;}

	set id(a) {this._id=a;}
    set isOpen(a) {this._isOpen=a;}
    set surface(a) {this._surface=a;}


    kleiner(other) {
		if (this.x!=other.x) return this.x < other.x;
		return this.isOpen> other.isOpen
	}
}


class Surface {
    constructor(id=0,xs=0,xe=0,zs=0,ze=0,color) {
	this._id=id;
    this._zStart=zs;
    this._zEnd=ze;
    this._color=color;
    this._xStart=xs;
    this._xEnd=xe;
         
    this._prev = nullptr;
    this._next = nullptr;
}

 covers( x)  {
	return x >= xStart && x < xEnd;
}

zAt(x) {
	if (xEnd == xStart) return zStart;
    let t = (x - xStart) / (xEnd - xStart);
	return zStart + t * (zEnd - zStart);
}


get id() {return this._id;}
get zStart() {return this._zSart;}
get zEnd() {return this._zEnd;}
get color() {return this._color;}
get xStart() {return this._xStart;}
get xEnd() { return this._xEnd;}
get prev() {return this._prev;}
get next() {return this._next;}

set id(a) {this._id=a;}
set zStart(a) {this._zStart=a;}
set zEnd(a) {this._zEnd=a;}
set color(a) {this._color=a;}
set xStart(a) {this._xStart=a;}
set xEnd(a) { this._xEnd=a;}
set prev(a) {this._prev=a;}
set next(a) {this._next=a;}
};


var Screen = new Array();



function ClearSpans(width,height,z) {
	Screen = new Array();
	for (let y=0;y<height;y++)
	{
        var line= new Array();
		var surface = new Surface(0,0,width,z,z,0x000010ff);
		
		Screen.push
	}

}



function SeTextureMode(mode) {
	TextureMode=mode;
}

function	calcEdgeDeltas(edge,top,bot,shade=false)
{
	// Edge deltas


	var	overHeight = 1.0 / (bot.y - top.y);
	edge.du = (bot.u - top.u) * overHeight;
	edge.dv = (bot.v - top.v) * overHeight;
	edge.dw = (bot.w - top.w) * overHeight;
	edge.dx = (bot.x - top.x) * overHeight;

	edge.dlight  = bot.light.sub(top.light).mul(overHeight);
	edge.dnormal = bot.normal.sub(top.normal).mul(overHeight);
	edge.dcolor  = bot.color.sub(top.color).mul(overHeight);

	// Screen pixel Adjustments (some call this "sub-pixel accuracy")

	var	subPix =  top.iy - top.y;
	edge.u  = top.u + edge.du * subPix;
	edge.v  = top.v + edge.dv * subPix;
	edge.w  = top.w + edge.dw * subPix;
	edge.x  = top.x + edge.dx * subPix;

	edge.light  = top.light.add(edge.dlight.mul(subPix));
	edge.normal = top.normal.add(edge.dnormal.mul(subPix));
	edge.color  = top.color.add(edge.dcolor.mul(subPix));

	
 




	if (!shade) return

}

class Edge {
    constructor(u=0,du=0,v=0,dv=0,w=0,dw=0,x=0,dx=0,height=0) {
        if (u!=undefined)  this._u=u;   else this._u=0; 
        if (du!=undefined) this._du=du; else this._du=0; 
        if (v!=undefined)  this._v=v;   else this._v=0; 
        if (dv!=undefined) this._dv=dv; else this._dv=0; 
        if (w!=undefined)  this._w=w;   else this._w=0;
        if (dw!=undefined) this._dw=dw; else this._dw=0;  
        if (x!=undefined)  this._x=x;   else this._x=0;
        if (dx!=undefined) this._dx=dx; else this._dx=0; 
		if (height!=undefined) this._height=0; 
		else this._height=0;

		this._color=new Vector3(0,0,0);
		this._normal=new Vector3(0,0,0);
		this._light=new Vector3(0,0,0);
		this._dcolor=new Vector3(0,0,0);
		this._dnormal=new Vector3(0,0,0);
		this._dlight=new Vector3(0,0,0);
    }

	set color(a)   {this._color  =new Vector3(a.x,a.y,a.z);}
	set normal(a)  {this._normal =new Vector3(a.x,a.y,a.z);}
	set light(a)   {this._light  =new Vector3(a.x,a.y,a.z);}
	set dcolor(a)  {this._dcolor =new Vector3(a.x,a.y,a.z);}
	set dnormal(a) {this._dnormal=new Vector3(a.x,a.y,a.z);}
	set dlight(a)  {this._dlight =new Vector3(a.x,a.y,a.z);}
  
	get color() {return new Vector3(this._color);}
	get normal() {return new Vector3(this._normal);}
	get light() {return new Vector3(this._light);}
	get dcolor() {return new Vector3(this._dcolor);}
	get dnormal() {return new Vector3(this._dnormal);}
	get dlight() {return new Vector3(this._dlight);}
	  
	
   set u(a) {this._u=a;}
   set du(a) {this._du=a;}
   set v(a) {this._v=a;}
   set dv(a) {this._dv=a;}
   set w(a) {this._w=a;}
   set dw(a) {this._dw=a;}
   set x(a) {this._x=a;}
   set dx(a) {this._dx=a;}
   set height(a) {this._height=a;}

   get u()  {return this._u;}
   get du() {return this._du;}
   get v()  {return this._v;}
   get dv() {return this._dv;}
   get w()  {return this._w;}
   get dw() {return this._dw;}
   get x()  {return this._x;}
   get dx() {return this._dx;}
   get height() {return this._height;}
}


function GetNoise(seed) {     
}

function CreateDummy( width,height,ra = 255,ga = 255,ba = 255,rb = 255,gb = 0,bb = 0)
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
        this._buffer=new Int32Array(this._width*this._height);
        this._buffer.set(Intern_DummyTexture);
    }

	getPixel(x,y) {return this._buffer[x+y*this._width];}
	getPixelL(x,y,w) 
	{    let c=this._buffer[x+y*this._width];
	    let ww=w*4; 
		let r=RGBToRed(c);
	    let g=RGBToGreen(c);
	    let b=RGBToBlue(c);
		r=Math.min(r*ww,r);
		g=Math.min(g*ww,g);
		b=Math.min(b*ww,b);
		return RGB(r|0,g|0,b|0);
	}
    get width() {return this._width;}
    get height() {return this._height;}
    get buffer() {return this._buffer;}
}






function drawZBufferPolygon(verts,rasterizer) // fehlerhaft
{
	// Find the top-most vertex
 var pitch = rasterizer.width();
 var lastVert=verts.length-1;
 var lTop=0;
 var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
 	 verts[i].iy =  Math.ceil(verts[i].y);
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;

		// Render the current trapezoid defined by left & right edges
  
		
    while(((height--)|0) )
		{

			var		overWidth = 1.0 / (re.x - le.x);
			var		dw  = (re.w - le.w) * overWidth;




			// Find the end-points

			var start = Math.ceil(le.x)|0;
			var	end   = Math.ceil(re.x)|0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		w  = (le.w + dw * subTex);

			// Fill the entire span

			var span = (fb + start);

			for (; start < end; start++)
			{
			 rasterizer.PutBuffer(span,w) 
				span++;
			    w += dw;
			}

			// Step

			le.w += le.dw;
			le.x += le.dx;



			re.w += re.dw;
			re.x += re.dx;

			fb += pitch;
    }
    
   // console.log("End Loope");
	}


}


function drawFlatPolygon(verts,rasterizer) // fehlerhaft
{
	// Find the top-most vertex
 var pitch = rasterizer.width();
 var lastVert=verts.length-1;
 var lTop=0;
 var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
 	 verts[i].iy =  Math.ceil(verts[i].y);
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;

		// Render the current trapezoid defined by left & right edges
  
		
    while(((height--)|0) )
		{

			var		overWidth = 1.0 / (re.x - le.x);
			var		dw  = (re.w - le.w) * overWidth;
            var     dc  = re.color.sub(le.color).mul(overWidth);




			// Find the end-points

			var start = Math.ceil(le.x)|0;
			var	end   = Math.ceil(re.x)|0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		w  = (le.w + dw * subTex);
            var     c  = le.color.add(dc.mul(subTex));

			// Fill the entire span

			var span = (fb + start);

			for (; start < end; start++)
			{
				
         

						


			if (rasterizer.PutBuffer(span,w)) 
				 rasterizer.GetActiveBuffer()[span]=RGB((c.x*256)|0,
				                                        (c.y*256)|0,
														(c.z*256)|0);
				span++;
			    w += dw;
				c = c.add(dc);
			}

			// Step

			le.w += le.dw;
			le.x += le.dx;

			le.color = le.color.add(le.dcolor);


			re.w += re.dw;
			re.x += re.dx;
			re.color = re.color.add(re.dcolor);

			fb += pitch;
    }
    
   // console.log("End Loope");
	}


}



function drawAffineTexturedPolygon(verts,rasterizer,texture) // fehlerhaft
{
	// Find the top-most vertex
	
  var pitch = rasterizer.width();
  var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;

		// Render the current trapezoid defined by left & right edges
  

		
    while(((height--)|0) )
		{

			var		overWidth = 1.0 / (re.x - le.x);
			var		du  = (re.u - le.u) * overWidth;
			var		dv  = (re.v - le.v) * overWidth;
			var		dw  = (re.w - le.w) * overWidth;





			// Find the end-points

			var start = Math.ceil(le.x)|0;
			var	end   = Math.ceil(re.x)|0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;

			var		u = (le.u + du * subTex) ;
			var		v = (le.v + dv * subTex) ;
			var		w = (le.w + dw * subTex);

			// Fill the entire span

			var span = (fb + start);
			

			for (; start < end; start++)
			{
				
         
			if (rasterizer.PutBuffer(span,w))  {
				 let uu=(u*texture.width)|0;
				 let vv=(v*texture.height)|0;

				rasterizer.GetActiveBuffer()[span]= texture.getPixel(uu|0,vv|0);
					

				} 
				span++;
				u += du;
				v += dv;
   			     w += dw;
			}


			
			// Step

			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			
    		
    }
    
   // console.log("End Loope");
	}
}

function drawPerspectiveTexturedPolygon(verts,rasterizer,texture) // fehlerhaft
{
	// Find the top-most vertex
	
  var pitch = rasterizer.width();
  var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;

		// Render the current trapezoid defined by left & right edges
  

		
    while(((height--)|0) )
		{

			var		overWidth = 1.0 / (re.x - le.x);
			var		du  = (re.u - le.u) * overWidth;
			var		dv  = (re.v - le.v) * overWidth;
			var		dw  = (re.w - le.w) * overWidth;





			// Find the end-points

			var start = Math.ceil(le.x)|0;
			var	end   = Math.ceil(re.x)|0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;

			var		u = (le.u + du * subTex) ;
			var		v = (le.v + dv * subTex) ;
			var		w = (le.w + dw * subTex);

			// Fill the entire span

			var span = (fb + start);
			

			for (; start < end; start++)
			{
				
         
			if (rasterizer.PutBuffer(span,w))  {
					let	z = 1.0 / w;
					
					let	s = (u * z);
					let	t = (v * z);


				let uu=(s*texture.width)|0;
				 let vv=(t*texture.height)|0;

				rasterizer.GetActiveBuffer()[span]= texture.getPixel(uu|0,vv|0);
					

				} 
				span++;
				u += du;
				v += dv;
   			     w += dw;
			}


			
			// Step

			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			
    		
    }
    
   // console.log("End Loope");
	}
}

function drawPerspectiveTexturedPolygonDoof(verts,rasterizer,texture)
{


var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  
var pitch = rasterizer.width();

  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	//verts[i].u*=64>>1;
	//verts[i].v*=64>>1;
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	var	zb = verts[lTop].iy * pitch;

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;


while(((height--)|0) > 0)
		{
			// Texture coordinates

			var		overWidth = 1.0 / (re.x - le.x);
			var		du = (re.u - le.u) * overWidth;
			var		dv = (re.v - le.v) * overWidth;
			var		dw = (re.w - le.w) * overWidth;

			// Find the end-points

			var		start = Math.ceil(le.x) |0;
			var		end   = Math.ceil(re.x) |0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		u = le.u + du * subTex;
			var		v = le.v + dv * subTex;
			var		w = le.w + dw * subTex;

			// Fill the entire span

			var span = fb + start;
			var zspan = zb + start;
            
			for (; start < end; start++)
			{
			
				if (rasterizer.PutBuffer(span,w)==true)
				{
					var	z = 1.0 / w;
					var	s = (u * z)|0;
					var	t = (v * z)|0;
			
				    let uu=s*texture.width;//(s*texture.width)|0;
				    let vv=t*texture.height;//(t*texture.height)|0;
                    console.log (u+" "+v);
 				    rasterizer.GetActiveBuffer()[span]= texture.getPixel(uu|0,vv|0);


				}
				u += du;
				v += dv;
				w += dw;
				span++;
				zspan++;
			}

			// Step

			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			zb += pitch;
		}
	}
}



























/*

function drawAffineTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch) // fehlerhaft
{
	// Find the top-most vertex
	
  console.log(pitch);
  var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	var	zb = verts[lTop].iy * pitch;

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;

		// Render the current trapezoid defined by left & right edges
  
		
    while(((height--)|0) )
		{

			var		overWidth = 1.0 / (re.x - le.x);
			var		du  = (re.u - le.u) * overWidth;
			var		dv  = (re.v - le.v) * overWidth;
			var		dw  = (re.w - le.w) * overWidth;
			var		idu = (du * 65536.0)|0;
			var		idv = (dv * 65536.0)|0;





			// Find the end-points

			var start = Math.ceil(le.x)|0;
			var	end   = Math.ceil(re.x)|0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		iu = ((le.u + du * subTex) * 65536.0)|0;
			var		iv = ((le.v + dv * subTex) * 65536.0)|0;
			var		w  = (le.w + dw * subTex);

			// Fill the entire span

			var span = (fb + start);
			var zspan =(zb + start);

			for (; start < end; start++)
			{
				
         
			if (zBuffer.PutBuffer(span,w)) 
				 frameBuffer.GetActiveBuffer()[span]= texture.buffer[((iv>>10) & 0xFC0) + ((iu>>16) & 0x3F)];
				span++;
				zspan++;
				iu += idu;
				iv += idv;
				 w += dw;
			}

			// Step

			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			zb += pitch;
    		
    }
    
   // console.log("End Loope");
	}
}

function drawPerspectiveTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch)
{


var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	//verts[i].u*=64>>1;
	//verts[i].v*=64>>1;
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	var	zb = verts[lTop].iy * pitch;

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;


while(((height--)|0) > 0)
		{
			// Texture coordinates

			var		overWidth = 1.0 / (re.x - le.x);
			var		du = (re.u - le.u) * overWidth;
			var		dv = (re.v - le.v) * overWidth;
			var		dw = (re.w - le.w) * overWidth;

			// Find the end-points

			var		start = Math.ceil(le.x) |0;
			var		end   = Math.ceil(re.x) |0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		u = le.u + du * subTex;
			var		v = le.v + dv * subTex;
			var		w = le.w + dw * subTex;

			// Fill the entire span

			var span = fb + start;
			var zspan = zb + start;
            
			for (; start < end; start++)
			{
			
				if (zBuffer.PutBuffer(span,w)==true)
				{
					var	z = 1.0 / w;
					var	s = (u * z)|0;
					var	t = (v * z)|0;
					
					{		
						frameBuffer.GetActiveBuffer()[span]= texture.buffer[((t<<6) & 0xFC0) + (s & 0x3F)];
					}
					//frameBuffer.GetActiveBuffer()[span]=0xffffffff;
					//*span = textureBuffer[((t<<6) & 0xFC0) + (s & 0x3F)];
					//*zspan = w;
				}
				u += du;
				v += dv;
				w += dw;
				span++;
				zspan++;
			}

			// Step

			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			zb += pitch;
		}
	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawSubPerspectiveTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch)
{

var lastVert=verts.length-1;
  var lTop=0;
  var rTop=0;
  


  for (let i=0;i<verts.length;i++)
  {
	verts[i].iy =  Math.ceil(verts[i].y);
	//verts[i].u*=64>>1;
	//verts[i].v*=64>>1;
	 if (verts[i].y < verts[lTop].y) lTop = i;

  }

	// Make sure we have the top-most vertex that is earliest in the winding order

	if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

	rTop = lTop;

	// Top scanline of the polygon in the frame buffer

	var	fb = verts[lTop].iy * pitch;
	

	// Left & Right edges (primed with 0 to force edge calcs first-time through)

	var	le = new Edge();
    var re = new Edge();
	le.height = 0;
	re.height = 0;

	// Render the polygon

	var	done = false;
	while(done==false)
	{


		if (!le.height)
		{
			let lBot = lTop - 1; 
			if (lBot < 0) lBot = verts.length-1;
             le.height = verts[lBot].iy - verts[lTop].iy;
			
            if (le.height < 0) return;
			calcEdgeDeltas(le, verts[lTop], verts[lBot]);
			lTop = lBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		if (!re.height)
		{
			var rBot = rTop + 1; 
      
      if (rBot > lastVert) rBot = 0;
			re.height = verts[rBot].iy - verts[rTop].iy;
			if (re.height < 0) return;
			calcEdgeDeltas(re, verts[rTop], verts[rBot]);
			rTop = rBot;
			if (lTop == rTop) done = true;
			if (lTop != rTop && done==true) return;
		}

		// Get the height

		var	height = Math.min(le.height, re.height)|0;

		// Subtract the height from each edge

		le.height -= height;
		re.height -= height;

        height=height | 0;


while(((height--)|0) > 0)
		{
			// Texture coordinates

			var		overWidth = 1.0 / (re.x - le.x);
			var		du = (re.u - le.u) * overWidth;
			var		dv = (re.v - le.v) * overWidth;
			var		dw = (re.w - le.w) * overWidth;

			// Find the end-points

			var		start = Math.ceil(le.x) |0;
			var		end   = Math.ceil(re.x) |0;

			// Texture adjustment (some call this "sub-texel accuracy")

			var		subTex =  start - le.x;
			var		u = le.u + du * subTex;
			var		v = le.v + dv * subTex;
			var		w = le.w + dw * subTex;

			// Start of the first span

		    var		z  = 1.0 / w;
            var		s1 = u * z;
            var		t1 = v * z;
            var		w1 = w;

			// Fill the entire span

			var span = fb + start;
			var pixelsDrawn =0;
 



for (; start < end; start+=subSpan)
	{
	


		var		s0 = s1;
		var		t0 = t1;
		var		w0 = w1;

		var	l = (end-start)|0;
		len = Math.min(subSpan, l)|0;
		pixelsDrawn += len;

		// End of the current span

		w1 = (w + dw * pixelsDrawn);
		var z = 1.0 / w1;
		s1 = (u + du * pixelsDrawn) * z;
		t1 = (v + dv * pixelsDrawn) * z;
	
		var dw = (w1 - w0) / len;

		// The span (8.24 fixed-point)

		var	divisor = 1.0 / len * 0x1000000;
		var ds = (((s1 - s0) * divisor))|0;
		var dt = (((t1 - t0) * divisor))|0;
		var s  = ((s0 * 0x1000000))|0;
		var t  = ((t0 * 0x1000000))|0;

		for (let j = 0; j < len; j++)
		{
			if (zBuffer.PutBuffer(span,w)) frameBuffer.GetActiveBuffer()[span]= texture.buffer[((t>>18)&0xFC0)+((s>>24) & 0x3f)];
			s += ds;
			t += dt;
			w0 += dw;
			span++;
		}

	}


			le.u += le.du;
			le.v += le.dv;
			le.w += le.dw;
			le.x += le.dx;
			re.u += re.du;
			re.v += re.dv;
			re.w += re.dw;
			re.x += re.dx;
			fb += pitch;
			
		}
	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
//
//














function DrawTexture(verts,texture,frameBuffer,zBuffer,pitch) {
	drawPerspectiveTexturedPolygonShaded(verts,texture,frameBuffer,zBuffer,pitch);
	return;
	switch(TextureMode) {
	 case 0:drawAffineTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch); break;
	 case 1:drawPerspectiveTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch); break;
	 case 2:drawSubPerspectiveTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch); break;
	 default: drawAffineTexturedPolygon(verts,texture,frameBuffer,zBuffer,pitch); break;
	}
}

*/