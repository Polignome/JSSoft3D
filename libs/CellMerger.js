



const PORTAL_UNTESTED = 0;
const PORTAL_IS_VALID = 1;
const PORTAL_NOT_VALID = -1;



class PolygonHull {
    constructor(poly) {

        this.planes = [];
        this.plane = new Ray(poly.plane)
        this.aabb = new AABB(poly)
        const verts = poly.verts;
        const normal = poly.plane.normal;

        // 1. Front plane
        // this.planes.push(poly.plane);

        // 2. Edge planes (SEHR WICHTIG)
        for (let i = 0; i < verts.length; i++) {

            const v0 = verts[i].world;
            const v1 = verts[(i + 1) % verts.length].world;

            const edge = v1.sub(v0);
            const n = edge.cross(normal).normalize();
            let plane = Ray.CalcPlaneBy3Vectors(v0.add(v1).mul(0.5), v1, v1.add(normal.mul(-10)));
            //            const plane = Ray.FromPointNormal(v0, n);
            this.planes.push(plane);
        }
    }



    clipSegmentOutsideHull(seg) {
        const a = seg[0];
        const b = seg[1];
        let split = false;
        // Segment muss in Polygon-Ebene liegen
        if (this.plane.Classify(a) !== COPLANAR ||
            this.plane.Classify(b) !== COPLANAR) {
            return [seg];

        }

        // Schnittparameter sammeln
        let params = [0.0, 1.0];

        for (const plane of this.planes) {
            const d0 = plane.Classify(a);
            const d1 = plane.Classify(b);

            // echter Seitenwechsel?
            if (
                (d0 === FRONT && d1 === BACK) ||
                (d0 === BACK && d1 === FRONT)
            ) {
                const p = plane.SplitLine(a, b);

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dz = b.z - a.z;
                split = true;
                let t;

                if (Math.abs(dx) > Math.abs(dy) &&
                    Math.abs(dx) > Math.abs(dz)) {
                    t = (p.x - a.x) / dx;
                }
                else if (Math.abs(dy) > Math.abs(dz)) {
                    t = (p.y - a.y) / dy;
                }
                else {
                    t = (p.z - a.z) / dz;
                }

                params.push(t);
            }
        }

        // sortieren
        params.sort((a, b) => a - b);

        // Dubletten entfernen
        const eps = 1e-6;
        const unique = [];

        for (const t of params) {
            if (unique.length === 0 ||
                Math.abs(unique[unique.length - 1] - t) > eps) {
                unique.push(t);
            }
        }

        const result = [];
        let has_inside = false;
        // Intervalle testen
        for (let i = 0; i < unique.length - 1; i++) {
            const t0 = unique[i];
            const t1 = unique[i + 1];

            const tm = (t0 + t1) * 0.5;

            const mid = new Vector3(
                a.x + (b.x - a.x) * tm,
                a.y + (b.y - a.y) * tm,
                a.z + (b.z - a.z) * tm
            );

            let inside = true;

            for (const plane of this.planes) {
                if (plane.Classify(mid) === BACK) {
                    inside = false;

                    break;
                }
            }

            // nur Außensegmente behalten
            if (!inside) {
                const p0 = new Vector3(
                    a.x + (b.x - a.x) * t0,
                    a.y + (b.y - a.y) * t0,
                    a.z + (b.z - a.z) * t0
                );

                const p1 = new Vector3(
                    a.x + (b.x - a.x) * t1,
                    a.y + (b.y - a.y) * t1,
                    a.z + (b.z - a.z) * t1
                );
                split = true;
                result.push([p0, p1]);
            }
        }
        if (result.length === 0) split = true;
        return result



    }


    IntersectedByBounds(aabb) {
        return this.aabb.IntersectedByBounds(aabb);
    }

}



class CellPortal {

    constructor(owner_cell, verts, look_at_cell = null) {
        this._id = -1;
        this._owner = owner_cell;
        this._look_at_cell = look_at_cell;
        this._brother = null;
        this.verts = new Array()
        this._plane = new Ray();
        this._flags = PORTAL_UNTESTED;
        this._checked = false;
        if (verts) this.AddVerts(verts);
    }

    center() {
        let out = new Vector3()
        for (let v of this.verts) {
            out.x += v.x;
            out.y += v.y;
            out.z += v.z;
        }
        let l = 1.0 / this.verts.length;
        out.x *= l;
        out.y *= l;
        out.z *= l;

        return out;
    }
    IsPortalCovered(hulls) {
        let edge_list = [];
        for (let i = 0; i < this.verts.length; i++) {
            let j = (i + 1) % this.verts.length
            let v0 = this.verts[i];
            let v1 = this.verts[j];
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


    Area() {
        if (this.verts.length < 3)
            return 0;

        let area = 0;
        let v0 = this.verts[0];

        for (let i = 1; i < this.verts.length - 1; i++) {
            let e1 = this.verts[i].sub(v0);
            let e2 = this.verts[i + 1].sub(v0);

            area +=
                e1.cross(e2).length() * 0.5;
        }

        return area;
    }

    AddVerts(verts, reverse = false) {
        for (let v of verts) this.verts.push(new Vector3(v));
        if (reverse) this.verts = this.verts.reverse();
        this._plane = Ray.CalcPlaneBy3Vectors(this.verts[0], this.verts[1], this.verts[2]);
    }
}



class Cell {

    constructor(leaf) {
        this._id = -1;
        this._leafs = new Array();
        this._portals = new Array();
        this._polygons = new Array();
        this._leafs.push(leaf);
        this._flags = 0;

        for (let p of leaf._polygons) this._polygons.push(p);
        this._aabb = new AABB(this._polygons);

    }



    SurfaceArea() {
        let area = 0;

        for (let poly of this._polygons) {
            let verts = poly.verts;

            if (verts.length < 3)
                continue;

            let v0 = verts[0].world;

            for (let i = 1; i < verts.length - 1; i++) {
                let e1 =
                    verts[i].world.sub(v0);

                let e2 =
                    verts[i + 1].world.sub(v0);

                area +=
                    e1.cross(e2).length() * 0.5;
            }
        }

        return area;
    }

    RemovePortal(portal) {
        let index = this._portals.indexOf(portal);
        if (index !== -1)
            this._portals.splice(index, 1);
    }

    get polygons() { return this._polygons; }
    set polygons(s) { this._polygons = s; }



    get aabb() { return this._aabb; }
    set aabb(s) { this._aabb = s; }



    removePortal(portal) {

        let h = new Array();

        for (let p of this._portals) {
            if (p != portal) h.push(p);
        }

        this._portals = h;

    }



    render(engine, camera_position, frustum, xform) {
        if (this._flags != 0) return;
        this._flags = 1;

        if (engine._use_node_frustum_culling) {
            // ---- Frustum Culling ----
            if (!frustum.intersectsAABB(this._aabb)) {
                engine._node_aabb_frustum_culled++;
                return;
            }
        }
        // ---- Projection ----
        const bbox = this._aabb.projectAABBToScreen(
            xform, engine.width, engine.height
        );

        if (!bbox) {
            engine._node_aabb_project_culled++;
            return;
        }



        let minX = Math.floor(bbox.minX);
        let maxX = Math.ceil(bbox.maxX);
        let minY = Math.floor(bbox.minY);
        let maxY = Math.ceil(bbox.maxY);
        let minW = bbox.minDepth;

        const DEPTH_EPSILON = 1e-5 * 2;

        if (engine._use_node_hzbuffer_culling && engine._hzbuffer.isOccludedRect(minX, maxX, minY, maxY, minW - DEPTH_EPSILON)) {
            engine._node_hzb_culled++;
            return;
        }



        for (let portal of this._portals) {
            if (frustum.ClassifyPortalByFrustum(portal) === BACK) continue;
            portal._look_at_cell.render(engine, camera_position, frustum, xform);
        }

        for (let p of this._polygons) {
            if (p.plane.Classify(camera_position) == BACK) {
                engine._primitives_back_face_culling++;
                continue;
            }

            let result = p.ClipByFrustum(frustum);
            if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) {
                engine._primitives_frustum_culling++;
                continue;
            }


            let clipped = result[0];
            let o = clipped.TransformToScreen(xform);
            if (o[0]) {
                engine._primitives_transform_culling++;
                continue;
            }

            if (!clipped.Project(engine)) {
                engine._primitives_project_culling++;
                continue;
            }

            engine._spanrenderer.AddPrimitive(clipped, engine._dummy_texture);
            engine._primitives_rendered++;
        }

    }

}








class CellMerger {

    constructor(bsp) {
        this._bsp = bsp;
        if (!this._bsp) console.log("Leaf ==0")
        this._cells = new Array();
        this._portals = new Array();
        this._temp_polys = new Array();
        this._temp_polys_aabb = new Array();
        this.BuildCellList();
    }
    ////////////////////////////////////////////////////////
    SameDirection(nn1, nn2, epsilon = 0.99) {
        let n1 = new Vector3(nn1);
        let n2 = new Vector3(nn2);
        n1.normalize();
        n2.normalize();
        let d = n1.dot(n2);



        return Math.abs(d) > epsilon;
    }

    IsThinCell(cell) {
        if (cell._portals.length != 3)
            return false;

        let reference =
            cell._portals[0]._plane.normal;

        let matches = 1;

        for (let i = 1;
            i < cell._portals.length;
            i++) {
            let n =
                cell._portals[i]._plane.normal;

            if (this.SameDirection(reference, n))
                matches++;
        }

        return matches >= 2;
    }

    FindBestNeighbour(cell) {
        let bestPortal = null;
        let bestArea = 0;

        for (let portal of cell._portals) {
            let area =
                new Polygon(portal.verts).Area();

            if (area > bestArea) {
                bestArea = area;
                bestPortal = portal;
            }
        }

        return bestPortal;
    }

    MergeThinCell(cell) {
        let portal =
            this.FindBestNeighbour(cell);

        if (!portal)
            return false;

        let target =
            portal._look_at_cell;

        return this.ForceMergeCells(
            target,
            cell
        );
    }

    ForceMergeCells(cellA, cellB) {
        //
        // Polygone übernehmen
        //

        for (let p of cellB._polygons)
            cellA._polygons.push(p);

        //
        // Portale übernehmen
        //

        for (let portal of [...cellB._portals]) {
            if (portal._look_at_cell === cellA) {
                if (portal._brother) {
                    portal._brother._owner.RemovePortal(
                        portal._brother
                    );
                }

                continue;
            }

            portal._owner = cellA;

            if (portal._brother)
                portal._brother._look_at_cell = cellA;

            cellA._portals.push(portal);
        }

        cellA._aabb =
            new AABB(cellA._polygons);

        this.RemoveCell(cellB);

        return true;
    }

    MergeThinCells() {
        for (let cell of [...this._cells]) {
            if (!this.IsThinCell(cell))
                continue;



            if (this.MergeThinCell(cell))
                return true;
        }

        return false;
    }
    ////////////////////////////////////////////////////////

    RemoveCell(cell) {
        let index = this._cells.indexOf(cell);

        if (index !== -1)
            this._cells.splice(index, 1);
    }

    renderPortals(engine, portals) {
        {
            for (let p of portals) {
                let p1 = new Polygon(p.verts);

                engine.DrawPolyLined2(p1, new Vector3(1, 1, 0), 20);
            }
        }
    }

    render(engine) {
        var xform = engine.camera.GetCombinedMatrix();
        var frustum = new Frustum();
        frustum.createByCam(cam);
        let start = null;

        for (let cell of this._cells) {
            if (cell._aabb.PointInside(engine.camera._position)) {
                start = cell;
                break;
            }
        }

        if (start === null) start = this._cells[0];//{return false;}
        start.render(engine, engine.camera.position, frustum, xform);
        let count = 0;
        for (let cell of this._cells) {
            if (cell._flags) count++;
            cell._flags = 0;
        }


        return true;

    }

    renderCellHull(engine) {
        for (let l of this._cells) {
            let polygons = l.aabb.BuildPolygons();
            for (let p of polygons) {
            }
            this.renderPortals(engine, l._portals)
        }
    }
    renderSingelCellHull(engine, id, render_ch = true) {
        if (id < 0 || id >= this._cells.length) return;
        let l = this._cells[id];
        let polygons = l.aabb.BuildPolygons();
        for (let p of polygons) {
            if (render_ch) p.SetColor(0, 1, 0); else p.SetColor(0, 0, 1);
            engine.DrawPolyLined(p, new Vector3(0, 1, 1));
        }
        this.renderPortals(engine, l._portals)
        if (!render_ch) return;

        for (let p of l._portals) {
            let ll = p._look_at_cell;
            let polygons = ll.aabb.BuildPolygons();
            for (let p of polygons) {
                p.SetColor(0, 0, 1);
                engine.DrawPolyLined(p, new Vector3(0, 1, 1));
            }

        }
    }

    FindEdge(polyA, polyB, epsilon = 1e-6) {
        let aIndex = -1;
        let bIndex = -1;

        for (let i = 0; i < polyA.length; i++) {
            const a0 = polyA[i];
            const a1 = polyA[(i + 1) % polyA.length];

            for (let j = 0; j < polyB.length; j++) {
                const b0 = polyB[j];
                const b1 = polyB[(j + 1) % polyB.length];
                // entgegengesetzte Edge!

                let v0 = a0.sub(b1).length();
                let v1 = a1.sub(b0).length();
                if (v0 < epsilon && v1 < epsilon) return [aIndex, bIndex];

            }
        }
        return undefined;
    }

    FindMergeCandidate4(
        source_cell,
        source_portal,
        cellA,
        portalA,
        cellB
    ) {
        for (let portalC of cellB._portals) {
            let cellC = portalC._look_at_cell;

            //
            // Nur Rückweg zur Ursprungszelle interessant
            //

            if (cellC !== source_cell)
                continue;

            //
            // Versuche source_portal und brother(portalC)
            // zu einem größeren Portal zu verschmelzen
            //

            let mergedVerts =
                mergeVerts(
                    source_portal.verts,
                    portalC._brother.verts
                );

            if (!mergedVerts)
                continue;


            //
            // Polygone übernehmen
            //

            for (let p of cellB._polygons)
                cellA._polygons.push(p);

            //
            // Neue Portale erzeugen
            //

            let np0 =
                new CellPortal(
                    source_cell,
                    mergedVerts,
                    cellA
                );

            let np1 =
                new CellPortal(
                    cellA,
                    [...mergedVerts].reverse(),
                    source_cell
                );
            np0._id = source_portal._id;
            np1._id = source_portal._brother._id;
            np0._brother = np1;
            np1._brother = np0;

            //
            // Alte Verbindung source <-> cellA entfernen
            //

            source_cell.RemovePortal(
                source_portal
            );

            cellA.RemovePortal(
                source_portal._brother
            );

            //
            // Alte Verbindung source <-> cellB entfernen
            //

            source_cell.RemovePortal(
                portalC._brother
            );

            cellB.RemovePortal(
                portalC
            );

            //
            // Neues Portal einfügen
            //

            source_cell._portals.push(np0);
            cellA._portals.push(np1);

            //
            // Alle restlichen Portale von cellB
            // nach cellA übernehmen
            //

            for (let p of [...cellB._portals]) {
                //
                // interne Verbindung A <-> B entfernen
                //

                if (p._look_at_cell === cellA) {
                    if (p._brother) {
                        p._brother._owner.RemovePortal(
                            p._brother
                        );
                    }

                    continue;
                }

                //
                // Portal gehört jetzt cellA
                //

                p._owner = cellA;

                //
                // Gegenportal muss auf cellA zeigen
                //

                if (p._brother)
                    p._brother._look_at_cell = cellA;

                cellA._portals.push(p);
            }

            //
            // cellB aus Cellliste entfernen
            //

            this.RemoveCell(cellB);

            //
            // AABB neu berechnen
            //

            cellA._aabb =
                new AABB(
                    cellA._polygons
                );

            return true;
        }

        return false;
    }

    FindMergeCandidate3(source_cell, source_portal, cellA) {
        for (let i = 0; i < cellA._portals.length; i++) {
            let portalA = cellA._portals[i];
            let cellB = portalA._look_at_cell;
            if (cellB === cellA) continue;
            if (cellB === source_cell) continue;
            if (this.FindMergeCandidate4(source_cell, source_portal, cellA, portalA, cellB)) return true;

        }
        return false;
    }

    FindMergeCandidate2(source_cell) {

        for (let i = 0; i < source_cell._portals.length; i++) {
            let source_portal = source_cell._portals[i];
            for (let j = 0; j < source_portal._look_at_cell._portals.length; j++) {
                let cellA = source_portal._look_at_cell;
                if (cellA === source_cell) continue;
                if (this.FindMergeCandidate3(source_cell, source_portal, cellA)) return true;
            }
        }
        return false;
    }

    FindMergeCandidate() {

        for (let i = 0; i < this._cells.length; i++) {
            let source_cell = this._cells[i];
            if (this.FindMergeCandidate2(source_cell)) return true;
        }

        return false;
    }

    FindGodPortals() {


        for (const p of this._portals) {
            let aabb = new AABB(p.verts);
            aabb.scale(0.5);
            let temp = [];
            for (let hull of this._temp_polys) if (hull.IntersectedByBounds(aabb)) temp.push(hull);

            if (IsPortalCovered(p, temp)) p._flags = PORTAL_IS_VALID; else p._flags = PORTAL_NOT_VALID;

        }

    }

    DebugCells() {
        for (let cell of this._cells) {
            console.log("Check cell [", cell._id, "_______________________:");
            for (let p of cell._portals) {
                console.log("Portal [", p._id, "] -> ", p._look_at_cell._id);
            }
            console.log(" ");
        }

    }

    Optimize() {
        let changed = true;
        this.start = this._cells.length;


        while (changed) {
            changed = false;
            if (this.FindMergeCandidate()) changed = true;
            if (this.MergeThinCells()) changed = true;
        }
        for (let i = 0; i < this._cells.length; i++) {
            this._cells[i]._id = i;
            for (let p of this._cells[i]._polygons) p._id = CalcIndex(CELL_INDEX, 0, i);

        }

        this._temp_polys_aabb = [];
        this._temp_polys = [];


    }

    BuildCellList() {
        let temp = new Map();
        let temp2 = new Map();

        for (let i = 0; i < this._bsp._leaf_list.length; i++) {
            let leaf = this._bsp._leaf_list[i];
            if (leaf._outside) continue;
            let cell = new Cell(leaf);
            for (let p of leaf._polygons) {

                this._temp_polys.push(new PolygonHull(p));
            }

            cell._id = temp.size;
            temp.set(leaf._leaf_id, cell);
        }

        for (let i = 0; i < this._bsp._portal_list.length; i++) {
            let p = this._bsp._portal_list[i];
            let leaf1 = temp.get(p._leaf1._leaf_id);
            let leaf2 = temp.get(p._leaf2._leaf_id);
            if (leaf1 === undefined || leaf2 === undefined) continue;
            let n = new CellPortal(leaf1, p.verts, leaf2);
            n._id = temp2.size;
            temp2.set(n._id, n);
            leaf1._portals.push(n);
            this._portals.push(n);
        }



        for (const [key, portal] of temp2) {
            let look_at_cell = portal._look_at_cell;
            let count = 0;

            for (let po2 of look_at_cell._portals) {
                if (portal._owner._id === po2._look_at_cell._id) {
                    portal._brother = po2;
                    po2._brother = portal;
                    count++;
                }

            }

        }

        for (const [key, value] of temp) {
            this._cells.push(value);
        }
    }

}

