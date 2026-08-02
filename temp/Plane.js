/////////////////////////////////////////////////////////////////////////////////////////////
//
// SameType ersetzt durch instanceof 
//
/////////////////////////////////////////////////////////////////////////////////////////////


const BACK = -1
const COPLANAR = 0
const PLANAR = COPLANAR
const FRONT = 1
const SPANNING = 3

const XAXIS = 0;
const YAXIS = 1;
const ZAXIS = 2;

const TRIM = 10



function GetACopy(v) {
    if (v instanceof Vector2) return new Vector2(v);

    if (v instanceof Vector3) return new Vector3(v);

    if (v instanceof Vector4) return new Vector4(v);

    if (v instanceof Vert) {


        var h = new Vert();
        h.setWorld(v.world);
        h.setTexture(v.texture);
        h.setScreen(v.screen);
        return h;
    }
    return undefined;

}


class Ray {
    constructor(N = 3, M = 0) {
        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;

        if (N instanceof Vector3 && M instanceof Vector3) {
            this.calc(N, M);
            this._N = 3;
            return;
        }



        if (N instanceof Ray) {

            this._N = N.N;

            if (this._N == 2) {
                this._origin = new Vector2(N.origin);
                this._vector = new Vector2(N.vector);
                this._normal = new Vector2(N.normal);
            }

            if (this._N == 3) {
                this._origin = new Vector3(N.origin);
                this._vector = new Vector3(N.vector);
                this._normal = new Vector3(N.normal);
            }
            if (this._N == 4) {
                this._origin = new Vector4(N.origin);
                this._vector = new Vector4(N.vector);
                this._normal = new Vector4(N.normal);
            }

            this._length = N.length;
            this._D = N.D;

            return;

        }



        this._N = N;


        if (N == 2) {
            this._origin = new Vector2();
            this._vector = new Vector2();
            this._normal = new Vector2();
        }

        if (N == 3) {
            this._origin = new Vector3();
            this._vector = new Vector3();
            this._normal = new Vector3();
        }
        if (N == 4) {
            this._origin = new Vector4();
            this._vector = new Vector4();
            this._normal = new Vector4();
        }


        this._length = 0.0;
        this._D = 0.0;
    }

    calc(o, v) {
        this._origin = new Vector3(o);
        this._vector = new Vector3(v);;

        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
    }
    get N() { return this._N; }

    get origin() { return this._origin; }
    get vector() { return this._vector; }
    get normal() { return this._normal; }
    get length() { return this._length; }

    get nCalculated() { return this._nCalculated; }
    get lCalculated() { return this._lCalculated; }
    get dCalculated() { return this._dCalculated; }


    set origin(a) {
        this._dCalculated = false;

        if (this._N == 2) { this._origin = new Vector2(a); return; }
        if (this._N == 3) { this._origin = new Vector3(a); return; }
        if (this._N == 4) { this._origin = new Vector4(a); return; }

    }


    invert() {
        this.calc(this.origin, this.vector);
    }
    set vector(a) {
        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
        if (this._N == 2) { this._vector = new Vector2(a); return; }
        if (this._N == 3) { this._vector = new Vector3(a); return; }
        if (this._N == 4) { this._vector = new Vector4(a); return; }
    }

    set normal(a) {
        if (this._N == 2) { this._normal = new Vector2(a); return; }
        if (this._N == 3) { this._normal = new Vector3(a); return; }
        if (this._N == 4) { this._normal = new Vector4(a); return; }
    }
    set length(a) { this._length = a; }

    static MakeEdgePlane(v0, v1, polygonNormal) {

        const edge = v1.sub(v0);

        // Seitennormalenrichtung
        let n = edge.cross(polygonNormal);

        const len = n.length();
        if (len > 0.000001) {
            n = n.mul(1.0 / len);
        }

        // Plane durch v0 mit dieser Normalen
        return Ray.FromPointNormal(v0, n);
    }

    static FromPointNormal(point, normal) {
        const r = new Ray(3);

        r.origin = point;
        r.vector = normal;

        // wichtig: Normal sofort fixieren
        r.normal = normal;

        // D wird über Getter berechnet, aber wir fixen es stabil:
        r._D =
            -(r.normal.x * point.x +
                r.normal.y * point.y +
                r.normal.z * point.z);

        r._dCalculated = true;

        return r;
    }

    static CalcPlaneBy3Vectors(a, b, c, counterClock = false) {
        var v0 = b.sub(a);
        var v1 = c.sub(b);
        var ray = new Ray();
        var v3 = v1.cross(v0);
        if (!counterClock) v3 = v3.mul(-1);
        ray.origin = a;
        ray.vector = v3;
        return ray;
    }


    toStr() {
        var s = "N: " + this.N + "\n" +
            //  "o: "+this.origin.toStr()+"\n"+
            //  "v: "+this.vector.toStr()+"\n"+
            //  "n: "+this.normal.toStr()+"\n"+
            //  "l: "+this.length+"\n"+
            "D: " + this.D + "\n";
        return s;
    }


    distance(point) {
        let r = new Ray(3);
        r.origin = point;
        r.normal.x = -this.normal.x;
        r.normal.y = -this.normal.y;
        r.normal.z = -this.normal.z;




        return this.intersect(r)[1];
    }


    intersect(r) {
        let time = 0.0;
        var denom = this.normal.dot(r.normal);

        if (denom == 0) return -1;

        let numer = this.normal.dot(r.origin);

        return Math.abs(-((numer + this.D) / denom));


    }



    closest(point) {
        let t = this.distance(point);
        if (this._N == 2) return new Vector2(point.sub(normal().mul(t)));
        if (this._N == 3) return new Vector3(point.sub(normal().mul(t)));
        return new Vector4(point.sub(normal().mul(t)));
    }

    get length() {
        if (!this._lCalculated) {
            this._length = this.vector.length();
            this._lCalculated = true;
        }

        return this._length;
    }

    set length(len) {

        if (this._nCalculated) this.vector = normal.mul(len);
        else this._vector.setLength(len);

        this._length = len;
        this._lCalculated = true;
    }

    get D() {
        if (!this._dCalculated) {
            this._D = -(this.origin.dot(this.normal));
            this._dCalculated = true;
        }

        return this._D;
    }

    get normal() {
        if (!this.nCalculated) {
            this._normal = new Vector3(this._vector);
            this._normal.normalize();
            this._nCalculated = true;
        }

        return this._normal;
    }

    end(len = undefined) {
        if (len == undefined) this.origin.add(this.vector);
        return this.origin.add(this.normal.mul(len));

    }

    closest(point) {
        var t = this.distance(point);
        return point.sub(this.normal.mul(t));
    }


    flush() {
        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
    }



    Classify(v) {

        if (v instanceof Polygon) {
            //            console.log("------------- Prim");
            return this.Classify(v.verts);

        }
        if (v instanceof Portal) {
            return this.Classify(v.verts);

        }


        if (v instanceof Vector3) {
            //          console.log("------------- vector");
            var dir = this.origin.sub(v);
            var e = dir.dot(this.normal)
            if (e < 0) return FRONT;
            if (e > 0) return BACK;
            return COPLANAR;
        }
        if (v instanceof Vert) {
            //        console.log("------------- vert");    
            var dir = this.origin.sub(v.world);
            var e = dir.dot(this.normal)
            if (e < 0) return FRONT;
            if (e > 0) return BACK;
            return COPLANAR;
        }

        if (v instanceof Array) {


            //      console.log("------------- Arry");
            var front = 0;
            var back = 0;
            var planar = 0;
            for (let i = 0; i < v.length; i++) {
                var res = this.Classify(v[i]);

                if (res === FRONT) front++; else
                    if (res === BACK) back++;
                if (front > 0 && back > 0) return SPANNING

            }
            if (back == 0 && front > 0) return FRONT;
            if (back > 0 && front == 0) return BACK;
            return COPLANAR;



        }
    }

    ClassifySegment(v0, v1) {
        let r0 = this.Classify(v0);
        let r1 = this.Classify(v1);

        if (r1 === r0) return r0;
        if (r0 === PLANAR) return PLANAR;
        if (r1 === PLANAR) return PLANAR;
        return SPANNING;
    }

    SplitLine(a, b) {


        const aDot = a.dot(this.normal);
        const bDot = b.dot(this.normal);


        const denom = bDot - aDot;

        //if (Math.abs(denom) < 1e-6)
        //  return null; // parallel

        const t = (-this.D - aDot) / denom;


        let o = new Vector3(
            a.x + t * (b.x - a.x),
            a.y + t * (b.y - a.y),
            a.z + t * (b.z - a.z)
        );
        return o;
    }



    SplitList(v) {
        var front = new Array();
        var back = new Array();


        for (let i = 0; i < v.length; i++) {
            let i2 = (i + 1) % v.length;

            var a = this.Classify(v[i]);
            var b = this.Classify(v[i2]);

            if (a === FRONT) front.push(GetACopy(v[i]));
            if (a === BACK) back.push(GetACopy(v[i]));

            if (a === COPLANAR) {
                front.push(GetACopy(v[i]));
                back.push(GetACopy(v[i]));
                continue;
            }

            if ((a === FRONT && b === BACK) || (a === BACK && b === FRONT)) {
                var h = this.Split(v[i], v[i2]);
                back.push(h);
                front.push(GetACopy(h));
            }

        }

        return new Array(front, back);
    }



    GetAlignement() {
        var absNormal = new Vector3(this.normal);
        absNormal.abs();
        if (absNormal.x >= absNormal.y && absNormal.x >= absNormal.z) return XAXIS;
        if (absNormal.y >= absNormal.x && absNormal.y >= absNormal.z) return YAXIS;
        return ZAXIS;
    }

    SplitLineVec2(a, b) {
        let aDot = a.dot(this.normal);
        let bDot = b.dot(this.normal);
        let scaled = (((-this.D) - aDot)) / ((bDot - aDot))
        let rr = new Vector3(a.x + (scaled * (b.x - a.x)), a.y + (scaled * (b.y - a.y)), a.z + (scaled * (b.z - a.z)));

        return rr;
    }

    SplitLineVec3(a, b) {
        let aDot = a.dot(this.normal);
        let bDot = b.dot(this.normal);
        let scaled = (((-this.D) - aDot)) / ((bDot - aDot))
        let rr = new Vector3(a.x + (scaled * (b.x - a.x)), a.y + (scaled * (b.y - a.y)), a.z + (scaled * (b.z - a.z)));

        return rr;
    }

    SplitLineVert(a, b) {
        let aDot = a.world.dot(this.normal);
        let bDot = b.world.dot(this.normal);
        let scaled = ((-this.D) - aDot) / ((bDot - aDot));
        var v = new Vert();

        v._world = new Vector3(a.world.x + (scaled * (b.world.x - a.world.x)), a.world.y + (scaled * (b.world.y - a.world.y)), a.world.z + (scaled * (b.world.z - a.world.z)));
        v._color = new Vector3(a.color.x + (scaled * (b.color.x - a.color.x)), a.color.y + (scaled * (b.color.y - a.color.y)), a.color.z + (scaled * (b.color.z - a.color.z)));
        v._texture = new Vector2(a.texture.x + (scaled * (b.texture.x - a.texture.x)), v.texture.y = a.texture.y + (scaled * (b.texture.y - a.texture.y)));
        v._light_texture = new Vector2(a.light_texture.x + (scaled * (b.light_texture.x - a.light_texture.x)),
            a.light_texture.y + (scaled * (b.light_texture.y - a.light_texture.y)));

        return v;
    }


    SplitPolygon(a) {
        var v = this.Split(a.verts);


        var front = null;
        var back = null;


        if (v[0]) {
            front = new Polygon();
            front.CoppyAttribs(a, false);
            front.AddVerts(v[0]);
        }
        if (v[1]) {
            back = new Polygon();
            back.CoppyAttribs(a, false);
            back.AddVerts(v[1]);
        }
        return [front, back];




    }

    rayPlaneIntersection(origin, dir) {

        const denom =
            this.normal.x * dir.x +
            this.normal.y * dir.y +
            this.normal.z * dir.z;

        // Parallel
        if (Math.abs(denom) < 0.00001)
            return null;

        const numer =
            plane.D -
            (
                plane.normal.x * origin.x +
                plane.normal.y * origin.y +
                plane.normal.z * origin.z
            );

        const t = numer / denom;

        if (t < 0)
            return null;
        return t;
    }




    Split(a, b) {
        var aDot = 0.0;
        var bDot = 0.0;
        var scaled = 0.0;

        if (a instanceof Array) return this.SplitList(a);

        if (a instanceof Polygon) return this.SplitPolygon(a);

        if (a instanceof Vert) return this.SplitLineVert(a, b);

        return this.SplitLineVec2(a, b);

    }

}

function lineLineIntersection(A, B, C, D) {
    // Line AB represented as a1x + b1y = c1
    var a1 = B.y - A.y;
    var b1 = A.x - B.x;
    var c1 = a1 * (A.x) + b1 * (A.y);

    // Line CD represented as a2x + b2y = c2
    var a2 = D.y - C.y;
    var b2 = C.x - D.x;
    var c2 = a2 * (C.x) + b2 * (C.y);

    var determinant = a1 * b2 - a2 * b1;

    if (determinant == 0) {
        // The lines are parallel. This is simplified
        // by returning a pair of FLT_MAX
        return undefined; new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
    }
    else {
        var x = (b2 * c1 - b1 * c2) / determinant;
        var y = (a1 * c2 - a2 * c1) / determinant;
        return new Vector2(x, y);
    }
}


const EDGE_POINT_NOT_ON_EDGE = 0
const EDGE_POINT_ON_POINT = 1
const EDGE_POINT_ON_EDGE = 2

function PointOnEdge(a, b, p, epsilon = 1e-9) {
    if (p.Equal(a, epsilon) || p.Equal(b, epsilon)) return EDGE_POINT_ON_POINT;
    let la = a.sub(p).length();
    let lb = b.sub(p).length();


    if (la <= 0 || lb <= 0) return EDGE_POINT_ON_POINT;
    let ab = b.sub(a)
    let ap = p.sub(a)

    let crossVec = ap.cross(ab);
    let crossLenSq = crossVec.dot(crossVec);

    if (crossLenSq > epsilon * epsilon) return EDGE_POINT_NOT_ON_EDGE;
    const dotVal = ap.dot(ab);
    if (dotVal < 0) return EDGE_POINT_NOT_ON_EDGE;
    const abLenSq = ab.dot(ab);
    if (dotVal > abLenSq) return EDGE_POINT_NOT_ON_EDGE;
    return EDGE_POINT_ON_EDGE;
}
const EDGE_EDEG_ONE_POINT_ON_EDGE = -1;
const EDGE_EDEG_FAIELD = 0;
const EDGE_EDEG_CONGRUENT = 1;
const EDGE_EDEG_OVERLAP = 2;

function EdgeOnEdge(a1, b1, a2, b2) {
    let res0 = PointOnEndge(a1, b1, a2);
    let res1 = PointOnEndge(a1, b1, b2);
    let res2 = PointOnEndge(a2, b2, a1);
    let res3 = PointOnEndge(a2, b2, b1);

    if ((res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_ON_POINT) || (res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_ON_POINT)) return EDGE_EDEG_CONGRUENT;
    if ((res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_NOT_ON_EDGE) || (res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_NOT_ON_EDGE)) return EDGE_EDEG_FAIELD;


    if ((res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_NOT_ON_EDGE && res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_ON_POINT) ||     // 1 0 0 1
        (res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_ON_POINT && res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_NOT_ON_EDGE) ||     // 0 1 1 0
        (res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_NOT_ON_EDGE && res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_NOT_ON_EDGE) ||     // 1 0 1 0
        (res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_ON_POINT && res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_ON_POINT)        // 0 1 0 1

    ) return EDGE_EDEG_ONE_POINT_ON_EDGE;

    return EDGE_EDEG_OVERLAP;

}

function PointOnEdge2(point, edgeStart, edgeEnd, epsilon = 0.0001) {
    // Richtungsvektor der Edge
    const abx = edgeEnd.x - edgeStart.x;
    const aby = edgeEnd.y - edgeStart.y;
    const abz = edgeEnd.z - edgeStart.z;

    // Vektor vom Startpunkt zum Testpunkt
    const apx = point.x - edgeStart.x;
    const apy = point.y - edgeStart.y;
    const apz = point.z - edgeStart.z;

    // Länge der Edge quadriert
    const abLenSq =
        abx * abx +
        aby * aby +
        abz * abz;

    // Projektion von AP auf AB
    const t =
        (apx * abx +
            apy * aby +
            apz * abz) / abLenSq;

    // Wichtig:
    // Punkt darf NICHT auf Start- oder Endpunkt liegen
    if (t <= epsilon || t >= (1.0 - epsilon)) {
        console.log("Poin on Edge Start end")
        return false;
    }

    // Nächster Punkt auf der Edge
    const closestX = edgeStart.x + abx * t;
    const closestY = edgeStart.y + aby * t;
    const closestZ = edgeStart.z + abz * t;

    // Abstand Punkt -> Edge
    const dx = point.x - closestX;
    const dy = point.y - closestY;
    const dz = point.z - closestZ;

    const distSq =
        dx * dx +
        dy * dy +
        dz * dz;

    // Liegt Punkt nahe genug auf Edge?
    console.log(distSq < (epsilon * epsilon))
    return distSq < (epsilon * epsilon);
}
