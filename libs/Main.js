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
var m_wheel_delta=1000000;
var use_timer = false;

var lastCalledTime;
var fps=0;
//var meter = new FPSMeter();

var meter = new FPSMeter(document.getElementById('render'), { graph: 2 });

////////////////////////////////////
var render_zbuffer =false;
var cam = new Camera();
var m_last_key_down=0;
var m_render_zbuffer =false;
var m_use_spanbuffer =true;
var m_show_fps=true;
var m_main_portals=[];
var m_main_primitives=[];
var m_map_compiler=null;

var m_bsp_center=new Vector2(0,0);
const MOUSE_BUTTON_LEFT = 1<<1;
const MOUSE_BUTTON_MIDDLE = 1<<2;
const MOUSE_BUTTON_RIGHT = 1<<3
var bsp=null;


//////////////////////////////////////////////////////////////
var target_portal=null;
var source_portal=null;
var test_ports=new Array();

function InitCamera() {
	let	FOV =  60;
	cam.aspect  = ( width * 1) / ( height* 1); 
	cam.fov     = FOV *  3.14159265359 /  180;
	cam.near    = 0.001;
	cam.far     = 10000;
	cam.LookAt(new Vector3(0,0,0));
	cam.position= new Vector3(0,0,-10);
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
	rasterizer.RenderPrimitives();
    rasterizer.Render();
    spansin=rasterizer.SpansIn;
    spansout=rasterizer.SpansOut;
	
}


function UpdateKeys() {
	
	


	if (keys[(90)]) {m_render_zbuffer=true;}
	if (keys[(85)]) {m_render_zbuffer=false;}


    let speed=10;

	if (keys[(87)]) {cam.Move(0,-speed);}
    if (keys[(83)]) {cam.Move(0,speed);}
    if (keys[(65)]) {cam.Move(speed,0);}
    if (keys[(68)]) {cam.Move(-speed,0);}

}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function ProBar(ist,max,len=20) {
	let p=ist/max;
	let pl=p*len;
	let s="|"
	for (let i=0;i<len;i++) {
	   if (i<=pl)s+='#'; else s+='_';		
	}
    s+="| "+Math.round((p*100))+"%";
	return s;
}


function UpdateMouse() {

	if (mouse_key ==2) {
		cam.Turn(mouse_posy_div*18,-mouse_posx_div*18);
	}

	if (mouse_key ==4) {
	   m_bsp_center.x+=mouse_posx_div;
	   m_bsp_center.y+=mouse_posy_div;
	}


	mouse_posx_div=0;
    mouse_posy_div=0;
	
 	
}

function Update() {
	WriteToLog("\b");
	this.UpdateKeys();
	this.UpdateMouse();

}


function renderTest() {
    if (source_portal) {
	let p0= new Polygon(source_portal.verts);
	rasterizer.DrawPolyLined2(p0,new Vector3(0,1,0));

	}
    if (target_portal) {
	let p1= new Polygon(target_portal.verts);
	rasterizer.DrawPolyLined2(p1,new Vector3(1,0,0));

	}

	for (let p of test_ports) rasterizer.DrawPolyLined2(p,new Vector3(1,0,1));
	

}

function GameLoop() {
  
	
	Update();
	rasterizer.Start(cam);
	Render();

	if (m_render_zbuffer) {
   	   //rasterizer.IBufferToScreen();	
	   rasterizer.ZBufferToScreenOLD();
	}
	if (rasterizer._bhv) {
    //   rasterizer._bhv.renderLeafs(rasterizer);
       //rasterizer._bhv.renderPortals(rasterizer)
         
	}
	if (bsp) bsp.renderLeafs(rasterizer);
//	renderTest();
	canvas.DrawCoursor();
	canvas.Redraw();


canvas.flip();
    
}

function myTimer() {

    // --- Frame rendern ---
meter.tickStart();
	// ... rendering happens here ...
	
    GameLoop();
 meter.tick();
  //  requestAnimationFrame(myTimer);
}






function ReadMapFromString() {
  var text=    document.getElementById("mapsource").value;

}

function readBytes(path) {
    const buffer = fs.readFileSync(path);
    return buffer; // rohe Bytes
}

function LoadMap() {
	
	var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => { 
       const file = e.target.files[0];
  	   const reader = new FileReader();	   
	   console.log(file.name);  
	   reader.onload = function() {
            const text = reader.result;
		//	document.getElementById("").value = text;
          
			m_map_compiler= new MapCompiler();
            m_map_compiler.CompileFromString(text);
            rasterizer.SetBSP(m_map_compiler.bsp) ;
		};
       reader.readAsText(file);  
	}

   input.click();
}


function InitTest() {
	let verts=[];



	verts.push(new Vector3(-10,-10,10));
	verts.push(new Vector3( 10,-10,10));
	verts.push(new Vector3( 10, 10,10));
	verts.push(new Vector3(-10, 10,10));
   
  {
	target_portal=new Portal(verts);
	verts=verts.reverse();


	for (let v of verts) v.z*=-1;
       source_portal=new Portal(verts);
  }



     let ap=AntiPenumbra.Build(source_portal,target_portal);
	 let polys=ap.BuildPolygons();
	 for (let pp of polys) {
		//DebugOut(pp.toStr()+"\n");
	 }
test_ports=polys;
//	 rasterizer.AddPrimitive(polys);
    rasterizer.BuildBVH();


}


function SaveHelp(x,y) {
 var canvas = new Canvas("texture_canvas",64,64);
  let temp=GetStaticTextureData(x*64,y*64);
        for (let i=0;i<64*64;i++)canvas.GetActiveBuffer()[i]=temp[i];
     canvas.Redraw();
          canvas.SaveAsImg("Texture"+x.toString()+"x"+y.toString());
  
}

function Init() {
InitTest();
ClearDebugOut();

   for (let x=0;x<4;x++)
	for (let y=0;y<4;y++) 
    {
       let data=GetStaticTextureData(x*64,y*64);;
	   let name="Texture"+x.toString()+"x"+y.toString();  
	   let texture=new Texture(data,64,64)   
	   global_texture_manager.AddTexture(name,texture)
	}



let v0=new Array(new Vector3(0,0,0),new Vector3(10,0,0),new Vector3(10,10,0));

    



	canvas.Canvas.addEventListener("mouseleave", (event) => {
		mouse_key=0;

	});

	canvas.Canvas.addEventListener("mousemove", (ev) => {
        let cols = canvas.width;
        let { offsetX, offsetY } = ev;
        canvas.SetMousePos(ev)
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

	 
	 canvas.Canvas.addEventListener("wheel", function(event) {
		
		if (event.deltaY>0) m_wheel_delta += 10000;
		  else m_wheel_delta -= 10000;
		  if (m_wheel_delta < 10000) m_wheel_delta=10000;
    
     });

	 
	  {
	   const checkbox = document.getElementById('use_spanbuffer_checkbox')
  	         checkbox.checked=rasterizer._use_spanbuffer;  
	         checkbox.addEventListener('change', (event) => {
              rasterizer._use_spanbuffer=event.currentTarget.checked;
         })
	  }

        
	 
	 
	 
	  {
	   const checkbox = document.getElementById('use_node_frustum_culling')
  	         checkbox.checked=rasterizer._use_node_frustum_culling;  
	         checkbox.addEventListener('change', (event) => {
              rasterizer._use_node_frustum_culling=event.currentTarget.checked;
         })
	  }

	 
	  {
	   const checkbox = document.getElementById('use_node_hzbuffer_culling')
  	         checkbox.checked=rasterizer._use_node_hzbuffer_culling;  
	         checkbox.addEventListener('change', (event) => {
              rasterizer._use_node_hzbuffer_culling=event.currentTarget.checked;
         })
	  }
     {
	   
		const checkbox = document.getElementById('use_timer');
  	         checkbox.checked=use_timer;  
	         checkbox.addEventListener('change', (event) => {
              use_timer=event.currentTarget.checked;
			  if (use_timer)   setInterval(myTimer, 30);
         })
	  }

	 
	
	

	
	{
	   const checkbox = document.getElementById('render_zbuffer_checkbox')
	   checkbox.checked=m_render_zbuffer;

	    checkbox.addEventListener('change', (event) => {
           m_render_zbuffer=event.currentTarget.checked;
         })
	}

///////////////////////////////////////////////////////////////////////////////

	{
	   const checkbox = document.getElementById('csg_checkbox')
	     checkbox.checked=false;
       
	    checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('vis_checkbox').checked=false;
				document.getElementById('bsp_checkbox').checked=false;
				document.getElementById('por_checkbox').checked=false;
				document.getElementById('pvs_checkbox').checked=false;
			}
           //m_render_zbuffer=event.currentTarget.checked;
         })
	}


	{
	   const checkbox = document.getElementById('vis_checkbox')
	     checkbox.checked=false;
       
 	    checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('bsp_checkbox').checked=false;
				document.getElementById('por_checkbox').checked=false;
				document.getElementById('pvs_checkbox').checked=false;
			}
           //m_render_zbuffer=event.currentTarget.checked;
         })
	}

	{
	   const checkbox = document.getElementById('bsp_checkbox')
	     checkbox.checked=false;
       
	    checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('por_checkbox').checked=false;
				document.getElementById('pvs_checkbox').checked=false;
			}
           //m_render_zbuffer=event.currentTarget.checked;
         })
	}

	{
	   const checkbox = document.getElementById('por_checkbox')
	     checkbox.checked=false;
       
	    checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('por_checkbox').checked=false;
				document.getElementById('pvs_checkbox').checked=false;
			}
           //m_render_zbuffer=event.currentTarget.checked;
         })
	}

	{
	   const checkbox = document.getElementById('pvs_checkbox')
	     checkbox.checked=false;
       
	    checkbox.addEventListener('change', (event) => {
           //m_render_zbuffer=event.currentTarget.checked;
         })
	}




	  //obj3d
   



   for (let i=0;i<256;i++) {keys[i]=false; prekeys[i]=false;}


   
   canvas.Clear();


   InitCamera();

   


   meter = new FPSMeter(document.getElementById('target'), { graph: 2,heat: 1 });
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

 
  