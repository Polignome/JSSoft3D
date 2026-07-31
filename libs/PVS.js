
const PORTALS_VALID = 0;
const PORTALS_NULL = 1;
const PORTALS_SAME = 2;
const PORTALS_BROTHERS = 3;
const PORTALS_COPLANAR = 4
const PORTALS_SOURCE_LOOK_AT_TARGET = 5;
const PORTALS_TARGET_LOOK_AT_SOURCE = 6;

class AntiPenumbra {
    constructor(planes = null) {


        this._planes = new Array();
        if (planes) {
            for (let p of planes) this._planes.push(new Ray(p));
        }
    }

    static CeckPortals(source_portal, target_portal) {
        if (!source_portal || !target_portal) return PORTALS_NULL;
        if (source_portal._brother == target_portal) return PORTALS_SAME;
        if (source_portal._brother == target_portal) return PORTALS_BROTHERS;
        if (source_portal == target_portal._brother) return PORTALS_BROTHERS;

        let res1 = source_portal.plane.Classify(target_portal.verts);
        let res2 = target_portal.plane.Classify(source_portal.verts);
        if (res1 === COPLANAR) return PORTALS_COPLANAR;
        if (res1 === FRONT) return PORTALS_SOURCE_LOOK_AT_TARGET;
        if (res2 === FRONT) return PORTALS_TARGET_LOOK_AT_SOURCE;
        return PORTALS_VALID;
    }


    static Build(source_portal, target_portal) {
        if (!this.CeckPortals(source_portal, target_portal) == false) return null;

        let center_of_source = source_portal.center();
        let center_of_target = target_portal.center();

        var potential_portal_planes = new Array();
        for (let v0 of source_portal.verts) {

            for (let i = 0; i < target_portal.verts.length; i++) {

                let v1 = target_portal.verts[i];
                let v2 = target_portal.verts[(i + 1) % target_portal.verts.length];
                let test_plane = Ray.CalcPlaneBy3Vectors(v0, v1, v2);
                let res1 = test_plane.Classify(center_of_source);
                let res2 = test_plane.Classify(center_of_target);


                if (res1 == res2) continue;
                if (!(res1 == BACK && res2 == FRONT)) continue;
                let valid = true;

                for (let p of potential_portal_planes) {
                    if ((p.Classify(v0) === PLANAR) && (p.Classify(v1) === PLANAR) && (p.Classify(v2) === PLANAR)) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    potential_portal_planes.push(test_plane);
                }
            }

        }



        if (potential_portal_planes.length != target_portal.verts.length) return null;
        var temp = new Portal(target_portal);

        //   temp.reverse();

        potential_portal_planes.push(temp.plane);
        potential_portal_planes.reverse();
        return new AntiPenumbra(potential_portal_planes);
    }


    BuildPolygons(scale = 1000) {
        let polys = new Array();

        for (let p0 of this._planes) {
            let poly = Polygon.CreateByPlane(p0, scale);
            for (let p1 of this._planes) {
                if (p0 == p1) continue;
                let res = p1.Classify(poly);
                if (res != SPANNING) continue;
                poly = poly.SplitPolyByPlane(p1)[0];
            }

            polys.push(poly);
        }
        return polys;
    }


    IsPrimitive(v) {
        if (v instanceof Polygon) return this.IsPrimitiveVisible(v);
        if (v instanceof Portal) return this.IsPortalVisible(v);

        return false;
    }

    IsPrimitiveVisible(primitive) {
        for (let p of this._planes) {
            if (p.Classify(primitive) === BACK) return false;
        }
        return true;
    }

    IsPortalVisible(portal) {
        for (let p of this._polygons) {
            if (p.plane.Classify(portal) === BACK) return false;
        }
        return true;
    }

    ClassifyPortal(p) {
        let front = 0;
        let back = 0;
        for (let p of this._planes) {
            let t = p.Classify(p);
            if (t === FRONT) front++;
            if (t === BACK) back++;
            if (t === SPANNING) { back++; front++; }
        }
        if (front == 0 && back == 0) return PLANAR;
        if (front > 0 && back > 0) return SPANNING;
        if (front == 0 && back > 0) return BACK;
        return FRONT;
    }

    ClassifyPrimitive(p) {
        let front = 0;
        let back = 0;
        for (let p of this._planes) {
            let t = p.Classify(p);
            if (t === FRONT) front++;
            if (t === BACK) back++;
            if (t === SPANNING) { back++; front++; }
        }
        if (front == 0 && back == 0) return PLANAR;
        if (front > 0 && back > 0) return SPANNING;
        if (front == 0 && back > 0) return BACK;
        return FRONT;
    }

    Classify(p) {
        if (v instanceof Polygon) return this.ClassifyPrimitive(p);
        if (v instanceof Portal) return this.ClassifyPortal(p);
        return false;
    }

    SplitFront(in_portal) {
        let s = new Portal(in_portal);
        for (let p of this._planes) {
            if (p.Classify() === SPANNING) {
                s = s.SplitByPlane(p)[0];
            }
        }
        return s;
    }
}



class PVS {
    constructor(cell_merger) {

    }

    Build() {


    }
}