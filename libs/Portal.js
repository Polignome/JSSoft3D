



class Portal {


  constructor(p, scale = 100000) {

    this._leaf1 = null;
    this._leaf2 = null;
    this._portal_id = -1;
    this.leave_id = -1;
    this.gestrandet_in = -1;
    this.erzeugt_in = -1;
    this._brother = null;
    this.verts = new Array();
    this.plane = new Ray(3);

    this.color = new Vector3();

    if (p instanceof Ray) {
      this.CreateByPlane(p, scale)
      this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
    } else
      if (p instanceof Array && p.length > 0 && p[0] instanceof Vector3) {
        for (let pp of p) this.verts.push(new Vector3(pp));
        this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
      } else
        if (p instanceof Array && p.length > 0 && p[0] instanceof Vert) {
          for (let pp of p) this.verts.push(new Vector3(pp.world));
          this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
        } else
          if (p instanceof Polygon) {
            for (let pp of p.verts) this.verts.push(new Vector3(PushSubscription.world));
            this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
          } else
            if (p instanceof Portal) {
              for (let pp of p.verts) this.verts.push(new Vector3(pp));
              this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
              this.CopyAttribs(p);

            }
  }


  reverse() {
    this.verts = this.verts.reverse();
    this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
  }
  get id() { return this._portal_id; }
  set id(a) { this._portal_id = a; }

  CopyAttribs(p) {
    this.leave_id = p.leave_id;
    this._portal_id = p._portal_id;
    this._leaf1 = p._leaf1;
    this._leaf2 = p._leaf2;

    this.gestrandet_in = p.gestrandet_in;
    this.erzeugt_in = p.erzeugt_in;
    this.color = new Vector3(p.color);
  }

  CreateByPlane(plane, size = 10000) {
    this.verts = new Array();

    var absnormal = new Vector3(plane.normal);
    var aa = new Vector3(0.0, 0.0, 0.0);
    absnormal.abs();

    if (absnormal.y > absnormal.z) {
      if (absnormal.z > absnormal.x) aa.z = 1.0; else aa.x = 1.0;
    } else {
      if (absnormal.y <= absnormal.x) aa.y = 1.0; else aa.x = 1.0;
    }

    var normal = new Vector3(plane.normal);

    var u = aa.cross(normal); u.normalize();
    var v = u.cross(normal); v.normalize();
    u = u.mul(size);
    v = v.mul(size);

    var a = plane.origin.add(u.sub(v));
    var b = plane.origin.add(u.add(v));
    var c = plane.origin.sub(u.sub(v));
    var d = plane.origin.sub(u.add(v));

    this.verts.push(d);
    this.verts.push(c);
    this.verts.push(b);
    this.verts.push(a);
    this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);



  }


  calcPlane() {
    this.plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
  }


  center() {
    let out = new Vector3()
    for (let v of this.verts) {
      out = out.add(v);
    }
    out = out.div(this.verts.length);
    return out;
  }


  SplitByPlane(plane) {
    var fpoly = new Portal();
    var bpoly = new Portal();

    fpoly.CopyAttribs(this);
    bpoly.CopyAttribs(this);

    for (let i = 0; i < this.verts.length; i++) {
      var j = (i + 1) % this.verts.length;
      var v0 = this.verts[i];
      var v1 = this.verts[j];
      var res0 = plane.Classify(v0);
      var res1 = plane.Classify(v1);


      if (res0 === COPLANAR) {
        fpoly.verts.push(new Vector3(v0));
        bpoly.verts.push(new Vector3(v0));
      }

      if (res0 === FRONT) {
        fpoly.verts.push(new Vector3(v0));
      }

      if (res0 === BACK) {
        bpoly.verts.push(new Vector3(v0));
      }





      if ((res0 === FRONT && res1 === BACK) || (res1 === FRONT && res0 === BACK)) {
        var aDot = v0.dot(plane.normal);
        var bDot = v1.dot(plane.normal);
        var scaled = ((-plane.D) - aDot) / ((bDot - aDot));



        let v = new Vector3(v0.x + (scaled * (v1.x - v0.x)),
          v0.y + (scaled * (v1.y - v0.y)),
          v0.z + (scaled * (v1.z - v0.z)));

        if (USE_AXIS_SORT_AND_VECTOR_SNAP) v.snap();

        fpoly.verts.push(v);
        bpoly.verts.push(new Vector3(v));
      }
    }
    if (fpoly.verts.length < 3) fpoly = null;
    else fpoly.calcPlane();

    if (bpoly.verts.length < 3) bpoly = null;
    else bpoly.calcPlane();

    return [fpoly, bpoly];
  }
}

class NonVisPolygonsRemover {
  static StepLeafs(leaf) {

    if (leaf._checked) return;
    leaf._checked = true;
    leaf._outside = true;
    leaf.DeletePrimitivs();
    for (let p of leaf._portals) {
      this.StepLeafs(p._leaf1);
      this.StepLeafs(p._leaf2);
    }
  }


  static Remove(bsp) {

    for (let leaf of bsp._leaf_list) {
      if (leaf.hasIllegalGeometry()) {
        this.StepLeafs(leaf);

      }
    }
    for (let l of bsp._leaf_list) l._checked = false;
  }
}





class VIS {


  static CalcFrustum(source_portal, target_portal) {
    if (target_portal._checked) return;
    target_portal._checked = true;
    var portals = Array();

    for (let i = 0; i < source_portal.verts.length; i++) {
      let v = [];
      v.push(source_portal.verts[i]);

      for (let j = 0; j < target_portal.verts.length; j++) {
        v.push(target_portal.verts[j]);
        v.push(target_portal.verts[(j + 1) % target_portal.verts.length]);

        var new_portal = new Portal(v);
        let cs = new_portal.plane.Classify(source_portal.center());
        let ct = new_portal.plane.Classify(target_portal.center());
        let valide = false;


        if (cs == ct) continue;


        if (cs === FRONT && ct === BACK) valide = true;

        if (valide) {
          for (let p of portals) {
            if ((p.plane.Classify(new_portal.verts[0]) === PLANAR) &&
              (p.plane.Classify(new_portal.verts[1]) === PLANAR) &&
              (p.plane.Classify(new_portal.verts[2]) === PLANAR)) valide = false;
          }
          if (valide) {
            portals.push(new_portal);
          }

        }
      }
    }





  }

  static CalcVis(source_portal) {
    let target_leaf = source_portal._leaf2;

    for (let target_portal of target_leaf._portals) {
      if (target_portal == source_portal) continue;
      if (target_portal._brother == source_portal) continue;

      let res = source_portal.plane.Classify(target_portal);

      if (res === FRONT) continue;
      this.CalcFrustum(source_portal, target_portal);



    }

  }



  static DoVIS(bsp) {
    let portals = bsp.ExtractPortals(true);
    let leafs = bsp._leaf_list;
    for (let p of portals) {
      this.CalcVis(p);
    }
  }

}

