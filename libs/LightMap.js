


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


    LightFalloff(distance, radius) {
        let f = (distance / radius);

        if (f < 0)
            return 0;

        return f * f;
    }


    ProcessPoly(source, polygons = null, light_sources) {
        for (let light of light_sources) {

            // BACK-Test vorerst deaktivieren
            if (source.plane.Classify(light.pos) === BACK) continue;

            let polys = polygons;
            /*
            let polys = [];
            for (let p of polygons) {
                let aabb = new AABB(p);
                if (aabb.SphereIntersectsAABB(light.pos, light.color.w)) {
                    polys.push(p);
                }
            }
            */
            for (let ix = 0; ix < source._light_map_width; ix++) {
                for (let iy = 0; iy < source._light_map_height; iy++) {

                    let ufactor = (ix) / (source._light_map_width);
                    let vfactor = (iy) / (source._light_map_height);

                    let lumel = source.uvvector
                        .add(source.edge1.mul(ufactor))
                        .add(source.edge2.mul(vfactor));

                    //if (!source.PointInPolygon(lumel)) { continue; }

                    let dist = lumel.sub(light.pos).length();

                    if (dist > light.radius) continue;

                    let pray = new Ray(light.pos, lumel.sub(light.pos));

                    let hit = false;
                    const EPS = 1e-3;

                    for (let p of polys) {
                        if (p === source) continue;
                        if (p.plane.Classify(light.pos) === BACK) continue;

                        let r = p.RayPolygonDistance2(pray);
                        if (r === -1) continue;

                        if (r < EPS) continue;          // Treffer direkt am Ray-Ursprung ignorieren
                        if (r < dist - EPS) {           // nur "echt davor" zählt als Verdeckung
                            hit = true;
                            break;
                        }
                    }
                    if (hit) continue


                    let intensity = light.color.w / dist/*(dist * dist + 1);*/
                    //  let intensity = light.color.w / (dist * dist + 1);

                    let rr = Math.min((intensity * light.color.x) | 0, 255)
                    let gg = Math.min((intensity * light.color.y) | 0, 255)
                    let bb = Math.min((intensity * light.color.z) | 0, 255)
                    let xx = source._light_map_posx + ix;
                    let yy = source._light_map_posy + iy;


                    let cl = this.GetPixel(xx, yy);
                    let cr = RGBToRed(cl);
                    let cg = RGBToGreen(cl);
                    let cb = RGBToBlue(cl);
                    rr = Math.min((rr + cr) | 0, 255);
                    gg = Math.min((gg + cg) | 0, 255);
                    bb = Math.min((bb + cb) | 0, 255);

                    this.PutPixel(xx, yy, RGB(rr, gg, bb));
                    //                    this.PutPixel(xx, yy, RGB(rr, gg, bb));
                    //  this.PutPixel(xx, yy, RGB(255 - Math.min(dist | 0, 255), 255 - Math.min(dist | 0, 255), 255 - Math.min(dist | 0, 255)));
                }
            }
        }
    }




    CalcLightmap(polygons, lights, max_texture_scale = 64) {
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