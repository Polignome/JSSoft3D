

class AABB {
    constructor(a = undefined, b = undefined) {
        
        this._recalc=true;
        if (a instanceof Vector3 && b instanceof Vector3) {
            this._min = new Vector3(a);
            this._max = new Vector3(b);
            return;
        }


        this._min = new Vector3();
        this._max = new Vector3();
        this.reset();
         
        this.Add(a);



    }

    Add(a) {

        if (a instanceof Vector3) {
            const min = this._min;
            const max = this._max;

            if (a.x < min.x) this._min.x = a.x;
            if (a.y < min.y) this._min.y = a.y;
            if (a.z < min.z) this._min.z = a.z;

            if (a.x > max.x) this._max.x = a.x;
            if (a.y > max.y) this._max.y = a.y;
            if (a.z > max.z) this._max.z = a.z;
            
            
            return;
        }

        if (a instanceof Vert) {
            const min = this._min;
            const max = this._max;

            if (a.world.x < min.x) this._min.x = a.world.x;
            if (a.world.y < min.y) this._min.y = a.world.y;
            if (a.world.z < min.z) this._min.z = a.world.z;

            if (a.world.x > max.x) this._max.x = a.world.x;
            if (a.world.y > max.y) this._max.y = a.world.y;
            if (a.world.z > max.z) this._max.z = a.world.z;
            return;
        }

        if (a instanceof AABB) {
            this.Add(a._min);
            this.Add(a._max);
            return;
        }

        if (a instanceof Polygon) {
            this.Add(a.verts);
            
            return;
        }

        if (Array.isArray(a)) {
            for (let i = 0; i < a.length; i++) {
                this.Add(a[i]);
            }
            return;
        }
    }

 
    reset() {
        this._min.x =  Infinity;
        this._min.y =  Infinity;
        this._min.z =  Infinity;

        this._max.x = -Infinity;
        this._max.y = -Infinity;
        this._max.z = -Infinity;
    }

    valid() {
        return (this._min.x <= this._max.x) &&
               (this._min.y <= this._max.y) &&
               (this._min.z <= this._max.z);
    }

    center(out = new Vector3()) {
        out.x = (this._min.x + this._max.x) * 0.5;
        out.y = (this._min.y + this._max.y) * 0.5;
        out.z = (this._min.z + this._max.z) * 0.5;
        return out;
    }

    size(out = new Vector3()) {
        out.x = this._max.x - this._min.x;
        out.y = this._max.y - this._min.y;
        out.z = this._max.z - this._min.z;
        return out;
    }

    get min() { return new Vector3(this._min); }
    get max() { return new Vector3(this._max); }



    getAABBCorners() {
      const min = this.min;
      const max = this.max;

      return [
        new Vector3(min.x, min.y, min.z),
        new Vector3(max.x, min.y, min.z),
        new Vector3(min.x, max.y, min.z),
        new Vector3(max.x, max.y, min.z),

        new Vector3(min.x, min.y, max.z),
        new Vector3(max.x, min.y, max.z),
        new Vector3(min.x, max.y, max.z),
        new Vector3(max.x, max.y, max.z),
      ];
   }

projectAABBToScreen(xform, viewportWidth, viewportHeight) {

    const min = this.min;
    const max = this.max;

    // 8 Ecken (kein Heap-Alloc im Hotpath wäre noch optimierbar,
    // aber lassen wir es erstmal so für Klarheit)
    const corners = [
        [min.x, min.y, min.z],
        [max.x, min.y, min.z],
        [min.x, max.y, min.z],
        [max.x, max.y, min.z],
        [min.x, min.y, max.z],
        [max.x, min.y, max.z],
        [min.x, max.y, max.z],
        [max.x, max.y, max.z],
    ];

    let minX =  Infinity;
    let minY =  Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    let minDepth =  Infinity;
    let maxDepth = -Infinity;

    let anyValid = false;

    for (let i = 0; i < 8; i++) {

        const c = corners[i];

        // ---- World → Clip ----
        const v = new Vector3(c[0], c[1], c[2]);
        const clip = xform.concat(v);   // -> Vector4

        const w = clip.w;
        if (w <= 1e-6) continue;        // hinter Kamera

        const invW = 1.0 / w;

        const ndcX = clip.x * invW;
        const ndcY = clip.y * invW;
        const ndcZ = clip.z * invW;

        // ---- Depth immer sammeln! ----
        minDepth = Math.min(minDepth, ndcZ);
        maxDepth = Math.max(maxDepth, ndcZ);

        // ---- Screen nur wenn sinnvoll ----
        const sx = (ndcX * 0.5 + 0.5) * viewportWidth;
        const sy = (1.0 - (ndcY * 0.5 + 0.5)) * viewportHeight;

        minX = Math.min(minX, sx);
        minY = Math.min(minY, sy);
        maxX = Math.max(maxX, sx);
        maxY = Math.max(maxY, sy);

        anyValid = true;
    }

    if (!anyValid) return null;

    // ---- konservativ aufblasen (gegen Löcher) ----
    minX = Math.floor(minX) - 1;
    minY = Math.floor(minY) - 1;
    maxX = Math.ceil (maxX) + 1;
    maxY = Math.ceil (maxY) + 1;

    // ---- Clamp auf Viewport ----
    minX = Math.max(0, Math.min(viewportWidth  - 1, minX));
    maxX = Math.max(0, Math.min(viewportWidth  - 1, maxX));
    minY = Math.max(0, Math.min(viewportHeight - 1, minY));
    maxY = Math.max(0, Math.min(viewportHeight - 1, maxY));

    if (minX > maxX || minY > maxY) return null;

    return {
        minX, minY,
        maxX, maxY,
        minDepth,
        maxDepth
    };
}


/*
 projectAABBToScreen(xform, viewportWidth, viewportHeight) {

    const min = this.min;
    const max = this.max;

    // 8 Ecken direkt lokal erzeugen (kein Array-Alloc im Hotpath)
    const corners = [
        [min.x, min.y, min.z],
        [max.x, min.y, min.z],
        [min.x, max.y, min.z],
        [max.x, max.y, min.z],
        [min.x, min.y, max.z],
        [max.x, min.y, max.z],
        [min.x, max.y, max.z],
        [max.x, max.y, max.z],
    ];

    let minX =  Infinity;
    let minY =  Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minDepth =  Infinity;

    let anyValid = false;

    for (let i = 0; i < 8; i++) {

        const c = corners[i];

        // ---- World → Clip ----
        const v = new Vector3(c[0], c[1], c[2]);
        const clip = xform.concat(v);   // -> Vector4

        const w = clip.w;
        if (w <= 0.00001) continue;      // hinter Kamera / ungültig

        const invW = 1.0 / w;

        const ndcX = clip.x * invW;
        const ndcY = clip.y * invW;
        const ndcZ = clip.z * invW;

        // ---- NDC → Screen ----
        const sx = (ndcX * 0.5 + 0.5) * viewportWidth;
        const sy = (1.0 - (ndcY * 0.5 + 0.5)) * viewportHeight;

        minX = Math.min(minX, sx);
        minY = Math.min(minY, sy);
        maxX = Math.max(maxX, sx);
        maxY = Math.max(maxY, sy);
        minDepth = Math.min(minDepth, ndcZ);

        anyValid = true;
    }

    if (!anyValid) return null;

    // Clamp auf Viewport (optional aber praktisch)
    minX = Math.max(0, Math.min(viewportWidth  - 1, minX));
    maxX = Math.max(0, Math.min(viewportWidth  - 1, maxX));
    minY = Math.max(0, Math.min(viewportHeight - 1, minY));
    maxY = Math.max(0, Math.min(viewportHeight - 1, maxY));

    
    if (minX > maxX || minY > maxY) return null;

    return {
        minX, minY,
        maxX, maxY,
        minDepth
    };
}
*/
}


