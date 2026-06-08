const COMPILER_CSG = 1 << 1;
const COMPILER_REMOVE_VIS = (1 << 2);
const COMPILER_FINAL_BSP = (1 << 3);
const COMPILER_BUILD_PORTALS = (1 << 4);
const COMPILER_BUILD_PVS = (1 << 5);
const COMPILER_DEBUG_MODE = (1 << 8);
const COMPILER_ALL = COMPILER_CSG | COMPILER_REMOVE_VIS | COMPILER_FINAL_BSP | COMPILER_BUILD_PORTALS | COMPILER_DEBUG_MODE | COMPILER_BUILD_PVS;


const COMPILER_NO_ERRORS = 0;
const COMPILER_MAP_READER_ERROR = 1;
const COMPILER_CSG_ERROR = 2;
const COMPILER_REMOVE_ERROR = 3;

class MapCompiler {
  constructor() {
    this.map = null;
    this.brush_list = null;
    this.polylist = null;
    this.bsp = null;
    this.pvs = null;
  }

  DebugOutDummy(data) { }
  CompileFromString(map_string, options = COMPILER_ALL) {
    this.map = null;
    this.brush_list = null;
    this.bsp = null;
    this.pvs = null;
    var debug = this.DebugOutDummy;
    var debug = DebugOut;

    if (options | COMPILER_DEBUG_MODE) {
      debug("Parse Map...........................: ");
      var mapparser = new MAPParser();
      this.map = mapparser.LoadMapFromString(map_string);
      if (!this.map) { debug(" ...Error\n"); return COMPILER_MAP_READER_ERROR; }
      this.brush_list = this.map.GetBrushList();
      if (this.brush_list.length <= 0) { debug(" ...Error\n"); return COMPILER_MAP_READER_ERROR; }
      debug("...Ok\n");
      debug("    |- Num Brushes...:" + this.brush_list.length + "\n");
      if (options | COMPILER_DEBUG_MODE) {
        let count = 0;
        for (let b of this.brush_list) {
          count += b.primitives.length;
        }
        debug("    |- Num Polygons..:" + count + "\n");
      }
    }

    if (!(options & COMPILER_CSG)) return COMPILER_NO_ERRORS;
    {

      debug("CSG.................................: ");
      CSG.union(this.brush_list)
      this.polylist = new Array();
      for (let b of this.brush_list) {
        for (let p of b.primitives) {
          let pp = new Polygon(p, false, 1);
          pp.render_type = POLY_PERSPECTIVE_TEXTURED;
          this.polylist.push(pp);
        }
      }
      this.brush_list = null;
      if (this.polylist.length <= 0) { debug("...Error\n "); return COMPILER_CSG_ERROR; }
      debug("...Ok\n");
    }

    if (!(options & COMPILER_REMOVE_VIS)) return COMPILER_NO_ERRORS;

    {
      debug("Remove no visible Polygons..........: ");
      var aabb = new AABB(this.polylist);
      var polylist2 = aabb.BuildPolygons(50);
      var polys_in = this.polylist.length;
      for (let p of polylist2) {
        p._texture = global_texture_manager.GetTextureByName("doof");
        p.render_type = POLY_PERSPECTIVE_TEXTURED;
        p.calcPlane();
        p.setWorldTexture(0.01, 0.01);
        this.polylist.push(p);
      }
      this.bsp = new BSPTree(this.polylist);

      this.bsp.BuildPortals();
      //this.bsp.Rebuild();
      NonVisPolygonsRemover.Remove(this.bsp);
      this.polylist = this.bsp.ExtractPrims();
      var polys_out = this.polylist.length;


      if (polys_out <= 0) {
        debug("...Error\n\n");
        debug("    |- Polys in......:" + polys_in + "\n");
        debug("    |- Polys out.....:" + polys_out + "\n");

        return COMPILER_REMOVE_ERROR;
      }
      debug("...Ok\n");
      debug("    |- Polys in......:" + polys_in + "\n");
      debug("    |- Polys out.....:" + polys_out + "\n");
      debug("    |- Num Leafs.....:" + this.bsp._leaf_list.length + "\n");
      debug("    |- Num Nodes.....:" + this.bsp._node_list.length + "\n");
      debug("    |- Num Portals...:" + this.bsp._portal_list.length + "\n");
    }

    debug("Rebuild BSP ........................: ");

    this.bsp.Rebuild();
    debug("...Ok\n");
    debug("    |- Num Leafs.....:" + this.bsp._leaf_list.length + "\n");
    debug("    |- Num Nodes.....:" + this.bsp._node_list.length + "\n");
    debug("    |- Num Portals...:" + this.bsp._portal_list.length + "\n");

    debug("TJunction ..........................: ");
    let tj = new TJunction();
    tj.Build(this.bsp);
    debug("...Ok\n");

    debug("PVS ................................: ");

    this.pvs = new CellMerger(this.bsp);

    debug("...Ok\n");

    debug("PVS optimze.........................: ");
    //this.pvs.Optimize();
    debug("...Ok\n");

    return COMPILER_NO_ERRORS;
  }
}