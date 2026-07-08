///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//    LAEUFT! 
//
//
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




const BSP_ROOD = 0;
const BSP_NODE = 1;
const BSP_LEAF = 2;
const BSP_SUBLEAF = 3;
const FRONT_OWNER = 1
const ROOT_OWNER = 0
const BACK_OWNER = -1


const CONTENTS_SOLID = 1;
const CONTENTS_EMPTY = 0;

class BSPNode {

    Makesolid(tree, polygons, node) {
        for (let p of polygons) {
            if (!p._was_best_splitter) {
                p._was_best_splitter = true;
                this._plane = new Ray(p.plane);
                this._front = new BSPNode(tree, this, polygons, true);
                this._front._owner = FRONT_OWNER;
                return;
            }
        }
    }

    static IsSolid(polygons) {
        return polygons.length === 0;
    }

    constructor(tree, parent, polygons, makesolid = false) {
        this._front = null;
        this._back = null;
        this._plane = null;
        this._polygons = null;
        this._trans_polygons = null;
        this._aabb = new AABB();
        this._parent = parent
        this._has_aabb_primitivs = false;
        this._checked = false;
        this._portals = null;
        this._leaf = null;
        this._node_type = BSP_NODE;
        this._node_id = -1;
        this._owner = ROOT_OWNER;
        this._leaf_id = -1;
        this._contents = -1;
        this.finde = this.Finde_besten_Splitter3;
        this._outside = false;
        if (parent == null) this._node_type = BSP_ROOD;

        this._aabb.Add(polygons);
        let best_splitter = this.Finde_besten_Splitter(polygons);

        //// BINGO THIS IS A LEAF  
        if (best_splitter === -1 || makesolid) {
            if (!makesolid) {

                for (let po of polygons) // 
                {
                    let res = this._parent._plane.Classify(po);
                    if (res === COPLANAR) { po._was_best_splitter = true; }
                }


                this._polygons = polygons;
                this._leaf_id = tree._leaf_list.length;
                tree._leaf_list.push(this);
                this._node_type = BSP_LEAF;
                this._leaf = this;
                this._portals = new Array();
                this.Makesolid(tree, polygons, this);

            } else {
                this._node_type = BSP_SUBLEAF;
                this._leaf = parent._leaf;
                this.Makesolid(tree, polygons, this);
            }

            return;
        }

        //// THIS IS A NORMAL NODE
        this._node_id = tree._node_list.length;
        tree._node_list.push(this);
        polygons[best_splitter]._was_best_splitter = true;
        this._plane = new Ray(polygons[best_splitter].plane);


        var front_polygons = new Array();
        var back_polygons = new Array();

        for (let p of polygons) {
            let result = this._plane.Classify(p);
            if (result === FRONT) { front_polygons.push(p); continue; }
            if (result === BACK) { back_polygons.push(p); continue; }
            if (result === SPANNING) {
                let s = p.SplitPolyByPlane(this._plane);
                //               for (let v of s[0].verts) v.world.snap();
                //               for (let v of s[1].verts) v.world.snap();
                if (s[0] && s[0].verts.length > 2) front_polygons.push(s[0]);
                if (s[1] && s[1].verts.length > 2) back_polygons.push(s[1]);
                continue;
            }

            if (result === PLANAR) {
                if (this._plane.normal.dot(p.plane.normal) >= 0) front_polygons.push(p);
                else back_polygons.push(p);
            }
        }

        if (front_polygons.length > 0) { this._front = new BSPNode(tree, this, front_polygons); this._front._owner = FRONT_OWNER; }
        if (back_polygons.length > 0) { this._back = new BSPNode(tree, this, back_polygons); this._back._owner = BACK_OWNER; }
    }

    hasIllegalGeometry() { for (let p of this._polygons) if (p._create_from_aabb) return true; return false; }
    DeletePrimitivs() { this._polygons = new Array(); }
    isLeaf() { return this._leaf == this; }
    isSubLeaf() { return this._leaf != this && this._leaf != null; }

    get polygons() { return this._polygons; }
    set polygons(s) { this._polygons = s; }

    get plane() { return this._plane; }
    set plane(s) { this._plane = s; }

    get aabb() { return this._aabb; }
    set aabb(s) { this._aabb = s; }

    get front() { return this._front; }
    set front(s) { this._front = s; }

    get back() { return this._back; }
    set back(s) { this._back = s; }

    get leaf() { return this._leaf; }
    set leaf(s) { this._leaf = s; }

    //0        1   
    //+---------+         V0 V1 V2
    //|\        |          0  1  2      
    //|  \      |          2  3  0
    //|    \    |
    //|      \  |
    //|        \|
    //+---------+
    //3         2
    TriangulatePolys() {
        if (!this.isLeaf()) {
            if (this._front != null) this._front.TriangulatePolys();
            if (this._back != null) this._back.TriangulatePolys();
            return;
        }
        let temp = [];
        for (let p of this._polygons) {
            let v = [p.verts[(0) % p.verts.length]];
            for (let i = 1; i < p.verts.length; i = i + 1) {
                v[1] = p.verts[(i + 0) % p.verts.length]
                v[2] = p.verts[(i + 1) % p.verts.length]
                let np = new Polygon(v);
                np.CoppyAttribs(p);
                temp.push(np);
            }
        }
        this._polygons = temp;
    }


    ExtractPrims(out, reset_attribs = true) {
        if (this.isLeaf())
            for (let p of this._polygons) {
                let pp = new Polygon(p);
                if (reset_attribs) pp._was_best_splitter = false;
                out.push(pp);
            }
        if (this._front != null) this._front.ExtractPrims(out);
        if (this._back != null) this._back.ExtractPrims(out);
    }

    ExtractPrimsNoCopy(out) {
        if (this.isLeaf())
            for (let p of this._polygons) {
                out.push(p);

            }
        if (this._front != null) this._front.ExtractPrimsNoCopy(out);
        if (this._back != null) this._back.ExtractPrimsNoCopy(out);
    }


    ExtractPortals(out, reset_attribs = true) {
        if (this.isLeaf())
            for (let p of this._portals) {
                if (reset_attribs) p._checked = false;
                out.push(p);
            }
        if (this._front != null) this._front.ExtractPrims(out);
        if (this._back != null) this._back.ExtractPrims(out);
    }

    render(engine, camera_position, frustum, xform) {

        if (this._outside) return;

        if (engine._use_node_frustum_culling) {


            // ---- Frustum Culling ----
            if (!frustum.intersectsAABB(this._aabb)) {
                engine._node_aabb_frustum_culled++;
                return;
            }
        }

        // ---- Projection ----
        const bbox = this._aabb.projectAABBToScreen(
            xform, engine.width(), engine.height()
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

        this.nodes_checkt++;





        if (this.isLeaf()) {
            for (let p of this._polygons) {

                if (p.plane.Classify(camera_position) == BACK) {
                    engine._primitives_back_face_culling++;
                    continue;
                }

                let clipped = engine._BeamTree.renderPolygon(p);
                if (!clipped) continue;
                /*


                let result = p.ClipByFrustum(frustum);
                if (result[1] < 0 || result[0] === undefined || result[0].verts.length < 3) {
                    engine._primitives_frustum_culling++;
                    continue;
                }

                let clipped = result[0];
*/

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




            return;
        }


        let result = this._plane.Classify(camera_position);
        if (result === FRONT) {
            if (this._front) this._front.render(engine, camera_position, frustum, xform);
            if (this._back) this._back.render(engine, camera_position, frustum, xform);
            return;
        }

        if (this._back) this._back.render(engine, camera_position, frustum, xform);
        if (this._front) this._front.render(engine, camera_position, frustum, xform);


    }


    AddExtraPolygon(polygon, out) {
        polygon = this._aabb.ClipPolygon(polygon);
        if (!this._front && !this._back) {
            if (this._owner != FRONT_OWNER) return;
            out.push(polygon)
            this._leaf._polygons.push(polygon)
            DebugOut("Hallo\n")
            return;
        }


        var result = this.plane.Classify(polygon)


        switch (result) {
            case FRONT: if (this._front) this._front.AddExtraPolygon(polygon, out); break;
            case BACK: if (this._back) this._back.AddExtraPolygon(polygon, out); break;
            case SPANNING:
                let p = polygon.SplitPolyByPlane(this.plane);
                if (p[0] && this._front) this._front.AddExtraPolygon(p[0], out);
                if (p[1] && this._back) this._back.AddExtraPolygon(p[1], out);
                break;
            case COPLANAR:
                if (!this._front || !this._back) {
                    if (this._front) this._front.AddExtraPolygon(polygon, out);
                    else this._back.AddExtraPolygon(polygon, out);
                } else {
                    let temp = new Array();
                    this._front.AddExtraPolygon(polygon, temp);
                    for (let p of temp) this._back.AddExtraPolygon(polygon, out);
                }

                break;
            default: DebugOut("!!!!!!!!!!!!!!!!!!!! ERROR2 !!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
                break;
        }

    }



    ClipPortal(portal, out) {

        portal = this._aabb.ClipPortal(portal);
        if (!this._front && !this._back) {


            if (this._owner != FRONT_OWNER) return;

            if (portal._leaf1 == null) portal._leaf1 = this._leaf; else portal._leaf2 = this._leaf;
            out.push(portal);
            return;
        }


        var result = this.plane.Classify(portal.verts)


        switch (result) {
            case FRONT: if (this._front) this._front.ClipPortal(portal, out); break;
            case BACK: if (this._back) this._back.ClipPortal(portal, out); break;
            case SPANNING:
                let p = portal.SplitByPlane(this.plane);
                if (p[0] && this._front) this._front.ClipPortal(p[0], out);
                if (p[1] && this._back) this._back.ClipPortal(p[1], out);
                break;
            case COPLANAR:
                if (!this._front || !this._back) {
                    if (this._front) this._front.ClipPortal(portal, out);
                    else this._back.ClipPortal(portal, out);
                } else {
                    let temp = new Array();
                    this._front.ClipPortal(portal, temp);
                    for (let p of temp) this._back.ClipPortal(p, out);
                }

                break;
            default: DebugOut("!!!!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
                break;
        }

    }

    AxisScore(normal) {
        const ax = Math.abs(normal.x);
        const ay = Math.abs(normal.y);
        const az = Math.abs(normal.z);

        // wie stark ist die größte Komponente?
        const max = Math.max(ax, ay, az);

        // 1.0 = perfekt achsenaligned
        return max;
    }


    Finde_besten_Splitter(polyliste, gewichtung = 18) {
        return this.finde(polyliste, gewichtung);
    }


    Finde_besten_Splitter1(polyliste, gewichtung = 18) {


        let best_index = -1
        let blnSplitter_gefunden = false
        let ulBest_Score = 1000000

        for (let i = 0; i < polyliste.length; i++) {
            let lFront = 0;
            let lBack = 0;
            let lPlanar = 0;
            let lSplits = 0;
            const pSplitter = polyliste[i];

            if (pSplitter._was_best_splitter) continue;

            for (let j = 0; j < polyliste.length; j++) {
                const pAkt_Poly = polyliste[j];

                if (i === j || pAkt_Poly._can_not_be_splitter || pAkt_Poly._create_from_aabb) continue


                let nKlasse = pSplitter.plane.Classify(pAkt_Poly);

                if (nKlasse === FRONT) lFront = lFront + 1; else
                    if (nKlasse === BACK) lBack = lBack + 1; else
                        if (nKlasse === PLANAR) lPlanar = lPlanar + 1; else lSplits = lSplits + 1;

            }

            let ulScore = 0;
            if (USE_AXIS_SORT_AND_VECTOR_SNAP) {
                const axis = this.AxisScore(pSplitter.plane.normal);
                const axisPenalty = (1.0 - axis) * 50; // Tuning-Wert!
                ulScore = Math.abs(lFront + lBack) + (lSplits * gewichtung) + axisPenalty;

            } else ulScore = Math.abs(lFront + lBack) + (lSplits * gewichtung);






            if (!(((lFront > 0) && (lBack > 0)) || (lSplits > 0))) continue;

            if (ulScore <= ulBest_Score) {
                ulBest_Score = ulScore;
                blnSplitter_gefunden = true;
                best_index = i;
            }


        }
        if (!blnSplitter_gefunden) return -1;
        return best_index;
    }


    Finde_besten_Splitter2(polyliste, gewichtung = 18) {
        let best_index = -1;
        let best_score = Number.MAX_VALUE;

        //
        // ------------------------------------------------------------
        // PHASE 1
        // Kandidaten vorsortieren (billige Heuristik)
        // ------------------------------------------------------------
        //

        const kandidaten = [];

        for (let i = 0; i < polyliste.length; i++) {
            const p = polyliste[i];

            if (p._was_best_splitter) continue;
            if (p._can_not_be_splitter) continue;
            if (p._create_from_aabb) continue;

            //
            // Achsenbevorzugung
            // (Wände/Böden meist besser als schräge Flächen)
            //
            const axisScore = this.AxisScore(p.plane.normal);

            //
            // Optional:
            // Große Polygone bevorzugen
            //
            const areaScore = p.area || 1.0;

            //
            // Billiger Heuristik-Wert
            // Höher = interessanter Kandidat
            //
            const heuristic =
                (axisScore * 10.0) +
                areaScore;

            kandidaten.push({
                index: i,
                heuristic: heuristic
            });
        }

        //
        // Beste Kandidaten zuerst
        //
        kandidaten.sort((a, b) =>
            b.heuristic - a.heuristic
        );

        //
        // ------------------------------------------------------------
        // PHASE 2
        // Nur einen Teil der Kandidaten exakt testen
        // ------------------------------------------------------------
        //

        //
        // z.B. maximal 32 Kandidaten testen
        //
        //const maxTests =  Math.min(32, kandidaten.length);

        const maxTests = kandidaten.length;


        for (let k = 0; k < maxTests; k++) {
            const i = kandidaten[k].index;

            const pSplitter = polyliste[i];

            let lFront = 0;
            let lBack = 0;
            let lPlanar = 0;
            let lSplits = 0;

            //
            // --------------------------------------------------------
            // Exakte Bewertung
            // --------------------------------------------------------
            //
            let aborted = false;
            for (let j = 0; j < polyliste.length; j++) {
                if (i === j) continue;

                const pAkt_Poly = polyliste[j];

                if (pAkt_Poly._can_not_be_splitter)
                    continue;

                //
                // Polygon klassifizieren
                //
                const nKlasse =
                    pSplitter.plane.Classify(pAkt_Poly);

                if (nKlasse === FRONT) {
                    lFront++;
                }
                else
                    if (nKlasse === BACK) {
                        lBack++;
                    }
                    else
                        if (nKlasse === PLANAR) {
                            lPlanar++;
                        }
                        else {
                            lSplits++;
                        }

                //
                // ----------------------------------------------------
                // EARLY OUT
                //
                // Sobald Kandidat schlechter wird:
                // sofort abbrechen
                // ----------------------------------------------------
                //

                const currentScore =
                    Math.abs(lFront - lBack) +
                    (lSplits * gewichtung);

                if (currentScore > best_score) {
                    aborted = true;
                    break;

                }
            }
            if (aborted)
                continue;
            //
            // Splitter muss wirklich trennen
            //
            if (!(((lFront > 0) && (lBack > 0)) ||
                (lSplits > 0))) {
                continue;
            }

            //
            // Finale Bewertung
            //
            const axis =
                this.AxisScore(pSplitter.plane.normal);

            const axisPenalty =
                (1.0 - axis) * 50.0;

            const finalScore =
                Math.abs(lFront - lBack) +
                (lSplits * gewichtung) +
                axisPenalty;

            //
            // Bester Kandidat?
            //
            if (finalScore < best_score) {
                best_score = finalScore;
                best_index = i;
            }
        }

        return best_index;
    }
Finde_besten_Splitter3(polyliste, nodeAABB, gewichtung = 18) {
        let best_index = -1;
        let best_score = Number.MAX_VALUE;

        const kandidaten = [];

        //---------------------------------------------
        // Kandidaten vorsortieren
        //---------------------------------------------

        for (let i = 0; i < polyliste.length; i++) {
            const p = polyliste[i];

            if (p._was_best_splitter) continue;
            if (p._can_not_be_splitter) continue;
            if (p._create_from_aabb) continue;

            const axisScore = this.AxisScore(p.plane.normal);
            const areaScore = p.area || 1.0;

            kandidaten.push({
                index: i,
                heuristic: axisScore * 10.0 + areaScore
            });
        }

        kandidaten.sort((a, b) => b.heuristic - a.heuristic);

        //---------------------------------------------
        // SAH
        //---------------------------------------------

        const parentArea = nodeAABB.SurfaceArea()

        for (const kandidat of kandidaten) {
            const i = kandidat.index;
            const splitter = polyliste[i];

            let lFront = 0;
            let lBack = 0;
            let lSplits = 0;

            for (let j = 0; j < polyliste.length; j++) {
                if (i == j) continue;

                const p = polyliste[j];

                if (p._can_not_be_splitter)
                    continue;

                const c = splitter.plane.Classify(p);

                if (c === FRONT) lFront++;
                else
                    if (c === BACK) lBack++;
                    else
                        if (c === SPANNING) { lSplits++; lFront++; lBack++; }
            }

            if (lFront == 0 && lBack == 0 && lSplits == 0)
                continue;

            //---------------------------------------------
            // virtuelle Aufteilung
            //---------------------------------------------

            const split = nodeAABB.SplitAABB(splitter.plane);

            const frontArea = split[0].SurfaceArea();
            const backArea = split[1].SurfaceArea();


            //---------------------------------------------
            // klassische SAH
            //---------------------------------------------

            const sah =
                (frontArea / parentArea) * lFront +
                (backArea / parentArea) * lBack +
                gewichtung * lSplits;

            //---------------------------------------------
            // Achsenbonus
            //---------------------------------------------

            const axisPenalty =
                (1.0 - this.AxisScore(
                    splitter.plane.normal)) * 5.0;

            const score =
                sah + axisPenalty;

            if (score < best_score) {
                best_score = score;
                best_index = i;
            }
        }

        return best_index;
    }


}





class BSPTree {
    constructor(polygons = nothing) {
        this._leaf_list = new Array();
        this._node_list = new Array();
        this._portal_list = new Array();
        this._root = null;
        this.total_node_count = 0;
        this.Build(polygons);



    }


    RayInterect(origin, dir) {
        if (!this._root) return null;
        return this.raycastBSP(this._root, origin, dir, bestHit);
    }

    raycastBSP(node, origin, dir, bestHit = null) {

        if (!node)
            return bestHit;

        //---------------------------------
        // Seite bestimmen
        //---------------------------------

        const side =
            node.plane.normal.x * origin.x +
            node.plane.normal.y * origin.y +
            node.plane.normal.z * origin.z -
            node.plane.d;

        let nearNode;
        let farNode;

        if (side >= 0) {

            nearNode = node.front;
            farNode = node.back;

        } else {

            nearNode = node.back;
            farNode = node.front;
        }

        //---------------------------------
        // Nahe Seite zuerst
        //---------------------------------

        bestHit = raycastBSP(
            nearNode,
            origin,
            dir,
            bestHit
        );

        //---------------------------------
        // Polygone testen
        //---------------------------------

        for (const poly of node.polygons) {

            const hit =
                intersectRayPolygon(
                    origin,
                    dir,
                    poly
                );

            if (!hit)
                continue;

            if (
                !bestHit ||
                hit.t < bestHit.t
            ) {
                bestHit = hit;
            }
        }

        //---------------------------------
        // Ferne Seite
        //---------------------------------

        bestHit = raycastBSP(
            farNode,
            origin,
            dir,
            bestHit
        );

        return bestHit;
    }


    Build(polygons) {
        this._leaf_list = new Array();
        this._node_list = new Array();
        this._portal_list = new Array();
        this._root = null;
        this.total_node_count = 0;
        if (polygons && polygons.length) {
            for (let p of polygons) {
                p._was_best_splitter = false;
                p._id = -1;
                p._node_id = -1;
                p._leaf_id = -1;
            }
            this._root = new BSPNode(this, null, polygons);
        }

        this.total_node_count = this._leaf_list.length;



    }

    TriangulatePolys() {
        if (!this._root) return;
        this._root.TriangulatePolys();
    }

    StepNodes(node) {
        if (node === null) return;
        console.log(node._outside, node._node_type)
        if (node._outside) return;
        if (node._node_type === BSP_LEAF) {
            this._leaf_list.push(node);
            for (let p of node._portals) this._portal_list.push(p);
        } else this._node_list.push(node);
        this.StepNodes(node.front);
        this.StepNodes(node.back);

    }
    Rebuild() {
        return;
        this._leaf_list = new Array();
        this._node_list = new Array();
        this._portal_list = new Array();
        this.StepNodes(this._root);
    }


    ExtractPrimsNoCopy() {
        let out = new Array();
        if (this._root != null) this._root.ExtractPrimsNoCopy(out);
        return out;
    }
    ExtractPrims(reset_attribs = true) {
        let out = new Array();
        if (this._root != null) this._root.ExtractPrims(out, reset_attribs);
        return out;
    }

    ExtractPortals(reset_attribs = true) {
        if (reset_attribs)
            for (let p of this._portal_list) p._checked = false;

        return this._portal_list;
    }
    ExtractPortalsNoCopy(reset_attribs = true) {
        if (reset_attribs)
            for (let p of this._portal_list) p._checked = false;

        return this._portal_list;
    }

    render(camera, engine) {

        var xform = camera.GetCombinedMatrix();
        var frustum = new Frustum();
        frustum.createByCam(cam);

        if (this._root === null) return;
        this._root.render(engine, camera.position, frustum, xform);

        return true;
    }

    renderLeafs(engine) {

        for (let l of this._leaf_list) {
            if (l._polygons.length <= 0) continue
            let polygons = l.aabb.BuildPolygons();
            for (let p of polygons) {
                engine.DrawPolyLined(p);

            }

            DrawText
        }

    }

    renderSingleLeaf(engine, num) {

        if (num < 0 || num >= this._leaf_list.length) return;
        let l = this._leaf_list[num];
        {
            let polygons = l.aabb.BuildPolygons();
            for (let p of polygons) {
                engine.DrawPolyLined(p);
            }
        }

    }

    renderPortals(engine) {

        for (let l of this._leaf_list) {

            for (let p of l._portals) {
                let p1 = new Polygon(p.verts);
                //let p2=new Polygon(p._brother.verts);
                engine.DrawPolyLined3(p1, new Vector3(0, 1, 0));
                //engine.DrawPolyLined2(p2,new Vector3(1,1,0));
            }
        }

    }


    AddExtraPolygon(polygon) {
        if (!this._root) return;
        let out = [];
        this._root.AddExtraPolygon(polygon, out);
    }



    BuildPortals() {
        this._portal_list = new Array();

        if (!this._root) return;

        for (let n of this._node_list) {

            let portal = n._aabb.ClipPortal(new Portal(n.plane, n.aabb.len()/*1000000000*/));
            let pre_list = new Array();


            n.ClipPortal(portal, pre_list);
            for (let p of pre_list) {
                if (p._leaf1 == p._leaf2) continue;
                if (p._leaf1 == null || p._leaf2 == null) continue;

                p.id = this._portal_list.length;
                let p1 = new Portal(p);


                if (!(p.plane.Classify(p._leaf1.aabb.center) === BACK)) {
                    p1._leaf1 = p._leaf2;
                    p1._leaf2 = p._leaf1;
                    p1.reverse();
                    p._leaf1._portals.push(p);
                    p._leaf2._portals.push(p1);
                } else {
                    p._leaf1 = p1._leaf2;
                    p._leaf2 = p1._leaf1;
                    p._leaf1._portals.push(p1);
                    p._leaf2._portals.push(p);
                    p.reverse();
                }
                this._portal_list.push(p);
                this._portal_list.push(p1);
                p._brother = p1;
                p1._brother = p;
            }

        }

    }

}


