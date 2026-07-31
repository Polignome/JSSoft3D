


class LightMapPartitionLeaf {
    constructor(rect, ushift, vshift, uscale, vscale) {
        this.rect = new Rect(rect.left, rect.top, rect.right, rect.bottom)
        this.ushift = ushift;
        this.vshift = vshift;
        this.uscale = uscale;
        this.vscale = vscale;

        this.id = -1;
    }
}


class LightMapPartitionMode {
    constructor(rect) {
        this.node0 = null;
        this.node1 = null;
        this.leaf = null;
        this.rect = new Rect(rect.left, rect.top, rect.right, rect.bottom)
        this.uv = new Rect(0, 0, 0, 0);
    }

    Build(width, height, tree) {


        if (this.node0 && this.node1) {
            let result = this.node0.Build(width, height, tree)
            if (result) return result;
            return this.node1.Build(width, height, tree)
        }

        if (this.leaf || width > this.rect.width || height > this.rect.height) return null;
        if (width > this.rect.width || height > this.rect.height) return null;

        if (width === this.rect.width && height === this.rect.height) {
            let help_space = 1;

            let u0 = (this.rect.left + help_space) / (tree.width - help_space)
            let v0 = (this.rect.top + help_space) / (tree.height - help_space)
            let u1 = (this.rect.right - help_space) / (tree.width - help_space)
            let v1 = (this.rect.bottom - help_space) / (tree.height - help_space)

            this.leaf = new LightMapPartitionLeaf(this.rect, u0, v0, u1 - u0, v1 - v0);
            this.leaf.id = tree.leafs.length;


            tree.leafs.push(this.leaf);
            return this.leaf;
        }


        let dw = this.rect.width - width;
        let dh = this.rect.height - height;

        if (dw > dh) {
            this.node0 = new LightMapPartitionMode(new Rect(this.rect.left, this.rect.top, this.rect.left + width, this.rect.bottom));
            this.node1 = new LightMapPartitionMode(new Rect(this.rect.left + width, this.rect.top, this.rect.right, this.rect.bottom));

        } else {
            this.node0 = new LightMapPartitionMode(new Rect(this.rect.left, this.rect.top, this.rect.right, this.rect.top + height));
            this.node1 = new LightMapPartitionMode(new Rect(this.rect.left, this.rect.top + height, this.rect.right, this.rect.bottom));
        }

        return this.node0.Build(width, height, tree);
    }
}


class BigLightMap extends Canvas {
    constructor(name, width, height) {
        super(name, width, height, 1)
        this.rec = new Rect(0, 0, width, height);
        this.root = new LightMapPartitionMode(this.rec);
        this._width = width;
        this._height = height;
        this.leafs = [];
    }

    convertToPot(n, max_texture_scale) {
        if (n < 16 && max_texture_scale >= 16) return 16;
        if (n < 32 && max_texture_scale >= 32) return 32;
        if (n < 64 && max_texture_scale >= 64) return 64;
        if (n < 128 && max_texture_scale >= 128) return 128;
        if (n < 256 && max_texture_scale >= 256) return 256;
        return max_texture_scale;
    }



    ProcessPoly(source, polygons = null, light_sources) {
        for (let light of light_sources) {
            let w = light.color.w * light.color.w;
            for (let ix = 0; ix < source._light_map_width; ix++) {
                for (let iy = 0; iy < source._light_map_height; iy++) {
                    let ufactor = (ix / (source._light_map_width));
                    let vfactor = (iy / (source._light_map_height));

                    let newedge1 = source.edge1.mul(ufactor);
                    let newedge2 = source.edge2.mul(vfactor);
                    let lumel = source.uvvector.add(newedge1.add(newedge2));

                    let dir = lumel.sub(light.pos)
                    let dist = dir.length();
                    //  if (dist > w || source.plane.Classify(light.pos) === BACK) continue;

                    let hit = true;;
                    /*    for (let p of polygons) {
    
                            if (p === source) continue;
                            //if (p.plane.Classify(light.pos) === BACK) continue;
                            let r = p.RayPolygonDistance(lumel, light.pos);
                            if (r === -1) continue;
                            if (r < dist) { hit = false; break; }
                        }
                        if (!hit) continue;
    */

                    dist = 255 - Math.min(dist, 255)

                    //  dist = Math.max(0, Math.exp(-dist / (w >> 3))) * 255
                    //dist = dist;
                    //let color = RGB((dist) | 0, (dist) | 0, (dist) | 0)
                    this.PutPixel(source._light_map_posx + ix, source._light_map_posy + iy, color);


                }
            }
        }
    }




    CalcLightmap(polygons, lights, max_texture_scale = 64 * 2) {
        let maxw = -Infinity;
        let maxh = -Infinity;
        this.rec = new Rect(0, 0, this._width, this._height);
        this.root = new LightMapPartitionMode(this.rec);
        this.leafs = [];
        for (let p of polygons) {
            let uv = p.Get2DBBox();
            let tw = uv.width();
            let th = uv.height();

            if (tw > maxw) maxw = tw;
            if (th > maxh) maxh = th;

        }

        const sw = max_texture_scale / maxw;
        const sh = max_texture_scale / maxh;


        for (let p of polygons) {
            let uv = p.Get2DBBox();
            let tw = uv.width();
            let th = uv.height();



            let lw = this.convertToPot(tw * sw, max_texture_scale);
            let lh = this.convertToPot(th * sh, max_texture_scale);

            let leaf = this.root.Build(lw, lh, this);

            if (!leaf) {
                break;
            }
            p._light_map_posx = leaf.rect.left;
            p._light_map_posy = leaf.rect.top;
            p._light_map_width = leaf.rect.width;
            p._light_map_height = leaf.rect.height;

            p.setPlanarLightTexture(0, 0, 1, 1);/*leaf.ushift, leaf.vshift, leaf.uscale, leaf.vscale);*/
            p.CalcLightMapParm();




            p._ltexture = this;

            for (let x = 0; x < p._light_map_width; x++) {
                for (let y = 0; y < p._light_map_height; y++) {
                    this.PutPixel(p._light_map_posx + x, p._light_map_posy + y, RGB(0, 0, 0));

                }
            }

            let x0 = p._light_map_posx
            let y0 = p._light_map_posy
            let x1 = p._light_map_posx + p._light_map_width
            let y1 = p._light_map_posy + p._light_map_height

            this.ProcessPoly(p, polygons, lights)

            // this.DrawRec(x0, y0, x0 + 5, y0 + 5, RGB(255, 255, 0))
            // this.DrawRec(x1 - 5, y1 - 5, x1 - 1, y1 - 1, RGB(255, 255, 255))


            //    this.DrawLine(x0, y0, x1, y1, RGB(255, 255, 0))
            //    this.DrawLine(x0, y1, x1, y0, RGB(255, 255, 0))
        }



    }

}