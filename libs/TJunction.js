

class TJunction {
    constructor() {
        this._root = null;
    }

    vertexKey(v, precision = 1000) {
        return (
            Math.round(v.x * precision) + "," +
            Math.round(v.y * precision) + "," +
            Math.round(v.z * precision)
        );
    }



    fixTJunctions2(polyA, polygons) {
        let changed = true;
        while (changed) {

            changed = false;
            for (let ei = 0; ei < polyA.verts.length; ei++) {

                const a = polyA.verts[ei].world;
                const b = polyA.verts[(ei + 1) % polyA.verts.length].world;

                // Gegen alle anderen Polygone testen
                for (let pj = 0; pj < polygons.length; pj++) {

                    const polyB = polygons[pj];

                    for (let vi = 0; vi < polyB.verts.length; vi++) {

                        const p = polyB.verts[vi].world;

                        if (PointOnEdge(a, b, p) === EDGE_POINT_ON_EDGE) {
                            polyA.InsertVertexOnEdge(ei, p)

                            changed = true;

                            // Polygon verändert → Schleife neu starten
                            break;
                        }
                    }

                    if (changed) break;
                }

                if (changed) break;
            }

        }


    }
    fixTJunctions(polygons) {

        let changed = true;
        let aabb = [];
        for (let p of polygons) {
            aabb.push(new AABB(p));
        }


        for (let i = 0; i < polygons.length; i++) {

            let poly_list = [];

            for (let j = 0; j < polygons.length; j++) {
                if (i === j) continue;
                if (!aabb[i].IntersectedByBounds(aabb[j])) continue;
                poly_list.push(polygons[j]);
                this.fixTJunctions2(polygons[i], poly_list);
            }
        }
    }


    fixTJunctionsOLD(polygons) {

        let changed = true;
        let aabb = [];
        for (let p of polygons) {
            aabb.push(new AABB(p));
        }
        while (changed) {

            changed = false;

            for (let pi = 0; pi < polygons.length; pi++) {

                const polyA = polygons[pi];

                for (let ei = 0; ei < polyA.verts.length; ei++) {

                    const a = polyA.verts[ei].world;
                    const b = polyA.verts[(ei + 1) % polyA.verts.length].world;

                    // Gegen alle anderen Polygone testen
                    for (let pj = 0; pj < polygons.length; pj++) {

                        if (pi === pj)
                            continue;
                        if (!aabb[pi].IntersectedByBounds(aabb[pj])) continue;
                        const polyB = polygons[pj];

                        for (let vi = 0; vi < polyB.verts.length; vi++) {

                            const p = polyB.verts[vi].world;

                            if (PointOnEdge(a, b, p) === EDGE_POINT_ON_EDGE) {
                                polyA.InsertVertexOnEdge(ei, p)

                                changed = true;
                                console.log(pi);
                                // Polygon verändert → Schleife neu starten
                                break;
                            }
                        }

                        if (changed) break;
                    }

                    if (changed) break;
                }

                if (changed) break;
            }
        }
    }


    buildVertexNormals(polygons) {
        const clusterMap = new Map();

        /*
            PASS 1:
            Face-Normalen berechnen
        */

        /*
            PASS 2:
            Vertex-Cluster aufbauen
        */
        for (let poly of polygons) {

            for (let vertex of poly.verts) {
                let pos = vertex.world;

                let key = this.vertexKey(pos);

                let cluster = clusterMap.get(key);

                if (!cluster) {
                    cluster =
                    {
                        vertices: [],
                        normalSum: new Vector3(0, 0, 0)
                    };

                    clusterMap.set(key, cluster);
                }

                cluster.vertices.push(vertex);


                cluster.normalSum.x += poly.plane.normal.x;
                cluster.normalSum.y += poly.plane.normal.y;
                cluster.normalSum.z += poly.plane.normal.z;
                cluster.normalSum.x /= 2.0;
                cluster.normalSum.y /= 2.0;
                cluster.normalSum.z /= 2.0;

            }
        }

        /*
            PASS 3:
            Vertexnormalen erzeugen
        */
        for (let cluster of clusterMap.values()) {
            let finalNormal = new Vector3(cluster.normalSum);
            //finalNormal.normalize();


            for (let vertex of cluster.vertices) {
                vertex.normal = new Vector3(finalNormal);


                vertex.color = new Vector3(0.5 * vertex.normal.x + 0.5, 0.5 * vertex.normal.y + 0.5, 0.5 * vertex.normal.z + 0.5);




            }
        }
    }


    Build(bsp, clac_vertex_normals = true) {


        let polys = bsp.ExtractPrimsNoCopy();
        this.fixTJunctions(polys);
        let id = 0;
        for (let poly of polys) {
            poly._id = CalcIndex(POLY_INDEX, 0, id++)
            poly.SetFaceNormalToVerts2();
            poly.setWorldTexture(0.01, 0.01);
            this.buildVertexNormals(polys);
            //  bsp.TriangulatePolys();
        }
    }
}