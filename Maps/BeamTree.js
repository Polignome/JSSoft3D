class Beam {

    constructor() {
        this.planes = [];
    }

    addPlane(plane) {
        this.planes.push(plane);
    }

    // --------------------------------------------------------
    // Test polygon visibility
    // --------------------------------------------------------

    isPolygonVisible(poly) {

        for (const plane of this.planes) {

            let insideCount = 0;

            for (const v of poly.verts) {

                if (plane.distance(v.world) >= 0) {
                    insideCount++;
                }
            }

            // fully outside
            if (insideCount === 0) {
                return false;
            }
        }

        return true;
    }

    // --------------------------------------------------------
    // Clip polygon against beam
    // --------------------------------------------------------

    clipPolygon(poly) {

        let result = new Polygon(poly);
        let i = 0;
        for (const plane of this.planes) {

            result = result.ClipPolyByPlaneNoSnap(plane, result);

            if (!result || result.verts.length < 3) {

                return null;
            }
        }

        return result;
    }

    static buildBeamFromPolygon(camera, poly) {

        const beam = new Beam();

        const eye = camera.position;

        const verts = poly.verts;

        for (let i = 0; i < verts.length; i++) {

            const v0 = verts[i].world;
            const v1 = verts[(i + 1) % verts.length].world;

            const plane = Ray.CalcPlaneBy3Vectors(
                eye,
                v0,
                v1
            );

            beam.addPlane(plane);
        }

        return beam;
    }


}

class BeamTreeNode {

    constructor(beam = null) {
        this.beam = beam;
        this.children = [];
    }

    addChild(node) {
        this.children.push(node);
    }
}


class BeamTree {
    constructor(camera) {
        this.ReInit(camera, null);
    }

    ReInit(camera, frustum) {
        if (camera === null || frustum === null) return;
        this.camera = camera;
        this.rootBeam = new Beam();

        for (let f of frustum.planes) this.rootBeam.addPlane(f);
        this.rootNode = new BeamTreeNode(this.rootBeam);
        this._polys_in = 0;
        this._polys_out = 0;

    }
    renderPolygon(poly) {
        return this.renderPolygonN(poly, this.rootNode);
    }

    renderPolygonN(poly, node) {
        // visibility test
        this._polys_in++;

        if (!node.beam.isPolygonVisible(poly)) {
            // console.log("CULLED");
            return null;
        }

        // clip polygon
        let clipped = node.beam.clipPolygon(poly);

        if (!clipped) {
            // console.log("FULLY CLIPPED");
            return null;
        }

        this._polys_out++;


        // draw
        //this.drawPolygon(clipped);

        // build occlusion beam
        const newBeam = Beam.buildBeamFromPolygon(
            this.camera,
            clipped
        );


        // merge planes
        for (const p of node.beam.planes) {
            newBeam.addPlane(p);
        }


        const child = new BeamTreeNode(newBeam);

        node.addChild(child);



        return clipped;
    }


}
