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

        // Ray aus zwei Vector3 (Ursprung, Richtung/Endpunkt)
        if (N instanceof Vector3 && M instanceof Vector3) {
            this._N = 3; // FIX: _N muss gesetzt werden, sonst brechen alle Setter
            this.calc(N, M);
            return;
        }

        // Copy-Konstruktor
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
            this._dCalculated = N.dCalculated;
            this._lCalculated = N.lCalculated;
            this._nCalculated = N.nCalculated;
            return;
        }

        // Dimension als Zahl (2, 3, 4)
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
        this._vector = new Vector3(v);

        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
    }

    get N() { return this._N; }
    get origin() { return this._origin; }
    get vector() { return this._vector; }
    get length() {
        if (!this._lCalculated) {
            this._length = this.vector.length();
            this._lCalculated = true;
        }
        return this._length;
    }
    get nCalculated() { return this._nCalculated; }
    get lCalculated() { return this._lCalculated; }
    get dCalculated() { return this._dCalculated; }

    get normal() {
        if (!this._nCalculated) { // FIX: war this.nCalculated (funktionierte zufällig, aber inkonsistent)
            this._normal = new Vector3(this._vector);
            this._normal.normalize();
            this._nCalculated = true;
        }
        return this._normal;
    }

    get D() {
        if (!this._dCalculated) {
            this._D = -(this.origin.dot(this.normal));
            this._dCalculated = true;
        }
        return this._D;
    }

    set origin(a) {
        this._dCalculated = false;
        if (this._N == 2) { this._origin = new Vector2(a); return; }
        if (this._N == 3) { this._origin = new Vector3(a); return; }
        if (this._N == 4) { this._origin = new Vector4(a); return; }
        throw new Error("Ray.origin: this._N ist nicht gesetzt (2/3/4)"); // FIX: statt stillem No-Op
    }

    set vector(a) {
        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
        if (this._N == 2) { this._vector = new Vector2(a); return; }
        if (this._N == 3) { this._vector = new Vector3(a); return; }
        if (this._N == 4) { this._vector = new Vector4(a); return; }
        throw new Error("Ray.vector: this._N ist nicht gesetzt (2/3/4)");
    }

    set normal(a) {
        this._nCalculated = true; // FIX: manuell gesetzte Normal soll nicht überschrieben werden
        if (this._N == 2) { this._normal = new Vector2(a); return; }
        if (this._N == 3) { this._normal = new Vector3(a); return; }
        if (this._N == 4) { this._normal = new Vector4(a); return; }
        throw new Error("Ray.normal: this._N ist nicht gesetzt (2/3/4)");
    }

    set length(len) {
        if (this._nCalculated) this.vector = this.normal.mul(len); // FIX: "normal" statt undefined "normal"
        else this._vector.setLength(len);

        this._length = len;
        this._lCalculated = true;
    }

    invert() {
        this.calc(this.origin, this.vector);
    }

    flush() {
        this._nCalculated = false;
        this._lCalculated = false;
        this._dCalculated = false;
    }

    static MakeEdgePlane(v0, v1, polygonNormal) {
        const edge = v1.sub(v0);
        let n = edge.cross(polygonNormal);

        const len = n.length();
        if (len > 0.000001) n = n.mul(1.0 / len);

        return Ray.FromPointNormal(v0, n);
    }

    static FromPointNormal(point, normal) {
        const r = new Ray(3);
        r.origin = point;
        r.vector = normal;
        r.normal = normal; // fixiert normal + setzt _nCalculated=true (s.o.)

        r._D = -(r.normal.x * point.x + r.normal.y * point.y + r.normal.z * point.z);
        r._dCalculated = true;

        return r;
    }

    static CalcPlaneBy3Vectors(a, b, c, counterClock = false) {
        var v0 = b.sub(a);
        var v1 = c.sub(b);
        var ray = new Ray(3); // FIX: war new Ray() -> N=3 Default, aber explizit ist sicherer
        var v3 = v1.cross(v0);
        if (!counterClock) v3 = v3.mul(-1);
        ray.origin = a;
        ray.vector = v3;
        return ray;
    }

    toStr() {
        return "N: " + this.N + "\n" + "D: " + this.D + "\n";
    }

    // Abstand eines Punktes zur Ebene (entlang der Ebenen-Normalen)
    distance(point) {
        const denom = this.normal.dot(this.normal); // = 1, da normal normalisiert ist
        const numer = this.normal.dot(point) + this.D;
        return numer / denom;
    }

    // Schnittpunkt-Parameter t zweier Ray/Plane-Objekte entlang r.normal
    // Rückgabe: [true, t] bei Erfolg, [false, 0] bei Parallelität
    intersect(r) {
        const denom = this.normal.dot(r.normal);
        if (denom === 0) return -1

        const numer = this.normal.dot(r.origin);
        const t = -((numer + this.D) / denom);
        return t;
    }



    closest(point) {
        const t = this.distance(point);
        return point.sub(this.normal.mul(t)); // FIX: this.normal statt this.normal()
    }

    end(len = undefined) {
        if (len === undefined) return this.origin.add(this.vector);
        return this.origin.add(this.normal.mul(len));
    }

    rayPlaneIntersection(origin, dir) {
        const denom = this.normal.x * dir.x + this.normal.y * dir.y + this.normal.z * dir.z;
        if (Math.abs(denom) < 0.00001) return null; // parallel

        const numer = this.D - (this.normal.x * origin.x + this.normal.y * origin.y + this.normal.z * origin.z); // FIX: "plane" -> "this"
        const t = numer / denom;

        if (t < 0) return null;
        return t;
    }

    Classify(v) {
        if (v instanceof Polygon) return this.Classify(v.verts);
        if (v instanceof Portal) return this.Classify(v.verts);

        if (v instanceof Vector3) {
            const dir = this.origin.sub(v);
            const e = dir.dot(this.normal);
            if (e < 0) return FRONT;
            if (e > 0) return BACK;
            return COPLANAR;
        }
        if (v instanceof Vert) {
            const dir = this.origin.sub(v.world);
            const e = dir.dot(this.normal);
            if (e < 0) return FRONT;
            if (e > 0) return BACK;
            return COPLANAR;
        }

        if (v instanceof Array) {
            let front = 0, back = 0;
            for (let i = 0; i < v.length; i++) {
                const res = this.Classify(v[i]);
                if (res === FRONT) front++;
                else if (res === BACK) back++;
                if (front > 0 && back > 0) return SPANNING;
            }
            if (back == 0 && front > 0) return FRONT;
            if (back > 0 && front == 0) return BACK;
            return COPLANAR;
        }
    }

    ClassifySegment(v0, v1) {
        const r0 = this.Classify(v0);
        const r1 = this.Classify(v1);

        if (r1 === r0) return r0;
        if (r0 === COPLANAR) return r1; // FIX: war PLANAR (undefined)
        if (r1 === COPLANAR) return r0; // FIX: war PLANAR (undefined)
        return SPANNING;
    }

    SplitLineVec3(a, b) {
        const aDot = a.dot(this.normal);
        const bDot = b.dot(this.normal);
        const scaled = (-this.D - aDot) / (bDot - aDot);
        return new Vector3(
            a.x + scaled * (b.x - a.x),
            a.y + scaled * (b.y - a.y),
            a.z + scaled * (b.z - a.z)
        );
    }

    SplitLineVert(a, b) {
        const aDot = a.world.dot(this.normal);
        const bDot = b.world.dot(this.normal);
        const scaled = (-this.D - aDot) / (bDot - aDot);
        const v = new Vert();

        v._world = new Vector3(
            a.world.x + scaled * (b.world.x - a.world.x),
            a.world.y + scaled * (b.world.y - a.world.y),
            a.world.z + scaled * (b.world.z - a.world.z)
        );
        v._color = new Vector3(
            a.color.x + scaled * (b.color.x - a.color.x),
            a.color.y + scaled * (b.color.y - a.color.y),
            a.color.z + scaled * (b.color.z - a.color.z)
        );
        v._texture = new Vector2(
            a.texture.x + scaled * (b.texture.x - a.texture.x),
            a.texture.y + scaled * (b.texture.y - a.texture.y)
        ); // FIX: keine Seiteneffekt-Zuweisung mehr im Constructor-Argument
        v._light_texture = new Vector2(
            a.light_texture.x + scaled * (b.light_texture.x - a.light_texture.x),
            a.light_texture.y + scaled * (b.light_texture.y - a.light_texture.y)
        ); // FIX: dito

        return v;
    }

    SplitList(v) {
        const front = [];
        const back = [];

        for (let i = 0; i < v.length; i++) {
            const i2 = (i + 1) % v.length;
            const a = this.Classify(v[i]);
            const b = this.Classify(v[i2]);

            if (a === FRONT) front.push(GetACopy(v[i]));
            if (a === BACK) back.push(GetACopy(v[i]));
            if (a === COPLANAR) {
                front.push(GetACopy(v[i]));
                back.push(GetACopy(v[i]));
                continue;
            }

            if ((a === FRONT && b === BACK) || (a === BACK && b === FRONT)) {
                const h = this.Split(v[i], v[i2]);
                back.push(h);
                front.push(GetACopy(h));
            }
        }

        return [front, back];
    }

    SplitPolygon(a) {
        const v = this.Split(a.verts);

        let front = null;
        let back = null;

        if (v[0] && v[0].length) {
            front = new Polygon();
            front.CoppyAttribs(a, false);
            front.AddVerts(v[0]);
        }
        if (v[1] && v[1].length) {
            back = new Polygon();
            back.CoppyAttribs(a, false);
            back.AddVerts(v[1]);
        }
        return [front, back];
    }

    GetAlignement() {
        const absNormal = new Vector3(this.normal);
        absNormal.abs();
        if (absNormal.x >= absNormal.y && absNormal.x >= absNormal.z) return XAXIS;
        if (absNormal.y >= absNormal.x && absNormal.y >= absNormal.z) return YAXIS;
        return ZAXIS;
    }

    Split(a, b) {
        if (a instanceof Array) return this.SplitList(a);
        if (a instanceof Polygon) return this.SplitPolygon(a);
        if (a instanceof Vert) return this.SplitLineVert(a, b);
        return this.SplitLineVec3(a, b); // FIX: "SplitLineVec2" existierte nicht (nur SplitLineVec3, identisch zu Vec2)
    }
}

function lineLineIntersection(A, B, C, D) {
    const a1 = B.y - A.y;
    const b1 = A.x - B.x;
    const c1 = a1 * A.x + b1 * A.y;

    const a2 = D.y - C.y;
    const b2 = C.x - D.x;
    const c2 = a2 * C.x + b2 * C.y;

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) return undefined; // Linien parallel

    const x = (b2 * c1 - b1 * c2) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;
    return new Vector2(x, y); // FIX: kein "| 0" mehr, das hat Nachkommastellen gekillt
}

const EDGE_POINT_NOT_ON_EDGE = 0;
const EDGE_POINT_ON_POINT = 1;
const EDGE_POINT_ON_EDGE = 2;

function PointOnEdge(a, b, p, epsilon = 1e-9) {
    if (p.Equal(a, epsilon) || p.Equal(b, epsilon)) return EDGE_POINT_ON_POINT;

    const la = a.sub(p).length();
    const lb = b.sub(p).length();
    if (la <= 0 || lb <= 0) return EDGE_POINT_ON_POINT;

    const ab = b.sub(a);
    const ap = p.sub(a);

    const crossVec = ap.cross(ab);
    const crossLenSq = crossVec.dot(crossVec);
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
    const res0 = PointOnEdge(a1, b1, a2); // FIX: war PointOnEndge (Tippfehler, existierte nicht)
    const res1 = PointOnEdge(a1, b1, b2);
    const res2 = PointOnEdge(a2, b2, a1);
    const res3 = PointOnEdge(a2, b2, b1);

    if ((res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_ON_POINT) ||
        (res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_ON_POINT)) return EDGE_EDEG_CONGRUENT;

    if ((res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_NOT_ON_EDGE) ||
        (res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_NOT_ON_EDGE)) return EDGE_EDEG_FAIELD;

    if ((res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_NOT_ON_EDGE && res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_ON_POINT) ||
        (res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_ON_POINT && res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_NOT_ON_EDGE) ||
        (res0 === EDGE_POINT_ON_POINT && res1 === EDGE_POINT_NOT_ON_EDGE && res2 === EDGE_POINT_ON_POINT && res3 === EDGE_POINT_NOT_ON_EDGE) ||
        (res0 === EDGE_POINT_NOT_ON_EDGE && res1 === EDGE_POINT_ON_POINT && res2 === EDGE_POINT_NOT_ON_EDGE && res3 === EDGE_POINT_ON_POINT)
    ) return EDGE_EDEG_ONE_POINT_ON_EDGE;

    return EDGE_EDEG_OVERLAP;
}

function PointOnEdge2(point, edgeStart, edgeEnd, epsilon = 0.0001) {
    const abx = edgeEnd.x - edgeStart.x;
    const aby = edgeEnd.y - edgeStart.y;
    const abz = edgeEnd.z - edgeStart.z;

    const apx = point.x - edgeStart.x;
    const apy = point.y - edgeStart.y;
    const apz = point.z - edgeStart.z;

    const abLenSq = abx * abx + aby * aby + abz * abz;
    const t = (apx * abx + apy * aby + apz * abz) / abLenSq;

    if (t <= epsilon || t >= (1.0 - epsilon)) return false;

    const closestX = edgeStart.x + abx * t;
    const closestY = edgeStart.y + aby * t;
    const closestZ = edgeStart.z + abz * t;

    const dx = point.x - closestX;
    const dy = point.y - closestY;
    const dz = point.z - closestZ;

    const distSq = dx * dx + dy * dy + dz * dz;
    return distSq < (epsilon * epsilon);
}
