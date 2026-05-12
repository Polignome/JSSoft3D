class Wad3File {
    constructor(arrayBuffer) {
        this.buffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
        this.entries = [];

        this._readHeader();
        this._readDirectory();
    }

    _readString(offset, length) {
        let out = "";

        for (let i = 0; i < length; i++) {
            const c = this.view.getUint8(offset + i);

            if (c === 0)
                break;

            out += String.fromCharCode(c);
        }

        return out;
    }

    _readHeader() {
        const magic = this._readString(0, 4);

        if (magic !== "WAD3") {
            throw new Error("Keine gültige WAD3-Datei");
        }

        this.numEntries = this.view.getInt32(4, true);
        this.dirOffset  = this.view.getInt32(8, true);
    }

    _readDirectory() {
        const ENTRY_SIZE = 32;

        for (let i = 0; i < this.numEntries; i++) {
            const off = this.dirOffset + i * ENTRY_SIZE;

            const filePos       = this.view.getInt32(off + 0, true);
            const diskSize      = this.view.getInt32(off + 4, true);
            const size          = this.view.getInt32(off + 8, true);
            const type          = this.view.getUint8(off + 12);
            const compression   = this.view.getUint8(off + 13);
            const name          = this._readString(off + 16, 16);

            this.entries.push({
                filePos,
                diskSize,
                size,
                type,
                compression,
                name
            });
        }
    }

    getTextureNames() {
        return this.entries.map(e => e.name);
    }

    findEntry(name) {
        return this.entries.find(e =>
            e.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Liest eine MipTex-Textur aus der WAD3-Datei.
     *
     * Rückgabe:
     * {
     *   width,
     *   height,
     *   pixels: Int32Array
     * }
     */
    getTexture(name) {
        const entry = this.findEntry(name);

        if (!entry) {
            throw new Error(`Textur nicht gefunden: ${name}`);
        }

        const base = entry.filePos;

        const texName = this._readString(base + 0, 16);
        const width   = this.view.getUint32(base + 16, true);
        const height  = this.view.getUint32(base + 20, true);

        const mip0Offset = this.view.getUint32(base + 24, true);

        const pixelOffset = base + mip0Offset;
        const pixelCount  = width * height;

        const indices = new Uint8Array(
            this.buffer,
            pixelOffset,
            pixelCount
        );

        // Palette sitzt hinter allen 4 Mip-Leveln
        const mip1Size = (width >> 1) * (height >> 1);
        const mip2Size = (width >> 2) * (height >> 2);
        const mip3Size = (width >> 3) * (height >> 3);

        const paletteOffset =
            pixelOffset +
            pixelCount +
            mip1Size +
            mip2Size +
            mip3Size +
            2;

        const rgba = new Int32Array(pixelCount);

        for (let i = 0; i < pixelCount; i++) {
            const idx = indices[i];

            const r = this.view.getUint8(paletteOffset + idx * 3 + 0);
            const g = this.view.getUint8(paletteOffset + idx * 3 + 1);
            const b = this.view.getUint8(paletteOffset + idx * 3 + 2);

            // Quake/HL transparent blue handling
            let a = 255;

            // Viele WAD3-Texturen verwenden Index 255 als transparent
            if (idx === 255 && texName.startsWith("{")) {
                a = 0;
            }

            rgba[i] =
                (a << 24) |
                (b << 16) |
                (g << 8)  |
                r;
        }

        return {
            name: texName,
            width,
            height,
            pixels: rgba
        };
    }
}
