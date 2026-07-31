const width = 320 * 2;
const height = 200 * 2;
var now = new Date();
var oldTime;
var time;
var frameTime;
var canvas = new Canvas("canvas", width, height);
var rasterizer = new Rasterizer(canvas);
var biglightmap = new BigLightMap("lightmap", width, width);
var keys = new Array(256);
var prekeys = new Array(256);
var polys = new Array();
var obj3d = new IndexedObject();

var spansin = 0;
var spansout = 0;
////////////////////////////////////
var mouse_key = 0;
var mouse_posx = 0;
var mouse_posy = 0;
var mouse_posx_old = 0;
var mouse_posy_old = 0;
var mouse_posx_div = 0;
var mouse_posy_div = 0;
////////////////////////////////////

var test_cell = false;

var m_wad = null;
var test_pos = new Vector3()
var m_wheel_delta = 1000000;
var use_timer = false;

var render_leaf = 0;

var lastCalledTime;
var fps = 0;
//var meter = new FPSMeter();

var meter = new FPSMeter(document.getElementById('render'), { graph: 2 });
var compiler_options = COMPILER_ALL;

////////////////////////////////////
var render_zbuffer = false;
var cam = new Camera();
var m_last_key_down = 0;
var m_render_zbuffer = false;
var m_use_spanbuffer = true;
var m_show_fps = true;
var m_main_portals = [];
var m_main_primitives = [];
var m_map_compiler = null;

var m_merger = null;
var m_bsp_center = new Vector2(0, 0);
const MOUSE_BUTTON_LEFT = 1 << 1;
const MOUSE_BUTTON_MIDDLE = 1 << 2;
const MOUSE_BUTTON_RIGHT = 1 << 3
var bsp = null;
var pvs = null;
var use_shader = false;
//////////////////////////////////////////////////////////////

let test_polygon_list = null;
let test_polygon = null;
let m_port_mega = null;

let hhh = 0;
function InitCamera() {
	let FOV = 60;
	cam.aspect = (width * 1) / (height * 1);
	cam.fov = FOV * 3.14159265359 / 180;
	cam.near = 0.001;
	cam.far = 10000;
	cam.LookAt(new Vector3(0, 0, 0));
	cam.position = new Vector3(0, 0, -10);
}

function Sig(key) {
}

function SetMousePos(x, y) {
	mouse_posx_old = mouse_posx;
	mouse_posy_old = mouse_posy;
	mouse_posx = x;
	mouse_posy = y;
	mouse_posx_div = mouse_posx - mouse_posx_old;
	mouse_posy_div = mouse_posy - mouse_posy_old;
}

function WriteToLog(s) {
	var logElement = document.getElementById("log");
	for (var i = 0; i < s.length; i++) {
		if (s[i] == "\b") { logElement.innerHTML = ""; continue; }
		if (s[i] == "\n") { logElement.innerHTML += "<br/>"; continue; }
		logElement.innerHTML += s[i];
	}
}

function Render() {
	rasterizer.RenderPrimitives();
	rasterizer.Render();
	spansin = rasterizer.SpansIn;
	spansout = rasterizer.SpansOut;

}



function AddOption(name) {
	var opt = document.createElement("option");


	opt.text = name;
	opt.value = name;
	document.getElementById("meineListbox").options.add(opt);

}

function LoadWad() {
	var input = document.createElement('input');


	input.type = 'file';
	input.onchange = e => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = function () {
			const text = reader.result;
			m_wad = new Wad3File(text);
			AddOption("Doof");
		};
		reader.readAsText(file);
	}

	input.click();
}




function UpdateKeys() {


	let s = 10;

	if (keys[81]) test_cell = true; else test_cell = false;
	if (keys[(36)]) test_pos.x += s;
	if (keys[(38)]) test_pos.z += s;
	if (keys[(33)]) test_pos.x -= s;

	if (keys[(37)]) test_pos.y -= s;
	if (keys[(12)]) test_pos.z -= s;
	if (keys[(39)]) test_pos.y += s;


	if (keys[(107)]) render_leaf++;
	if (keys[(109)]) render_leaf--;


	//if (keys[(35)])test_pos.z+=s;
	//if (keys[(40)])test_pos.z-=s;
	//if (keys[(34)])test_pos.z-=s;


	if (keys[(90)]) { m_render_zbuffer = true; }
	if (keys[(85)]) { m_render_zbuffer = false; }


	let speed = 10;

	if (keys[(87)]) { cam.Move(0, -speed); }
	if (keys[(83)]) { cam.Move(0, speed); }
	if (keys[(65)]) { cam.Move(speed, 0); }
	if (keys[(68)]) { cam.Move(-speed, 0); }

}

function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

function ProBar(ist, max, len = 20) {
	let p = ist / max;
	let pl = p * len;
	let s = "|"
	for (let i = 0; i < len; i++) {
		if (i <= pl) s += '#'; else s += '_';
	}
	s += "| " + Math.round((p * 100)) + "%";
	return s;
}


function UpdateMouse() {

	if (mouse_key == 2) {
		cam.Turn(mouse_posy_div * 18, -mouse_posx_div * 18);
	}

	if (mouse_key == 4) {
		m_bsp_center.x += mouse_posx_div;
		m_bsp_center.y += mouse_posy_div;
	}


	mouse_posx_div = 0;
	mouse_posy_div = 0;


}


function Update() {
	WriteToLog("\b");
	this.UpdateKeys();
	this.UpdateMouse();


	if (mouse_key & MOUSE_BUTTON_MIDDLE) {
		console.log("MAUSE MITTE")
		test_polygon = null;
		if (!test_polygon_list || !rasterizer || !rasterizer._ibuffer) return;
		let c = rasterizer._ibuffer[mouse_posx + mouse_posy * rasterizer._width];
		if (GetIndexObjType(c) != 1) return;
		let index = GetIndexObjIndex(c);
		//if (index < 0 || index >= test_polygon_list.length) 
		test_polygon = test_polygon_list[index];
		//console.log(index, test_polygon, test_polygon_list.length)

	}
}




function GameLoop() {


	Update();

	rasterizer.Start(cam);

	if (pvs) pvs.render(rasterizer);



	Render();

	//	depthPixelate(canvas.GetActiveBuffer(), rasterizer.GetZBuffer(), canvas.width, canvas.height, { nearBlock: 12, farBlock: 1 });
	//	if (use_shader) ditherMonochromeZ(canvas.GetActiveBuffer(), rasterizer.GetZBuffer(), canvas.width, canvas.height, { enableNoise: true, noiseAmount: 12 })
	if (use_shader) rasterizer.IBufferToScreen();
	//ditherMonochrome(canvas.GetActiveBuffer(), canvas.width, canvas.height, { enableNoise: true, noiseAmount: 12 })
	//	if (test_polygon) rasterizer.DrawPolyLined4(test_polygon)
	if (pvs && test_cell) {
		let id = rasterizer.GetObjectId();

		if (GetIndexObjType(id) === CELL_INDEX) {
			id = GetIndexObjIndex(id);
			console.log(id)
			pvs.renderSingelCellHull(rasterizer, id);
		}

	}


	canvas.DrawCoursor();
	canvas.Redraw();
	//    console.log(biglightmap.width,biglightmap.height);
	//	biglightmap.SetClearColor(RGB(0, hhh++, 0));
	//	biglightmap.Clear();

	biglightmap.Redraw();



	canvas.flip();

}

function MachWas() {
	if (!pvs) return;

	pvs.Optimize();

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
	var text = document.getElementById("mapsource").value;

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

		reader.onload = function () {
			const text = reader.result;
			rasterizer.FlushPrimitives();
			test_polygon = null;
			test_polygon_list = null;
			m_map_compiler = new MapCompiler();
			m_map_compiler.CompileFromString(text, compiler_options);

			if (m_map_compiler.brush_list) {
				for (let b of m_map_compiler.brush_list) rasterizer.AddPrimitive(b.primitives);
				//	rasterizer.BuildBVH();
			}

			/*      if (m_map_compiler.polylist) {
					  rasterizer.AddPrimitive(m_map_compiler.polylist);
					  rasterizer.BuildBVH();
				  }
			  */
			if (m_map_compiler.bsp) {
				biglightmap.Clear();
				biglightmap.CalcLightmap(m_map_compiler.bsp.ExtractPrimsNoCopy(), m_map_compiler.lights);

				pvs = m_map_compiler.pvs;
				//	 m_merger= new CellMerger(m_map_compiler.bsp);


				//rasterizer.SetBSP(m_map_compiler.bsp);

			}



		};
		reader.readAsText(file);
	}

	input.click();
}

function LoadWad() {

	var input = document.createElement('input');
	input.type = 'file';
	input.onchange = e => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = function () {
			const text = reader.result;
			m_wad = new Wad3File(text);



		};
		reader.readAsArrayBuffer(file);
	}

	input.click();
}


function SaveHelp(x, y) {
	var canvas = new Canvas("texture_canvas", 64, 64);
	let temp = GetStaticTextureData(x * 64, y * 64);
	for (let i = 0; i < 64 * 64; i++)canvas.GetActiveBuffer()[i] = temp[i];
	canvas.Redraw();
	canvas.SaveAsImg("Texture" + x.toString() + "x" + y.toString());

}



function IsPortalCovered(port, hulls) {
	let edge_list = [];
	for (let i = 0; i < port.verts.length; i++) {
		let j = (i + 1) % port.verts.length
		let v0 = port.verts[i];
		let v1 = port.verts[j];
		let edge_list = [[v0, v1]];

		let change = true;

		for (let h of hulls) {
			let next = []
			for (let e of edge_list) {
				let fragmenst = h.clipSegmentOutsideHull(e);
				next.push(...fragmenst);
			}
			edge_list = next;
		}
		if (edge_list.length > 0) return false;

	}
	return true;

}




function Init() {

	ClearDebugOut();

	for (let x = 0; x < 4; x++)
		for (let y = 0; y < 4; y++) {
			let data = GetStaticTextureData(x * 64, y * 64);;
			let name = "Texture" + x.toString() + "x" + y.toString();
			let texture = new Texture(data, 64, 64)
			global_texture_manager.AddTexture(name, texture)
		}



	let v0 = new Array(new Vector3(0, 0, 0), new Vector3(10, 0, 0), new Vector3(10, 10, 0));

	biglightmap.SetClearColor(RGB(0, 100, 0));
	biglightmap.Clear();

	canvas.Canvas.addEventListener("mouseleave", (event) => {
		mouse_key = 0;

	});

	canvas.Canvas.addEventListener("mousemove", (ev) => {
		let cols = canvas.width;
		let { offsetX, offsetY } = ev;
		canvas.SetMousePos(ev)
		SetMousePos(offsetX, offsetY);
		if (!use_timer) GameLoop();
	});

	canvas.Canvas.addEventListener("mousedown", (e) => {
		switch (e.button) {
			case 0:
				mouse_key |= MOUSE_BUTTON_LEFT;
				break;
			case 1:
				mouse_key |= MOUSE_BUTTON_MIDDLE;

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
				mouse_key &= ~MOUSE_BUTTON_LEFT;
				break;
			case 1:
				mouse_key &= ~MOUSE_BUTTON_MIDDLE;
				break;
			case 2:
				//mouse_key &=~MOUSE_BUTTON_RIGHT;
				break;
			default:
				break;
		}
	});


	canvas.Canvas.addEventListener("wheel", function (event) {

		if (event.deltaY > 0) m_wheel_delta += 10000;
		else m_wheel_delta -= 10000;
		if (m_wheel_delta < 10000) m_wheel_delta = 10000;

	});


	{
		const checkbox = document.getElementById('use_spanbuffer_checkbox')
		checkbox.checked = rasterizer._use_spanbuffer;
		checkbox.addEventListener('change', (event) => {
			rasterizer._use_spanbuffer = event.currentTarget.checked;
		})
	}





	{
		const checkbox = document.getElementById('use_node_frustum_culling')
		checkbox.checked = rasterizer._use_node_frustum_culling;
		checkbox.addEventListener('change', (event) => {
			rasterizer._use_node_frustum_culling = event.currentTarget.checked;
		})
	}


	{
		const checkbox = document.getElementById('use_node_hzbuffer_culling')
		checkbox.checked = rasterizer._use_node_hzbuffer_culling;
		checkbox.addEventListener('change', (event) => {
			rasterizer._use_node_hzbuffer_culling = event.currentTarget.checked;
		})
	}
	{

		const checkbox = document.getElementById('use_timer');
		checkbox.checked = use_timer;
		checkbox.addEventListener('change', (event) => {
			use_timer = event.currentTarget.checked;
			if (use_timer) setInterval(myTimer, 30);
		})
	}
	{

		const checkbox = document.getElementById('use_shader');
		checkbox.checked = use_timer;
		checkbox.addEventListener('change', (event) => {
			use_shader = event.currentTarget.checked;

		})
	}






	{
		const checkbox = document.getElementById('render_zbuffer_checkbox')
		checkbox.checked = m_render_zbuffer;

		checkbox.addEventListener('change', (event) => {
			m_render_zbuffer = event.currentTarget.checked;
		})
	}

	{
		const checkbox = document.getElementById('debug_checkbox')


		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {

				compiler_options &= ~COMPILER_DEBUG_MODE;
			} else compiler_options |= COMPILER_DEBUG_MODE;

			DebugOut("> " + compiler_options + "\n");
		})
	}





	{
		const checkbox = document.getElementById('csg_checkbox')
		// checkbox.checked=false;

		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('vis_checkbox').checked = false;
				document.getElementById('bsp_checkbox').checked = false;
				document.getElementById('por_checkbox').checked = false;
				document.getElementById('pvs_checkbox').checked = false;

				document.getElementById('vis_checkbox').disabled = true;
				document.getElementById('bsp_checkbox').disabled = true;
				document.getElementById('por_checkbox').disabled = true;
				document.getElementById('pvs_checkbox').disabled = true;

				compiler_options &= ~COMPILER_CSG;
				compiler_options &= ~COMPILER_REMOVE_VIS;
				compiler_options &= ~COMPILER_FINAL_BSP;
				compiler_options &= ~COMPILER_BUILD_PORTALS;
				compiler_options &= ~COMPILER_BUILD_PVS;

			} else { document.getElementById('vis_checkbox').disabled = false; compiler_options |= COMPILER_CSG; }

		})
	}


	{
		const checkbox = document.getElementById('vis_checkbox')
		//   checkbox.checked=false;

		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('bsp_checkbox').checked = false;
				document.getElementById('por_checkbox').checked = false;
				document.getElementById('pvs_checkbox').checked = false;

				document.getElementById('bsp_checkbox').disabled = true;
				document.getElementById('por_checkbox').disabled = true;
				document.getElementById('pvs_checkbox').disabled = true;
				compiler_options &= ~COMPILER_REMOVE_VIS;

				compiler_options &= ~COMPILER_FINAL_BSP;
				compiler_options &= ~COMPILER_BUILD_PORTALS;
				compiler_options &= ~COMPILER_BUILD_PVS;


			} else { document.getElementById('bsp_checkbox').disabled = false; compiler_options |= COMPILER_REMOVE_VIS; }
			DebugOut("> " + compiler_options + "\n");

			//m_render_zbuffer=event.currentTarget.checked;
		})
	}

	{
		const checkbox = document.getElementById('bsp_checkbox')
		//checkbox.checked=false;

		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('por_checkbox').checked = false;
				document.getElementById('pvs_checkbox').checked = false;

				document.getElementById('por_checkbox').disabled = true;
				document.getElementById('pvs_checkbox').disabled = true;
				compiler_options &= ~COMPILER_FINAL_BSP;

				compiler_options &= ~COMPILER_BUILD_PORTALS;
				compiler_options &= ~COMPILER_BUILD_PVS;

			} else { document.getElementById('por_checkbox').disabled = false; compiler_options |= COMPILER_FINAL_BSP; }
			DebugOut("> " + compiler_options + "\n");

			//m_render_zbuffer=event.currentTarget.checked;
		})
	}

	{
		const checkbox = document.getElementById('por_checkbox')
		//checkbox.checked=false;

		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				document.getElementById('pvs_checkbox').checked = false;

				document.getElementById('pvs_checkbox').disabled = true;
				compiler_options &= ~COMPILER_BUILD_PORTALS;
				compiler_options &= ~COMPILER_BUILD_PVS;

			} else { document.getElementById('pvs_checkbox').disabled = false; compiler_options |= COMPILER_BUILD_PORTALS; }
			DebugOut("> " + compiler_options + "\n");

			//m_render_zbuffer=event.currentTarget.checked;
		})
	}

	{
		const checkbox = document.getElementById('pvs_checkbox')
		//checkbox.checked=false;

		checkbox.addEventListener('change', (event) => {
			if (!event.currentTarget.checked) {
				compiler_options &= ~COMPILER_BUILD_PVS;
			} else compiler_options |= COMPILER_BUILD_PVS;
			DebugOut("> " + compiler_options + "\n");
		})
	}


	///////////////////////////////////////////////////////////////////////////////
	document.getElementById('debug_checkbox').checked = COMPILER_DEBUG_MODE & compiler_options;
	document.getElementById('csg_checkbox').checked = COMPILER_CSG & compiler_options;
	document.getElementById('vis_checkbox').checked = COMPILER_REMOVE_VIS & compiler_options;
	document.getElementById('bsp_checkbox').checked = COMPILER_FINAL_BSP & compiler_options;
	document.getElementById('por_checkbox').checked = COMPILER_BUILD_PORTALS & compiler_options;
	document.getElementById('pvs_checkbox').checked = COMPILER_BUILD_PVS & compiler_options;




	document.getElementById('debug_checkbox').disabled = !document.getElementById('debug_checkbox').checked;
	document.getElementById('csg_checkbox').disabled = !document.getElementById('csg_checkbox').checked;
	document.getElementById('vis_checkbox').disabled = !document.getElementById('vis_checkbox').checked;
	document.getElementById('bsp_checkbox').disabled = !document.getElementById('bsp_checkbox').checked;
	document.getElementById('por_checkbox').disabled = !document.getElementById('por_checkbox').checked;
	document.getElementById('pvs_checkbox').disabled = !document.getElementById('pvs_checkbox').checked;

	///////////////////////////////////////////////////////////////////////////////



	//obj3d




	for (let i = 0; i < 256; i++) { keys[i] = false; prekeys[i] = false; }



	canvas.Clear();


	InitCamera();




	meter = new FPSMeter(document.getElementById('target'), { graph: 2, heat: 1 });
	if (use_timer) setInterval(myTimer, 30);





}





window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
		return;
	}
	//console.log(event.keyCode);
	prekeys[event.keyCode] = keys[event.keyCode];
	keys[event.keyCode] = true;


	m_last_key_down = event.keyCode;
	switch (event.keyCode) {
		default: break;
	};

	event.preventDefault();
	if (!use_timer) GameLoop();

}, true);

window.addEventListener("keyup", function (event) {
	if (event.defaultPrevented) {
		return;
	}
	prekeys[event.keyCode] = keys[event.keyCode];

	keys[event.keyCode] = false;
	switch (event.keyCode) {
		default: break;
	};

	event.preventDefault();
}, true);


window.onload = Init;


