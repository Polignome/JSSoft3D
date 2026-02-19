const MAX_HZB_LEVEL = 3; 

class HierarchicalZBuffer {
    constructor(width, height) {
        this.levels = [];
        this.help= [];
        this.buildEmpty(width, height);
        this.ww=0;
        this.hh=0;
    }

    buildEmpty(width, height) {
        this.levels = [];
        let w = width;
        let h = height;
        this.help=new Uint32Array(width*height);
        this.help.fill(RGBA(0,0,0,255));
        this.ww=width;
        this.hh=height;

        while (true) {
            this.levels.push({
                w, h,
                z: new Float32Array(w * h)
            });

            if (w === 1 && h === 1) break;
            w = Math.max(1, w >> 1);
            h = Math.max(1, h >> 1);
        }
    }

    // Level 0 mit echtem Z-Buffer füllen
    setBaseLevel(zbuffer) {
        this.levels[0].z.set(zbuffer);
        this.help.fill(RGBA(0,0,0,255));
    }

    // Mip-Kette aufbauen
    build() {
        for (let l = 1; l < this.levels.length; l++) {
            const prev = this.levels[l - 1];
            const cur  = this.levels[l];

            for (let y = 0; y < cur.h; y++) {
                for (let x = 0; x < cur.w; x++) {

                    const x0 = x * 2;
                    const y0 = y * 2;

                    let minZ = Infinity;

                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            const px = x0 + dx;
                            const py = y0 + dy;
                            if (px < prev.w && py < prev.h) {
                                const idx = py * prev.w + px;
                                minZ = Math.min(minZ, prev.z[idx]);
                            }
                        }
                    }

                    cur.z[y * cur.w + x] = minZ;
                }
            }
        }
    }


isOccludedRect(minX, maxX, minY, maxY, depth) {

for (let level = Math.min(MAX_HZB_LEVEL, this.levels.length - 1);level >= 0; level--) 
 //   for (let level = this.levels.length - 3; level >= 0; level--) 
//let level=0
{

        const L = this.levels[level];
        const scale = 1 << level;

        const x0 = Math.floor(minX / scale);
        const x1 = Math.floor(maxX / scale);
        const y0 = Math.floor(minY / scale);
        const y1 = Math.floor(maxY / scale);

            let w = this.levels[0].w 


        {
            let centerX=(x0+(x1-x0)/2)|0;
            let centerY=(y0+(y1-x0)/2)|0;
          
            let i0 = centerY * L.w + centerX;
            let i1 = x0 + L.w * y0;
            let i2 = x1 + L.w * y0;
            let i3 = x1 + L.w * y1;
            let i4 = x0 + L.w * y1;


/*    Nur zur Visualisierung und Debuggin gedacht
            let j0 = centerY * w + centerX;
            let j1 = x0 + w * y0;
            let j2 = x1 + w * y0;
            let j3 = x1 + w * y1;
            let j4 = x0 + w * y1;


            if (depth > L.z[i0]) this.help[j0]=RGB(0,255,0); else this.help[j0]=RGB(255,0,0);
            if (depth > L.z[i1]) this.help[j1]=RGB(0,255,0); else this.help[j1]=RGB(255,0,0);
            if (depth > L.z[i2]) this.help[j2]=RGB(0,255,0); else this.help[j2]=RGB(255,0,0);
            if (depth > L.z[i3]) this.help[j3]=RGB(0,255,0); else this.help[j3]=RGB(255,0,0);
            if (depth > L.z[i4]) this.help[j4]=RGB(0,255,0); else this.help[j4]=RGB(255,0,0);
*/


            if (depth > L.z[i0]) return false;
            if (depth > L.z[i1]) return false;
            if (depth > L.z[i2]) return false;
            if (depth > L.z[i3]) return false;
            if (depth > L.z[i4]) return false;
          
        }           

        let fullyCovered = true;

        for (let y = y0; y <= y1 && fullyCovered; y++) {
            for (let x = x0; x <= x1; x++) {
                const idx = y * L.w + x;
                
                

                // Wenn irgendwo noch Platz vor dem Occluder ist → sichtbar
                if (depth > L.z[idx]) {
                    fullyCovered = false;
               //     this.help[y*w+x]=RGB(0,255,0);
                    break;
                } //else this.help[y*w+x]=RGB(255,0,0);
            }
        }

        // Wenn dieses Level schon komplett verdeckt ist → fertig
        if (fullyCovered) return true;
    }

    return false;
}



}



