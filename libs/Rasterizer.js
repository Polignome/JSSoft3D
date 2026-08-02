
const POLY_FILLED = 1 << 1;
const POLY_AFFINE_TEXTURED = 1 << 2;
const POLY_PERSPECTIVE_TEXTURED = 1 << 3;
const POLY_LINED_FILLED_ZEBUFFER = 1 << 4;
const POLY_FILLED_ZEBUFFER = 1 << 5;
const POLY_LINED = 1 << 6;


const FIXED_POINT = 16;

// 
//    0..255   16       1.048.576
// |---------|----|------------------------|  
// |0000 0000|0000|0000 0000 0000 0000 0000|
//             24    20   16   12   8    4


const POLY_INDEX = 1
const CELL_INDEX = 2

function CalcIndex(obj_type, obj_attrib, obj_index) {
  return (obj_type) << 24 | (obj_attrib) << 20 | obj_index;
}

function GetIndexObjType(objid) {
  return (objid & 0xff000000) >> 24;
}
function GetIndexObjAttrib(objid) {
  return (objid & 0x00f00000) >> 20;
}
function GetIndexObjIndex(objid) {
  return (objid & 0x000fffff);
}


class Rasterizer {
  constructor(canvas) {
    this._use_BVH = true;
    this._use_zbuffer = true;
    this._enable_culling = false;    //0=culling off 1==backface culling
    this._abient_light = new Vector3(0.5, 0.5, 0.5);

    this._xScale = 1;//0.0198;
    this._yScale = 1;//0.0170;
    this._canvas = canvas;
    this._width = 0;
    this._height = 0;
    this._screenCenter_x = this._width / 2;
    this._screenCenter_y = this._height / 2;

    this._LOESCHEN = 0;


    this._spans_in = 0;
    this._spans_rendered = 0;


    this._maxscale = 0;
    this._maxscale = 0;
    this._maxscreenscaleinv = 0;



    this._max_depth = 1.0;
    this._max_depth_h = this._max_depth / 2;
    this.resize(this._canvas.width, this._canvas.height);

    //    this._bhv=null;

    this._ibuffer = new Int32Array();
    this._nbuffer = new Float32Array();

    this._zbuffer = null;//new Float64Array(); // Muss null da sonst nicht hzbuffer init
    this._hzbuffer = new HierarchicalZBuffer();
    this._spanrenderer = new SpanRenderer(this);

    this._primitives = new Array();
    this._bvh = new BVH(this);
    this._bsp = null;


    this._BeamTree = new BeamTree();

    this.light_map = null;
    this._dummy_texture = new Texture();

    this.xform = new Matrix4x4();
    this.frustum = new Frustum();


    this._primitives_in = 0;
    this._primitives_rendered = 1;
    this._node_hzb_culled = 2;
    this._node_aabb_frustum_culled = 3;
    this._node_aabb_project_culled = 4;
    this._primitives_back_face_culling = 5;
    this._primitives_frustum_culling = 6;
    this._primitives_transform_culling = 7;
    this._primitives_project_culling = 8;

    this._use_node_frustum_culling = true;
    this._use_node_hzbuffer_culling = true;

    this._clear_spanbuffer = true;
    this._use_spanbuffer = true;
    this.this_help = false;


    this._canvas.Canvas.addEventListener("resize", (ev) => {
      let { width, height } = ev;
      this.resize(width, height);
    });


  }

  isOccludedRectWithPrevZ(minX, maxX, minY, maxY, minDepth) {
    return this._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minDepth);
  }





  Reset() {
    this._primitives = new Array();
    this._bvh = new BVH(this);
    this._bsp = null;

  }

  getStatistic() {

    return {
      primitives_in: this._primitives_in,
      primitives_renderd: this._primitives_rendered,
      mode_hzb_culled: this._node_hzb_culled,
      node_aabb_frustum_culled: this._node_aabb_frustum_culled,
      node_aabb_project_culled: this._node_aabb_project_culled,
      primitives_back_face_culling: this._primitives_back_face_culling,
      primitives_frustum_culling: this._primitives_frustum_culling,
      primitives_transform_culling: this._primitives_transform_culling,
      primitives_project_culling: this._primitives_project_culling,
      spans_in: this._spanrenderer._spans_in,
      spans_out: this._spanrenderer._spans_out
    };

  }


  Start(camera, ligth_map = null) {

    if (this._zbuffer == null) {
      console.log("zbuffer = null")
      this._zbuffer = new Float64Array(this.width() * this.height());
      this._zbuffer.fill(this._max_depth);
      this._hzbuffer = new HierarchicalZBuffer(this.width(), this.height());
      this._ibuffer = new Int32Array(this.width() * this.height());
      this._ibuffer.fill(CalcIndex(0, 0, 0));
      this._nbuffer = new Float32Array((this.width() * this.height()) * 3);
      this._nbuffer.fill(0);

    }

    this.light_map = ligth_map;
    this._hzbuffer.setBaseLevel(this._zbuffer);
    this._hzbuffer.build();


    if (this._use_spanbuffer) {
      this._spanrenderer.Start();
    } else {
      this.ClearZBuffer();
      this.canvas.Clear();
    }
    // WriteToLog(this._zbuffer);
    this.xform = camera.GetCombinedMatrix();
    this.frustum = new Frustum();
    this.frustum.createByCam(cam);
    this.camera = camera;
    this._BeamTree.ReInit(camera, this.frustum);
    this.ClearIBuffer();
  }
  get SpansIn() { return this._spanrenderer._m_spans_in; }
  get SpansOut() { return this._spanrenderer._m_spans_out; }

  EnableBackfaceCulling(culling) {
    this._enable_culling = culling;
  }

  isBackfaceCullingEnabled() { return this._enable_culling; }


  FlushPrimitives() {
    this._primitives = new Array();
  }

  get primitives() { return this._primitives; }
  get HZB() { return this._hzbuffer; }

  AddPrimitive(primitive) {
    if (Array.isArray(primitive)) {
      for (let p of primitive) this.AddPrimitive(p);
      return;
    }
    if (!(primitive instanceof PrimitiveBase)) return;
    this._primitives.push(primitive);
    this._primitives_in = this._primitives.length;
  }

  PerspectiveCorrect() {
    return this._perspectiveCorrect;
  }

  GetZBuffer() {
    return this._zbuffer;
  }

  GetIBuffer() {
    return this._ibuffer;
  }


  ZBufferToScreen() {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        var c = this._zbuffer[x + y * this._width];
        c = Math.min((c * 255.0) | 0, 255);
        this._canvas.PutPixel(x, y, RGBA(c, c, c, 0xff));

      }
    }
  }

  IBufferToScreen() {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {

        let c = this._ibuffer[x + y * this._width];

        let i = GetIndexObjIndex(c);

        this._canvas.PutPixel(x, y, (0xff << 24) | c);

      }
    }
  }







  DrawLine(a, b) {
    var x1 = a.x | 0;
    var y1 = a.y | 0;
    var z1 = a.z;
    var x2 = b.x | 0;
    var y2 = b.y | 0;
    var z2 = b.z;


    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var dz = (z2 - z1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;

    var l = Math.sqrt(dx * dx + dy * dy);
    var sz = dz / l;

    var cr1 = a.color.x * 255;
    var cg1 = a.color.y * 255;
    var cb1 = a.color.z * 255;
    var cr2 = b.color.x * 255;
    var cg2 = b.color.y * 255;
    var cb2 = b.color.z * 255;


    var dr = (cr2 - cr1) / l;
    var dg = (cg2 - cg1) / l;
    var db = (cb2 - cb1) / l;


    if (this.SetBuffer(x1, y1, 1 / z1)) canvas.PutPixel(x1, y1, RGBA(cr1 | 0, cg1 | 0, cb1 | 0, 0xff));
    //  return;
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }

      // Set coordinates
      cr1 += dr;
      cg1 += dg;
      cb1 += db;

      z1 += sz;


      if (this.SetBuffer(x1, y1, 1 / z1)) canvas.PutPixel(x1, y1, RGBA(cr1 | 0, cg1 | 0, cb1 | 0, 0xff));

    }
  }
  DrawLine2(xx1, yy1, xx2, yy2, z, color) {
    var x1 = xx1 | 0;
    var y1 = yy1 | 0;
    var x2 = xx2 | 0;
    var y2 = yy2 | 0;


    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;

    var l = Math.sqrt(dx * dx + dy * dy);

    var cr1 = (color.x * 255) | 0;
    var cg1 = (color.y * 255) | 0;
    var cb1 = (color.z * 255) | 0;

    let co = RGBA(cr1 | 0, cg1 | 0, cb1 | 0, 0xff)


    if (this.SetBuffer(x1, y1, 1 / z)) canvas.PutPixel(x1, y1, co);
    //  return;
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }

      if (this.SetBuffer(x1, y1, 1 / z)) canvas.PutPixel(x1, y1, co);

    }
  }


  Project(verts) {

    let sverts = new Array(verts.length);

    for (let j = 0; j < verts.length; j++) {
      var ow = 1.0 / verts[j].screen.w;
      sverts[j] = new SVec();

      sverts[j].color = verts[j].color;
      sverts[j].x = (this.screenCenterX() + verts[j].screen.x * ow * this.screenCenterX() * this.xScale());
      sverts[j].y = (this.screenCenterY() - verts[j].screen.y * ow * this.screenCenterY() * this.yScale());
      sverts[j].z = verts[j].screen.w;
      sverts[j].w = ow;

      if (sverts[j].x < -0.5) sverts[j].x = -0.5;
      if (sverts[j].x > (this.width() - 0.5)) sverts[j].x = this.width() - 0.5;
      if (sverts[j].y < -0.5) sverts[j].y = -0.5;
      if (sverts[j].y > (this.height() - 0.5)) sverts[j].y = this.height() - 0.5;

      //z   		if (rasterizer.PerspectiveCorrect() == 0) ow = 1.0;
      // 		if (this.render_type != POLY_PERSPECTIVE_TEXTURED) ow = 1.0;

      sverts[j].u = verts[j].texture.x * ow;
      sverts[j].v = verts[j].texture.y * ow;

      sverts[j].lu = verts[j].light_texture.x * ow;
      sverts[j].lv = verts[j].light_texture.y * ow;

      if (j < verts.length - 1) sverts[j].next = sverts[j + 1];
    }
    //_sverts[verts.length-1].next = undefined;
    return sverts;
  }

  TransformToScreen(verts) {
    var codeOff = -1;
    var codeOn = 0;
    var code = 0;

    for (let j = 0; j < verts.length; j++) {
      let w = verts[j].world;
      var s = this.xform.concat(w);

      verts[j].screen.x = s.x;
      verts[j].screen.y = s.y;
      verts[j].screen.z = s.z;
      verts[j].screen.w = s.w


      code = (s.x > s.w ? 1 : 0) | (s.x < -s.w ? 2 : 0) |
        (s.y > s.w ? 4 : 0) | (s.y < -s.w ? 8 : 0) |
        (s.z < 0.0 ? 16 : 0) | (s.z > s.w ? 32 : 0);
      codeOff &= code;
      codeOn |= code;
    }


    return new Array(codeOff, codeOn);
  }

  DrawPolyLined(p, c1 = new Vector3(0, 1, 0)) {
    let result = p.ClipByFrustum(this.frustum);
    if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) return;
    let clipped = result[0];
    let o = clipped.TransformToScreen(this.xform);
    if (o[0]) return;
    if (!clipped.Project(this)) return;

    for (let i = 0; i < clipped._sverts.length; i++) {
      let v0 = clipped._sverts[i];
      let v1 = clipped._sverts[(i + 1) % clipped._sverts.length];
      this.DrawLine(v0, v1, c1);
    }

  }

  DrawPolyLined2(p, c1 = new Vector3(0, 1, 0)) {
    let result = p.ClipByFrustum(this.frustum);
    if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) return;
    let clipped = result[0];
    let o = clipped.TransformToScreen(this.xform);
    if (o[0]) return;
    if (!clipped.Project(this)) return;

    for (let i = 0; i < clipped._sverts.length; i++) {
      let v0 = clipped._sverts[i];
      let v1 = clipped._sverts[(i + 1) % clipped._sverts.length];
      let v2 = clipped._sverts[(i + 2) % clipped._sverts.length];
      v0.color = c1;
      this.DrawLine(v0, v1);
      this.DrawLine(v0, v2);
    }

  }

  DrawPolyLined4(p, c1 = new Vector3(0, 1, 0)) {
    let result = p.ClipByFrustum(this.frustum);
    if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) return;
    let clipped = result[0];
    let o = clipped.TransformToScreen(this.xform);
    if (o[0]) return;
    if (!clipped.Project(this)) return;
    let c2 = new Vector3(0, 1, 1);
    for (let i = 0; i < clipped._sverts.length; i++) {
      let v0 = clipped._sverts[i];
      let v1 = clipped._sverts[(i + 1) % clipped._sverts.length];
      let v2 = clipped._sverts[(i + 2) % clipped._sverts.length];
      v0.color = c1;
      this.DrawLine(v0, v1);
      this.DrawLine(v0, v2);

      this.DrawLine2(v0.x - 5, v0.y, v0.x + 5, v0.y, v0.z, c2);
      this.DrawLine2(v0.x, v0.y - 5, v0.x, v0.y + 5, v0.z, c2);




    }

  }


  DrawPolyLined3(pp, c1 = new Vector3(0, 1, 0), scale = 25) {


    let p = new Polygon(pp);
    p.calcPlane();
    let n = p.plane.normal.mul(scale);

    for (let v of p.verts) {
      v.world = v.world.add(n);
    }



    let result = p.ClipByFrustum(this.frustum);
    if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) return;
    let clipped = result[0];
    let o = clipped.TransformToScreen(this.xform);
    if (o[0]) return;
    if (!clipped.Project(this)) return;

    for (let i = 0; i < clipped._sverts.length; i++) {
      let v0 = clipped._sverts[i];
      v0.color = c1;
      let v1 = clipped._sverts[(i + 1) % clipped._sverts.length];
      let v2 = clipped._sverts[(i + 2) % clipped._sverts.length];

      this.DrawLine(v0, v1);
      this.DrawLine(v0, v2);
    }

  }

  DrawLine3D(a, b, c1 = new Vector3(1, 0, 0), c2 = undefined) {
    let v0 = new Vert(a, 1);
    let v1 = new Vert(b, 1);
    v0._color.x = v1._color.x = c1.x;
    v0._color.y = v1._color.y = c1.y;
    v0._color.z = v1._color.z = c1.z;
    if (c2) {
      v1._color.x = c2.x;
      v1._color.y = c2.y;
      v1._color.z = c2.z;
    }
    let v2 = new Vert(v1);
    let v3 = new Vert(v0);

    let p = new Polygon();
    p.AddVert(v0);
    p.AddVert(v1);
    p.AddVert(v2);
    p.AddVert(v3);



    //if (p.plane.Classify(camera.position) == BACK) return;
    let result = p.ClipByFrustum(this.frustum);
    if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) return;
    let clipped = result[0];
    let o = clipped.TransformToScreen(this.xform);
    if (o[0]) return;
    if (!clipped.Project(this)) return;



    for (let i = 0; i < clipped._sverts.length; i++) {
      let v0 = clipped._sverts[i];
      let v1 = clipped._sverts[(i + 1) % clipped._sverts.length];
      this.DrawLine(v0, v1);
    }



  }

  ZBufferToScreenOLD(posx = 0, posy = 0, scale = 1) {
    let pp = 0;
    for (let l = 0; l < this._hzbuffer.levels.length; l++) {
      let level = this._hzbuffer.levels[l];

      for (let y = 0; y < level.h; y++) {
        for (let x = 0; x < level.w; x++) {
          var c = level.z[x + y * level.w];
          c = Math.min((c * 255.0) | 0, 255);
          this._canvas.PutPixel(pp + posx + x >> scale, posy + y >> scale, RGBA(c, c, c, 0xff));
        }
      }
      pp += level.w;
    }
  }

  NBufferToScreen() {
    let i = 0;
    for (let y = 0; y < this.height(); y++) {
      for (let x = 0; x < this.width(); x++) {
        const r = this._nbuffer[(i++)] * 128 + 128;
        const g = this._nbuffer[(i++)] * 128 + 128;
        const b = this._nbuffer[(i++)] * 128 + 128;
        this._canvas.PutPixel(x, y, RGBA(r | 0, g | 0, b | 0, 0xff));
      }
    }
  }


  BuildBVH() {

    // this._bhv=buildBVH(this._primitives);
    DebugOut("BuildBHV\n")

    this._bsp = null;
    this._bhv = new BVH(this);
    this._bhv.build(this._primitives);
  }



  SetBSP(bsp) {
    DebugOut("SetBSP\n")
    this._bsp = bsp;
    this._bhv = null;
  }

  BuildBSP() {
    DebugOut("BuildBsp\n")
    this._bsp = new BSPTree(this._primitives);
    this._bhv = null;
  }


  ClearZBuffer() {
    this._zbuffer.fill(-(this._max_depth / 2));

  }

  ClearNBuffer() {
    this._nbuffer.fill(1);

  }

  ClearIBuffer() {
    this._ibuffer.fill(CalcIndex(0, 0, 0));
  }

  GetObjectId() {
    let offset = (this._canvas._mouse_x + this._canvas._mouse_y * this._canvas.width);
    return this._ibuffer[offset];
  }

  SetBuffer(x, y, z) {
    if (z < 0 || z >= this._height * this._width) return false;
    if (z <= this._zbuffer[x + y * this._width]) return false;
    this._zbuffer[x + y * this._width] = z;
    return true;
  }



  PutBuffer(pos, z) {
    if (z <= this._zbuffer[pos]) return false;
    this._zbuffer[pos] = z;
    return true;
  }

  PutPixel(x, y, color) {
    this._canvas.PutPixel(x, y, color);
  }

  GetActiveBuffer() {
    return this._canvas.GetActiveBuffer();

  }

  GetActiveZBuffer() {
    return this._zbuffer;
  }
  GetActiveIBuffer() {
    return this._ibuffer;
  }

  GetActiveNBuffer() {
    return this._nbuffer;
  }






  get maxscal() { return this._maxscale; }
  get maxscreenscaleinv() { return this._maxscreenscaleinv; }

  RenderPrimitives() {
    if (this._bhv) this._clear_spanbuffer = this._bhv.render(this.camera, this);
    if (this._bsp) this._clear_spanbuffer = this._bsp.render(this.camera, this);

  }


  Render() {
    if (this._use_spanbuffer) this._spanrenderer.Render();



  }

  width() { return this._width; }
  height() { return this._height; }

  screenCenterX() { return this._screenCenter_x; }
  screenCenterY() { return this._screenCenter_y; }

  xScale() { return this._xScale; }
  yScale() { return this._yScale; }

  resize(width, height) {

    this._clear_spanbuffer = true;
    if (this._width == width && this._height == height) return;
    this._width = width | 0;
    this._height = height | 0;
    this._screenCenter_x = (this._width / 2) | 0;
    this._screenCenter_y = (this._height / 2) | 0;

    this._zbuffer = new Float64Array(this.width() * this.height());
    this._zbuffer.fill(this._max_depth);

    this._hzbuffer = new HierarchicalZBuffer(this.width(), this.height());
    this._ibuffer = new Int32Array(this.width() * this.height());
    this._ibuffer.fill(CalcIndex(0, 0, 0));
    this._nbuffer = new Float32Array(this.width() * this.height() * 3);
    this._nbuffer.fill(0);

  }

  get canvas() { return this._canvas; }
  set canvas(a) { this._canvas = a; }
  get max_depth() { return this._max_depth };



}