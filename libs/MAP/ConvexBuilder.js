class ConvexBuilder {

    //
    // Schnittpunkt dreier Ebenen 
    // Formel:  P = ( -d1 (n2×n3) - d2(n3×n1) - d3(n1×n2) ) / ( n1·(n2×n3) )
    //
    static intersect3Planes(p1, p2, p3) {
        const n1 = p1.normal;
        const n2 = p2.normal;
        const n3 = p3.normal;

        const d1 = p1.D;
        const d2 = p2.D;
        const d3 = p3.D;

        const c1 = n2.cross(n3);     // n2 × n3
        const denom = n1.dot(c1);    // n1 · (n2 × n3)

        if (Math.abs(denom) < 1e-9) return null;

        const c2 = n3.cross(n1);     // n3 × n1
        const c3 = n1.cross(n2);     // n1 × n2

        // -d1 c1 - d2 c2 - d3 c3
        const t1 = c1.mul(-d1);
        const t2 = c2.mul(-d2);
        const t3 = c3.mul(-d3);

        const P = t1.add(t2).add(t3).div(denom);
        return P;
    }

    //
    // Punkt in allen Halbräumen?
    // Bedingung für convex bodies:  n·x + D <= 0
    //
    static pointInsidePlanes(P, planes) {
        for (const pl of planes) {
            if (pl.normal.dot(P) + pl.D > 1e-6) return false;
        }
        return true;
    }

    //
    // Alle gültigen Vertices: Schnitt jeder 3 Planes
    //S
    static computeVertices(planes) {
        const verts = [];

        for (let i = 0; i < planes.length; i++) {
            for (let j = i + 1; j < planes.length; j++) {
                for (let k = j + 1; k < planes.length; k++) {

                    const P = this.intersect3Planes(planes[i], planes[j], planes[k]);
                    
                    if (!P) continue;

                       
                 //   if (this.pointInsidePlanes(P, planes)) 
                        {
                       
                       
                        verts.push({
                            P: P,
                            planes: [i, j, k]
                        });
                    }
                }
            }
        }

        return verts;
    }
    

    //
    // Lokale Ebene → 2D Koordinatensystem
    //
    static buildLocalBasis(n) {
        // Wähle einen nicht-parallelen Vektor
        let u;

        if (Math.abs(n.x) > 0.9)
            u = new Vector3(0, 1, 0);
        else
            u = new Vector3(1, 0, 0);

        u = n.cross(u);  // garantiert orthogonal
        u.normalize();

        const v = n.cross(u);

        return { u, v };
    }

    //
    // Polygon für eine Plane konstruieren
    //
    static buildPolygonForPlane(planeIndex, planes, vertices) {
        const pl = planes[planeIndex];
        const { u, v } = this.buildLocalBasis(pl.normal);

        const pts = [];

        // Alle Punkte, die auf dieser Ebene liegen
        for (const entry of vertices) {
            if (entry.planes.includes(planeIndex)) {
                const P = entry.P;

                // 2D Projektion für Winkel sortierung
                const x = P.dot(u);
                const y = P.dot(v);

                pts.push({ P, x, y });
            }
        }

        if (pts.length < 3) return [];

        // Schwerpunkt
        const cx = pts.reduce((s, e) => s + e.x, 0) / pts.length;
        const cy = pts.reduce((s, e) => s + e.y, 0) / pts.length;

        // Sortieren über Polarwinkel
        pts.sort((a, b) => {
            const angA = Math.atan2(a.y - cy, a.x - cx);
            const angB = Math.atan2(b.y - cy, b.x - cx);
            return angA - angB;
        });

        return pts.map(p => p.P);
    }

    //
    // Hauptfunktion: Erzeugt konvexen Körper
    //
    static build(planes) {

        const vertices = this.computeVertices_old(planes);

        const faces = [];

        for (let i = 0; i < planes.length; i++) {
            const poly = this.buildPolygonForPlane(i, planes, vertices);
            if (poly.length >= 3) {
                faces.push(poly);
            }
        }

        return faces;   // Array<Array<Vector3>>
    }

    static buildFromBrushfaces(faces) {

        
        const planes=[] ;


        
        for (let i = 0; i < faces.length; i++) {
            planes.push(faces[i].plane);
        }
        const vertices = this.computeVertices(planes);
        
      

        for (let i = 0; i < planes.length; i++) {
            const poly = this.buildPolygonForPlane(i, planes, vertices);
            if (poly.length >= 3) {
                
                faces[i].verts=poly;
            } 
        }
       
        return faces;   // Array<Array<Vector3>>
    }
}