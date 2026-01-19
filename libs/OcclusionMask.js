const TILE_SHIFT = 5;           // 2^5 = 32 Pixel pro Tile
const TILE_SIZE  = 1 << TILE_SHIFT;



class OcclusionMask {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.clear();
    }

    clear() {
        // Für jeden Pixel speichern wir die maximale Tiefe (minDepth)
        this.buffer = new Float32Array(this.width * this.height);
        for(let i=0; i<this.buffer.length; i++) this.buffer[i] = Infinity;
    }

    _index(x, y) { return y * this.width + x; }

    // Testet, ob ein Rechteck komplett verdeckt ist
    isOccludedRect(minX, maxX, minY, maxY, depth) {
        
        minX = Math.max(0, minX); maxX = Math.min(this.width-1, maxX);
        minY = Math.max(0, minY); maxY = Math.min(this.height-1, maxY);

        for(let y=minY; y<=maxY; y++) {
            for(let x=minX; x<=maxX; x++) {
                if(depth < this.buffer[this._index(x,y)]) {
                    // Mindestens ein Pixel ist vorne → sichtbar
                    return false;
                }
            }
        }
        return true; // alles verdeckt
    }

    // Markiert ein Rechteck als Occluder
    markRect(minX, maxX, minY, maxY, depth) {
        minX = Math.max(0, minX); maxX = Math.min(this.width-1, maxX);
        minY = Math.max(0, minY); maxY = Math.min(this.height-1, maxY);

        for(let y=minY; y<=maxY; y++) {
            for(let x=minX; x<=maxX; x++) {
                this.buffer[this._index(x,y)] = Math.min(this.buffer[this._index(x,y)], depth);
            }
        }
    }
}

/*

class OcclusionMask {

    constructor(width=0, height=0) {

        this.resize(width, height);
    }

    resize(width, height) {
        this.width  = width;
        this.height = height;

        this.tilesX = (width  + TILE_SIZE - 1) >> TILE_SHIFT;
        this.tilesY = (height + TILE_SIZE - 1) >> TILE_SHIFT;

        this.wordsPerRow = (this.tilesX + 31) >> 5;   // 32 Bits pro Word
        this.mask = new Uint32Array(this.tilesY * this.wordsPerRow);
    }

    clear() {
        this.mask.fill(0);
    }

    // ----------------------------------------
    // Test: ist Rechteck vollständig verdeckt?
    // Eingabe in PIXEL-Koordinaten
    // ----------------------------------------
    isOccludedRect(minX, maxX, minY, maxY) {

        minX |= 0; maxX |= 0;
        minY |= 0; maxY |= 0;

        if (minX < 0) minX = 0;
        if (minY < 0) minY = 0;
        if (maxX >= this.width)  maxX = this.width  - 1;
        if (maxY >= this.height) maxY = this.height - 1;

        const tx0 = minX >> TILE_SHIFT;
        const tx1 = maxX >> TILE_SHIFT;
        const ty0 = minY >> TILE_SHIFT;
        const ty1 = maxY >> TILE_SHIFT;

        for (let ty = ty0; ty <= ty1; ty++) {

            const row = ty * this.wordsPerRow;

            let tx = tx0;
            while (tx <= tx1) {

                const wordIndex = row + (tx >> 5);
                const bitIndex  = tx & 31;

                const run = Math.min(32 - bitIndex, tx1 - tx + 1);
                const maskBits = ((1 << run) - 1) << bitIndex;

                if ((this.mask[wordIndex] & maskBits) !== maskBits) {
                    return false;   // irgendwo noch offen
                }

                tx += run;
            }
        }

        return true; // komplett verdeckt
    }

    // ----------------------------------------
    // Markieren: Rechteck als verdeckt setzen
    // Eingabe in PIXEL-Koordinaten
    // ----------------------------------------
    markRect(minX, maxX, minY, maxY) {

        minX |= 0; maxX |= 0;
        minY |= 0; maxY |= 0;

        if (minX < 0) minX = 0;
        if (minY < 0) minY = 0;
        if (maxX >= this.width)  maxX = this.width  - 1;
        if (maxY >= this.height) maxY = this.height - 1;

        const tx0 = minX >> TILE_SHIFT;
        const tx1 = maxX >> TILE_SHIFT;
        const ty0 = minY >> TILE_SHIFT;
        const ty1 = maxY >> TILE_SHIFT;

        for (let ty = ty0; ty <= ty1; ty++) {

            const row = ty * this.wordsPerRow;

            for (let tx = tx0; tx <= tx1; tx++) {
                const index = row + (tx >> 5);
                this.mask[index] |= (1 << (tx & 31));
            }
        }
    }
}
*/