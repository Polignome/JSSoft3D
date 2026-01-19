/**************************************************************************
*                                                                         *                  
*                                                                         *                  
*                                                                         *                  
*                                                                         *                  
*                                                                         *                  
*                                                                         *                  
**************************************************************************/






const TEST ="       \
# Blender 4.5.1 LTS \
# www.blender.org\
mtllib smalercity.mtl\
o Cube\
v 0.700830 1.237962 -0.936571\
v 0.700830 -0.762038 -0.936571\
v 0.700830 1.237962 1.063429\
v 0.700830 -0.762038 1.063429\
v -1.299170 1.237962 -0.936571\
v -1.299170 -0.762038 -0.936571\
v -1.299170 1.237962 1.063429\
v -1.299170 -0.762038 1.063429\
vn -0.0000 1.0000 -0.0000\
vn -0.0000 -0.0000 1.0000\
vn -1.0000 -0.0000 -0.0000\
vn -0.0000 -1.0000 -0.0000\
vn 1.0000 -0.0000 -0.0000\
vn -0.0000 -0.0000 -1.0000\
vt 0.625000 0.500000\
vt 0.875000 0.500000\
vt 0.875000 0.750000\
vt 0.625000 0.750000\
vt 0.375000 0.750000\
vt 0.625000 1.000000\
vt 0.375000 1.000000\
vt 0.375000 0.000000\
vt 0.625000 0.000000\
vt 0.625000 0.250000\
vt 0.375000 0.250000\
vt 0.125000 0.500000\
vt 0.375000 0.500000\
vt 0.125000 0.750000\
s 0\
usemtl Material\
f 1/1/1 5/2/1 7/3/1 3/4/1\
f 4/5/2 3/4/2 7/6/2 8/7/2\
f 8/8/3 7/9/3 5/10/3 6/11/3\
f 6/12/4 2/13/4 4/5/4 8/14/4\
f 2/13/5 1/1/5 3/4/5 4/5/5\
f 6/11/6 5/10/6 1/1/6 2/13/6\
o Cube.001\
v 1.969569 1.326292 -52.618359\
v 1.969569 -0.673708 -52.618359\
v 1.969569 1.326292 53.378971\
v 1.969569 -0.673708 53.378971\
v -0.030431 1.326292 -52.618359\
v -0.030431 -0.673708 -52.618359\
v -0.030431 1.326292 53.378971\
v -0.030431 -0.673708 53.378971\
vn -0.0000 1.0000 -0.0000\
vn -0.0000 -0.0000 1.0000\
vn -1.0000 -0.0000 -0.0000\
vn -0.0000 -1.0000 -0.0000\
vn 1.0000 -0.0000 -0.0000\
vn -0.0000 -0.0000 -1.0000\
vt 0.625000 0.500000\
vt 0.875000 0.500000\
vt 0.875000 0.750000\
vt 0.625000 0.750000\
vt 0.375000 0.750000\
vt 0.625000 1.000000\
vt 0.375000 1.000000\
vt 0.375000 0.000000\
vt 0.625000 0.000000\
vt 0.625000 0.250000\
vt 0.375000 0.250000\
vt 0.125000 0.500000\
vt 0.375000 0.500000\
vt 0.125000 0.750000\
s 0\
usemtl Material\
f 9/15/7 13/16/7 15/17/7 11/18/7\
f 12/19/8 11/18/8 15/20/8 16/21/8\
f 16/22/9 15/23/9 13/24/9 14/25/9\
f 14/26/10 10/27/10 12/19/10 16/28/10\
f 10/27/11 9/15/11 11/18/11 12/19/11\
f 14/25/12 13/24/12 9/15/12 10/27/12\
o Cube.002\
v -1.648434 3.711225 1.333802\
v -1.648434 1.711224 1.333802\
v -1.648434 3.711225 3.333802\
v -1.648434 1.711224 3.333802\
v -3.648434 3.711225 1.333802\
v -3.648434 1.711224 1.333802\
v -3.648434 3.711225 3.333802\
v -3.648434 1.711224 3.333802\
vn -0.0000 1.0000 -0.0000\
vn -0.0000 -0.0000 1.0000\
vn -1.0000 -0.0000 -0.0000\
vn -0.0000 -1.0000 -0.0000\
vn 1.0000 -0.0000 -0.0000\
vn -0.0000 -0.0000 -1.0000\
vt 0.625000 0.500000\
vt 0.875000 0.500000\
vt 0.875000 0.750000\
vt 0.625000 0.750000\
vt 0.375000 0.750000\
vt 0.625000 1.000000\
vt 0.375000 1.000000\
vt 0.375000 0.000000\
vt 0.625000 0.000000\
vt 0.625000 0.250000\
vt 0.375000 0.250000\
vt 0.125000 0.500000\
vt 0.375000 0.500000\
vt 0.125000 0.750000\
s 0\
usemtl Material\
f 17/29/13 21/30/13 23/31/13 19/32/13\
f 20/33/14 19/32/14 23/34/14 24/35/14\
f 24/36/15 23/37/15 21/38/15 22/39/15\
f 22/40/16 18/41/16 20/33/16 24/42/16\
f 18/41/17 17/29/17 19/32/17 20/33/17\
f 22/39/18 21/38/18 17/29/18 18/41/18\
o Cube.003\
v -0.030253 4.447314 -3.237099\
v -0.030253 2.447314 -3.237099\
v -0.030253 4.447314 -1.237099\
v -0.030253 2.447314 -1.237099\
v -2.030253 4.447314 -3.237099\
v -2.030253 2.447314 -3.237099\
v -2.030253 4.447314 -1.237099\
v -2.030253 2.447314 -1.237099\
vn -0.0000 1.0000 -0.0000\
vn -0.0000 -0.0000 1.0000\
vn -1.0000 -0.0000 -0.0000\
vn -0.0000 -1.0000 -0.0000\
vn 1.0000 -0.0000 -0.0000\
vn -0.0000 -0.0000 -1.0000\
vt 0.625000 0.500000\
vt 0.875000 0.500000\
vt 0.875000 0.750000\
vt 0.625000 0.750000\
vt 0.375000 0.750000\
vt 0.625000 1.000000\
vt 0.375000 1.000000\
vt 0.375000 0.000000\
vt 0.625000 0.000000\
vt 0.625000 0.250000\
vt 0.375000 0.250000\
vt 0.125000 0.500000\
vt 0.375000 0.500000\
vt 0.125000 0.750000\
s 0\
usemtl Material\
f 25/43/19 29/44/19 31/45/19 27/46/19\
f 28/47/20 27/46/20 31/48/20 32/49/20\
f 32/50/21 31/51/21 29/52/21 30/53/21\
f 30/54/22 26/55/22 28/47/22 32/56/22\
f 26/55/23 25/43/23 27/46/23 28/47/23\
f 30/53/24 29/52/24 25/43/24 26/55/24\
o Cube.004\
v -0.037303 -0.204773 2.512850\
v -0.037303 -2.204772 2.512850\
v -0.037303 -0.204773 4.512850\
v -0.037303 -2.204772 4.512850\
v -2.037303 -0.204773 2.512850\
v -2.037303 -2.204772 2.512850\
v -2.037303 -0.204773 4.512850\
v -2.037303 -2.204772 4.512850\
vn -0.0000 1.0000 -0.0000\
vn -0.0000 -0.0000 1.0000\
vn -1.0000 -0.0000 -0.0000\
vn -0.0000 -1.0000 -0.0000\
vn 1.0000 -0.0000 -0.0000\
vn -0.0000 -0.0000 -1.0000\
vt 0.625000 0.500000\
vt 0.875000 0.500000\
vt 0.875000 0.750000\
vt 0.625000 0.750000\
vt 0.375000 0.750000\
vt 0.625000 1.000000\
vt 0.375000 1.000000\
vt 0.375000 0.000000\
vt 0.625000 0.000000\
vt 0.625000 0.250000\
vt 0.375000 0.250000\
vt 0.125000 0.500000\
vt 0.375000 0.500000\
vt 0.125000 0.750000\
s 0\
usemtl Material\
f 33/57/25 37/58/25 39/59/25 35/60/25\
f 36/61/26 35/60/26 39/62/26 40/63/26\
f 40/64/27 39/65/27 37/66/27 38/67/27\
f 38/68/28 34/69/28 36/61/28 40/70/28\
f 34/69/29 33/57/29 35/60/29 36/61/29\
f 38/67/30 37/66/30 33/57/30 34/69/30\
";



// abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"§$%&/()=?´+*~#'<>|,;.:-_
//https://community.khronos.org/t/extracting-camera-position-from-a-modelview-matrix/68031/3
const width = 320*2;
const height = 200*2;
var now = new Date();
var oldTime;
var time;
var frameTime;
var canvas = new Canvas("canvas",width,height);
var rasterizer = new Rasterizer(canvas);

var keys= new Array(256);
var prekeys= new Array(256);
var polys=new Array();
var obj3d = new IndexedObject();

var spansin=0;
var spansout=0;
////////////////////////////////////
var mouse_key=0;
var mouse_posx=0;
var mouse_posy=0;
var mouse_posx_old=0;
var mouse_posy_old=0;
var mouse_posx_div=0;
var mouse_posy_div=0;
////////////////////////////////////
/*
var FPS = 0;
var TimeNow;
var TimeTaken;
var ASecond = 1000;
var FPSLimit = 25;
var StartTime = Date.now();
var TimeBefore = StartTime;
var FrameTime = ASecond/FPSLimit;
*/
var use_timer = true;

let lastTime = performance.now();
let fps = 0;
let frameCounter = 0;
let fpsTime = lastTime;
const FRAME_TIME = 1000 / 60;
let accumulator = 0;
let last = performance.now();


////////////////////////////////////
var render_zbuffer =false;
var cam = new Camera();
var m_last_key_down=0;
var m_render_zbuffer =false;

const MOUSE_BUTTON_LEFT = 1<<1;
const MOUSE_BUTTON_MIDDLE = 1<<2;
const MOUSE_BUTTON_RIGHT = 1<<3



var cube_verts=new Array(
new Vector3(-1,1,-1),new Vector3(1,1,-1),new Vector3(1,-1,-1),new Vector3(-1,-1,-1),
new Vector3(1,1,-1),new Vector3(1,1,1),new Vector3(1,-1,1),new Vector3(1,-1,-1),
new Vector3(1,1,1),new Vector3(-1,1,1),new Vector3(-1,-1,1),new Vector3(1,-1,1),
new Vector3(-1,1,1),new Vector3(-1,1,-1),new Vector3(-1,-1,-1),new Vector3(-1,-1,1),
new Vector3(-1,1,-1),new Vector3(-1,1,1),new Vector3(1,1,1),new Vector3(1,1,-1),
new Vector3(-1,-1,-1),new Vector3(1,-1,-1),new Vector3(1,-1,1),new Vector3(-1,-1,1));

var cube_indices=new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23);




function CreateCube(pos=new Vector3(0,0,0),type=POLY_FILLED,scale=new Vector3(1,1,1),rot=new Vector3(0,0,0)) {

    var polygons_list= new Array();

	
	var v1=new Array(new Vector3(-1,1,-1),new Vector3(1,1,-1),new Vector3(1,-1,-1),new Vector3(-1,-1,-1));
	var v2=new Array(new Vector3(1,1,-1),new Vector3(1,1,1),new Vector3(1,-1,1),new Vector3(1,-1,-1));
	var v3=new Array(new Vector3(1,1,1),new Vector3(-1,1,1),new Vector3(-1,-1,1),new Vector3(1,-1,1));
	var v4=new Array(new Vector3(-1,1,1),new Vector3(-1,1,-1),new Vector3(-1,-1,-1),new Vector3(-1,-1,1));
	var v5=new Array(new Vector3(-1,1,-1),new Vector3(-1,1,1),new Vector3(1,1,1),new Vector3(1,1,-1));
	var v6=new Array(new Vector3(-1,-1,-1),new Vector3(1,-1,-1),new Vector3(1,-1,1),new Vector3(-1,-1,1));
	var h= new Array(v1,v2,v3,v4,v5,v6);
	

	



    for (let i=0;i<h.length;i++) {
		for (let j=0;j<h[i].length;j++) {
			h[i][j]=h[i][j].mul(scale);
			h[i][j]=h[i][j].add(pos);
		}
	}



	for (let i=0;i<h.length;i++)
	{
	  var p=new Polygon(h[i]);
	  p.render_type=type;
	  p.calcPlane(); 
	  //zzp.setWorldTexture(1,1);
	  p.setPlanarTexture();
	  p.SetNormalColor(1,1,1); 
	  polygons_list.push(p);
	  
	}

	return polygons_list;

}

function InitCamera() {
	let	FOV =  60;
	cam.aspect  = ( width * 1) / ( height* 1); 
	cam.fov     = FOV *  3.14159265359 /  180;
	cam.near    = 0.001;
	cam.far     = 1000;
	cam.LookAt(new Vector3(0,0,0));
	cam.position= new Vector3(0,0,-50);
}

function Sig(key) {
}

function SetMousePos(x,y) {
	mouse_posx_old=mouse_posx;
	mouse_posy_old=mouse_posy;
	mouse_posx=x;
	mouse_posy=y;
	mouse_posx_div=mouse_posx-mouse_posx_old;
	mouse_posy_div=mouse_posy-mouse_posy_old;
}

function WriteToLog(s) {
    var logElement=document.getElementById("log");
	for (var i=0;i<s.length;i++) 
	{
		if (s[i]=="\b") {logElement.innerHTML="";continue;}
		if (s[i]=="\n") {logElement.innerHTML+="<br/>"; continue;}
		logElement.innerHTML+=s[i]; 
	}
}

function Render() {
	rasterizer.RenderPrimitives(cam);
    rasterizer.Render();
    spansin=rasterizer.SpansIn;
    spansout=rasterizer.SpansOut;
	//rasterizer.ZBufferToScreen();
}


function UpdateKeys() {
	
	


	if (keys[(90)]) {m_render_zbuffer=true;}
	if (keys[(85)]) {m_render_zbuffer=false;}




	if (keys[(87)]) {cam.Move(0,-3);}
    if (keys[(83)]) {cam.Move(0,3);}
    if (keys[(65)]) {cam.Move(3,0);}
    if (keys[(68)]) {cam.Move(-3,0);}

}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function UpdateMouse() {
	if (mouse_key !=0) {
		cam.Turn(mouse_posy_div*18,-mouse_posx_div*18);
		mouse_posx_div=0;
		mouse_posy_div=0;
	}

    WriteToLog("FPS............................: "+fps+"\n"+"\n");
	WriteToLog("MouseKey ......................: "+mouse_key+"\n");
	WriteToLog("MousePos ......................: "+mouse_posx+","+mouse_posy+"\n");
	WriteToLog("MousePos_old ..................: "+mouse_posx_old+","+mouse_posy_old+"\n");
	WriteToLog("MousePos_div ..................: "+mouse_posx_div+","+mouse_posy_div+"\n\n");
    var stat=rasterizer.getStatistic();
	
	WriteToLog("primitives in .................: "+stat.prims_in+"\n");
	WriteToLog("Prims culld by AABB Frustum....: "+stat.prims_aabb_frus+"\n");
	WriteToLog("Prims culld by OcclusionMask...: "+stat.prims_mask+"\n");
	WriteToLog("primitives rendered ...........: "+stat.prims_ren+"\n\n");
	
	WriteToLog("Spans in.......................: "+spansin+"\n");
	WriteToLog("Spans.out......................: "+spansout+"\n");
	WriteToLog("Spans out in %.................: "+(((spansout/spansin)*100)|0)+"%\n\n");
	 
	//WriteToLog("Last Key down .................: "+m_last_key_down+"\n");

	


  

	
}

function Update() {
	WriteToLog("\b");
	this.UpdateKeys();
	this.UpdateMouse();

}
  

function GameLoop() {
  
//	canvas.Clear();
	
	Update();
	rasterizer.Start();
	Render();

	
   

	if (m_render_zbuffer) {
		rasterizer.ZBufferToScreenOLD();
	}
	canvas.Redraw();
	
//	rasterizer.ClearZBuffer();
rasterizer.FlipZBuffer();	
canvas.flip();
    
}



function myTimer() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;

    // --- Frame rendern ---
    GameLoop();
    frameCounter++;

    // --- FPS Messung ---
    if (now - fpsTime >= 1000) {
        fps = frameCounter;
        frameCounter = 0;
        fpsTime = now;


    }

  //  requestAnimationFrame(myTimer);
}

function testMask() {

    const m = new OcclusionMask(256, 256);

    // sollte leer sein
    console.assert(m.isOccludedRect(0, 31, 0, 31) === false);

    // markiere ein Tile (0,0)
    m.markRect(0, 31, 0, 31);

    // jetzt muss es true sein
    console.assert(m.isOccludedRect(0, 31, 0, 31) === true);

    // angrenzendes Tile darf NICHT ok sein
    console.assert(m.isOccludedRect(32, 63, 0, 31) === false);

    console.log("OcclusionMask self-test done");
}


async function loadScene() {

    const mesh = await OBJLoader.loadFromURL("models/smalercity.obj", 1);
	
    for (let i=0;i<mesh.length;i++) {
	    console.log("Add ["+i+"}")
		rasterizer.AddPrimitive(mesh[i]);
   } 

     let s=6;
 let aa=0;
 for (let z=-s;z<s;z++)
   for (let y=-s;y<s;y++)  
   for (let x=-s;x<s;x++) {

     var p=CreateCube(new Vector3(x*4,y*4,z*4),POLY_PERSPECTIVE_TEXTURED) 
   //  for (let i=0;i<p.length;i++) rasterizer.AddPrimitive(p[i]);
   }
	rasterizer.BuildBHV();
}

function Init() {

	canvas.Canvas.addEventListener("mouseleave", (event) => {
		mouse_key=0;

	});

	canvas.Canvas.addEventListener("mousemove", (ev) => {
        let cols = canvas.width;
        let { offsetX, offsetY } = ev;
        
		SetMousePos(offsetX,offsetY);
        if (!use_timer)  GameLoop();
      });
      
	  canvas.Canvas.addEventListener("mousedown", (e) => {
		switch (e.button) {
		  case 0:
			mouse_key |=MOUSE_BUTTON_LEFT;
			break;
		  case 1:
			mouse_key |=MOUSE_BUTTON_MIDDLE;
			break;
		  case 2:
			//mouse_key |=MOUSE_BUTTON_RIGHT;
			break;
		  default:
			break;
		}
	  });

	  canvas.Canvas.addEventListener("mouseup", (e) => {
		
		switch (e.button) {
		  case 0:
			mouse_key &=~MOUSE_BUTTON_LEFT;
			break;
		  case 1:
			mouse_key &=~MOUSE_BUTTON_MIDDLE;
			break;
		  case 2:
			//mouse_key &=~MOUSE_BUTTON_RIGHT;
			break;
		  default:
			break;
		}
	  });







	  //obj3d
   



   for (let i=0;i<256;i++) {keys[i]=false; prekeys[i]=false;}


   spanrenderer = new SpanRenderer(rasterizer);
   canvas.Clear();


   InitCamera();
   

//   loadScene();
 

/*   const obj  = OBJLoader.parseFromString(TEST);
  const mesh= OBJLoader.buildPolygons(obj, 1);
  for (let i=0;i<mesh.length;i++) {
	    console.log("Add ["+i+"}")
		rasterizer.AddPrimitive(mesh[i]);
   } 
*/
   
   let s=6;
 let aa=0;
 for (let z=-s;z<s;z++)
   for (let y=-s;y<s;y++)  
   for (let x=-s;x<s;x++) {

     var p=CreateCube(new Vector3(x*4,y*4,z*4),POLY_PERSPECTIVE_TEXTURED) 
     for (let i=0;i<p.length;i++) rasterizer.AddPrimitive(p[i]);
   }
   rasterizer.BuildBHV();

	

   //var p=CreateCube(new Vector3(0,0,0),POLY_PERSPECTIVE_TEXTURED) 
   // for (let i=0;i<p.length;i++) rasterizer.AddPrimitive(p[i]);
   
   if (use_timer)   setInterval(myTimer, 30);
   
}


window.addEventListener("keydown", function(event) {
	if (event.defaultPrevented) {
	  return;
	}
   //console.log(event.keyCode);
   prekeys[event.keyCode]=keys[event.keyCode];
   keys[event.keyCode]=true;

   m_last_key_down=event.keyCode;
	switch (event.keyCode) {
        default: break;
	};

	event.preventDefault();
	if (!use_timer)  GameLoop();
	
  }, true);

  window.addEventListener("keyup", function(event) {
	if (event.defaultPrevented) {
	  return;
	}
	prekeys[event.keyCode]=keys[event.keyCode];

	keys[event.keyCode]=false;
	switch (event.keyCode) {
        default: break;
	};

	event.preventDefault();
  }, true);


  window.onload = Init;

 
  