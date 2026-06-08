







class CellPortal {

    constructor(owner_cell, verts, look_at_cell = null) {
        this._id = -1;
        this._owner = owner_cell;
        this._look_at_cell = look_at_cell;
        this._brother = null;
        this.verts = new Array()
        this._plane = new Ray();
        if (verts) this.AddVerts(verts);
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
        console.log("Remove Portal: ", index)
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
        this.BuildCellList();
    }

    RemoveCell(cell) {
        let index = this._cells.indexOf(cell);

        if (index !== -1)
            this._cells.splice(index, 1);
    }

    CellOpenness(cell) {
        let portalArea = 0;

        for (let p of cell._portals)
            portalArea += p.Area();

        let wallArea =
            cell.SurfaceArea();

        return portalArea /
            Math.max(
                portalArea + wallArea,
                0.00001
            );
    }

    FindTinyCell() {
        for (let cell of this._cells) {
            let openness =
                this.CellOpenness(cell);

            if (
                cell._portals.length <= 2 &&
                openness < 0.08
            ) {
                return cell;
            }
        }

        return null;
    }

    MergeTinyCell(cell) {
        if (cell._portals.length !== 1)
            return false;

        let portal =
            cell._portals[0];

        let neighbour =
            portal._look_at_cell;

        //
        // Polygone übernehmen
        //

        neighbour._polygons.push(
            ...cell._polygons
        );

        //
        // Gegenportal entfernen
        //

        neighbour.RemovePortal(
            portal._brother
        );

        //
        // Cell löschen
        //

        this.RemoveCell(cell);

        neighbour._aabb =
            new AABB(
                neighbour._polygons
            );

        return true;
    }

    OptimizeTinyCells() {
        let changed = true;

        while (changed) {
            changed = false;

            let cell =
                this.FindTinyCell();

            if (cell) {
                this.MergeTinyCell(
                    cell
                );

                changed = true;
            }
        }
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

        if (start === null) return false;
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

    FindEdge(polyA, polyB, epsilon = 1e-6) {
        let aIndex = -1;
        let bIndex = -1;
        console.log(" ")
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

            console.log(
                "Merge:",
                source_cell._id,
                cellA._id,
                cellB._id
            );

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

    IsTinySplitter(cell) {
        if (cell._portals.length !== 3)
            return false;

        let areas = [];

        for (let p of cell._portals)
            areas.push(p.Area());

        areas.sort((a, b) => a - b);

        return areas[0] < 1000;
    }

    Optimize() {
        let changed = true;
        let start = this._cells.length;
        while (changed) {
            changed = false;
            //   if (this.FindMergeCandidate()) changed = true;
        }
        console.log("Start ", start, " End ", this._cells.length)
        this.OptimizeTinyCells();
        console.log("Start ", start, " End ", this._cells.length)
    }

    Debug() {
        for (let cell of this._cells) {
            let portalArea = 0;

            for (let p of cell._portals)
                portalArea += p.Area();

            console.log(
                "Cell",
                cell._id,
                "portals=",
                cell._portals.length,
                "portalArea=",
                portalArea.toFixed(2),
                "polys=",
                cell._polygons.length
            );
        }
    }

    Debug2() {
        for (let cell of this._cells) {
            if (cell._portals.length !== 2)
                continue;

            console.log(
                "CELL",
                cell._id,
                "->",
                cell._portals[0]._look_at_cell._id,
                cell._portals[1]._look_at_cell._id
            );
        }
    }

    Debug3() {
        for (let cell of this._cells) {
            console.log(
                "Cell",
                cell._id
            );

            for (let p of cell._portals) {
                console.log(
                    "   ->",
                    p._look_at_cell._id,
                    "area",
                    p.Area().toFixed(0)
                );
            }
        }
    }

    Debug4() {
        for (let cell of this._cells) {
            if (this.IsTinySplitter(cell)) {
                console.log(
                    "TinySplitter",
                    cell._id
                );
            }
        }
    }

    Debug5() {
        for (let id of [12, 14, 17, 33, 35, 38]) {
            let cell = this._cells.find(c => c._id === id);

            console.log("CELL", id);

            for (let p of cell._portals) {
                console.log(
                    " ->",
                    p._look_at_cell._id,
                    "area",
                    p.Area()
                );
            }
        }
    }

    BuildCellList() {
        let temp = new Map();
        let temp2 = new Map();
        for (let i = 0; i < this._bsp._leaf_list.length; i++) {
            let leaf = this._bsp._leaf_list[i];
            if (leaf._outside) continue;
            let cell = new Cell(leaf);
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
        console.log("-------------[Debug]------------- ");
        this.Debug5();
    }

}

