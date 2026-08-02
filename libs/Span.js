
class Edge {
    constructor(u = 0, du = 0, v = 0, dv = 0, lu = 0, ldu = 0, lv = 0, ldv = 0, w = 0, dw = 0, x = 0, dx = 0, height = 0) {
        if (u != undefined) this._u = u; else this._u = 0;
        if (du != undefined) this._du = du; else this._du = 0;
        if (v != undefined) this._v = v; else this._v = 0;
        if (dv != undefined) this._dv = dv; else this._dv = 0;

        if (lu != undefined) this._lu = lu; else this._lu = 0;
        if (ldu != undefined) this._ldu = ldu; else this._ldu = 0;
        if (lv != undefined) this._lv = lv; else this._lv = 0;
        if (ldv != undefined) this._ldv = ldv; else this._ldv = 0;


        if (w != undefined) this._w = w; else this._w = 0;
        if (dw != undefined) this._dw = dw; else this._dw = 0;
        if (x != undefined) this._x = x; else this._x = 0;
        if (dx != undefined) this._dx = dx; else this._dx = 0;
        if (height != undefined) this._height = 0;
        else this._height = 0;
        this._aplha = 1.0;
        this._caplha = 1.0;
        this._color = new Vector3(0, 0, 0);
        this._normal = new Vector3(0, 0, 0);
        this._light = new Vector3(0, 0, 0);
        this._dcolor = new Vector3(0, 0, 0);
        this._dnormal = new Vector3(0, 0, 0);
        this._dlight = new Vector3(0, 0, 0);
        this._index = 0;


    }

    set index(a) { this._index = a; }
    get index() { return this._index; }
    set color(a) { this._color = new Vector3(a.x, a.y, a.z); }
    set normal(a) { this._normal = new Vector3(a.x, a.y, a.z); }
    set light(a) { this._light = new Vector3(a.x, a.y, a.z); }
    set dcolor(a) { this._dcolor = new Vector3(a.x, a.y, a.z); }
    set dnormal(a) { this._dnormal = new Vector3(a.x, a.y, a.z); }
    set dlight(a) { this._dlight = new Vector3(a.x, a.y, a.z); }
    set alpha(a) { this._aplha = a; }
    set dalpha(a) { this._daplha = a; }

    get color() { return new Vector3(this._color); }
    get normal() { return new Vector3(this._normal); }
    get light() { return new Vector3(this._light); }
    get dcolor() { return new Vector3(this._dcolor); }
    get dnormal() { return new Vector3(this._dnormal); }
    get dlight() { return new Vector3(this._dlight); }
    get alpha() { return this._aplha; }
    get dalpha() { return this._daplha; }


    set u(a) { this._u = a; }
    set du(a) { this._du = a; }
    set v(a) { this._v = a; }
    set dv(a) { this._dv = a; }

    set lu(a) { this._lu = a; }
    set ldu(a) { this._ldu = a; }
    set lv(a) { this._lv = a; }
    set ldv(a) { this._ldv = a; }


    set w(a) { this._w = a; }
    set dw(a) { this._dw = a; }
    set x(a) { this._x = a; }
    set dx(a) { this._dx = a; }
    set height(a) { this._height = a; }

    get u() { return this._u; }
    get du() { return this._du; }
    get v() { return this._v; }
    get dv() { return this._dv; }

    get lu() { return this._lu; }
    get ldu() { return this._ldu; }
    get lv() { return this._lv; }
    get ldv() { return this._ldv; }


    get w() { return this._w; }
    get dw() { return this._dw; }
    get x() { return this._x; }
    get dx() { return this._dx; }
    get height() { return this._height; }
}

class Span {
    constructor() {
        this._start = 0;  // Start auf 
        this._end = 0;
        this._dv = 0;                 // TextureposY pro Pixel (oder pro x)
        this._du = 0;                 // TextureposX pro Pixel (oder pro x)

        this._ldv = 0;                 // TextureposY pro Pixel (oder pro x)
        this._ldu = 0;                 // TextureposX pro Pixel (oder pro x)


        this._dw = 0;                 // Tiefe pro Pixel (oder pro x)
        this._y = 0;                  // Y Positon

        this._u = 0;                  // TextureposX am Start 
        this._v = 0;                  // TextureposY am Start

        this._lu = 0;                  // TextureposX am Start 
        this._lv = 0;                  // TextureposY am Start


        this._w = 0;                  // Tiefe am Start
        this._n = new Vector3();      // normal am Start  
        this._c = new Vector3();      // color am Start  
        this._dn = new Vector3();     // normal pro Pixel (oder pro x)
        this._dc = new Vector3();     // color pro Pixel (oder pro x)
        this._t = null;               // Zeiger auf texture
        this._a = 1;                  // Attrib 0=background
        this._index = -1;
        this._alpha = 1.0;          // Transparents
        this._texture = null;

        this._ltexture = null;

        this._light_map_posx = 0;
        this._light_map_posy = 0;
        this._light_map_width = 0;
        this._light_map_height = 0;
    }

    get dw() { return this._dw; }



    get ldu() { return this._ldu; }         // texure 
    get ldv() { return this._ldv; }
    get lu() { return this._lu; }
    get lv() { return this._lv; }

    set ldu(a) { this._ldu = a; }         // texure 
    set ldv(a) { this._ldv = a; }
    set lu(a) { this._lu = a; }
    set lv(a) { this._lv = a; }


    get u() { return this._u; }
    get v() { return this._v; }
    set u(a) { this._u = a; }
    set v(a) { this._v = a; }

    get du() { return this._du; }         // texure 
    get dv() { return this._dv; }
    set du(a) { this._du = a; }
    set dv(a) { this._dv = a; }


    get dn() { return new Vector3(this._dn); }
    set dn(a) { this._dn = new Vector3(a); }

    get dc() { return new Vector3(this._dc); }
    set dc(a) { this._dc = new Vector3(a); }

    get n() { return new Vector3(this._n); }
    set n(a) { this._n = new Vector3(a); }

    get c() { return new Vector3(this._c); }
    set c(a) { this._c = new Vector3(a); }



    get alpha() { return this._alpha; }
    set alpha(a) { this._alpha = a; }

    get start() { return this._start; }
    get end() { return this._end; }

    get index() { return this._index; }
    set index(a) { this._index = a; }

    get w() { return this._w; }
    set dw(a) { this._dw = a; }

    get y() { return this._y; }
    get a() { return this._a; }

    get t() { return this._texture; }






    set start(a) { this._start = a; }
    set end(a) { this._end = a; }
    set a(a) { this._a = a; }
    set w(a) { this._w = a; }
    set y(a) { this._y = a; }
    set t(a) { this._texture = a; }

    wAt(x) {
        return this._w + (x - this._start) * this._dw;
    };
    clone() {
        var s = new Span();
        s.v = this.v;
        s.u = this.u;
        s.lv = this.lv;
        s.lu = this.lu;
        s.a = this.a;
        s.w = this.w;

        s.n = this.n;
        s.c = this.c;

        s.du = this.du;
        s.dv = this.dv;
        s.ldu = this.ldu;
        s.ldv = this.ldv;
        s.dw = this.dw;

        s.dc = this.dc;
        s.dn = this.dn;

        s.start = this.start;
        s.end = this.end;
        s.y = this.y;
        s.t = this.t;
        s.index = this.index;
        s.alpha = this.alpha;

        s._ltexture = this._ltexture;
        s._light_map_posx = this._light_map_posx;
        s._light_map_posy = this._light_map_posy;
        s._light_map_width = this._light_map_width;
        s._light_map_height = this._light_map_height;

        return s;
    }

    clipped(nx0, nx1) {
        let dx = nx0 - this._start;

        const s = this.clone();

        s.start = nx0;
        s.end = nx1;

        // lineare Attribute verschieben
        s.u = this._u + dx * this._du;
        s.v = this._v + dx * this._dv;
        s.lu = this._lu + dx * this._ldu;
        s.lv = this._lv + dx * this._ldv;


        s.w = this._w + dx * this._dw;

        s.alpha = this._alpha + dx * this._dalpha;



        s._n.x = this._n.x + dx * this._dn.x
        s._n.y = this._n.y + dx * this._dn.y
        s._n.z = this._n.z + dx * this._dn.z

        s._c.x = this._c.x + dx * this._dc.x
        s._c.y = this._c.y + dx * this._dc.y
        s._c.z = this._c.z + dx * this._dc.z

        //        s.n = this._n.add(this._dn.mul(dx));
        //        s.c = this._c.add(this._dc.mul(dx));

        return s;
    }

    Render(span_renderer) {


        let rasterizer = span_renderer.rasterizer;
        let c = this.c;
        let n = this.n;
        let u = this.u;
        let v = this.v;
        let lu = this.lu;
        let lv = this.lv;
        let w = this.w;


        let start = this.start;
        let texture = this.t;
        let ltexture = this._ltexture;
        let span = this.y * rasterizer.width() + start;
        let spann = (this.y * (rasterizer.width() * 3) + (start * 3));



        if (texture === null) {
            let clear_color = 0xff000000;//RGB(255,100,100);
            for (; start < this.end; start++) {
                rasterizer.GetActiveZBuffer()[span] = w;
                rasterizer.GetActiveBuffer()[span] = clear_color;
                rasterizer.GetActiveIBuffer()[span] = this._index;
                rasterizer.GetActiveNBuffer()[(span * 3 + 0)] = 1;
                rasterizer.GetActiveNBuffer()[(span * 3 + 1)] = 0;
                rasterizer.GetActiveNBuffer()[(span * 3 + 2)] = 0;
                spann += 3;

                span++;
            }
            return;
        }





        for (; start < this.end; start++) {

            rasterizer.GetActiveZBuffer()[span] = w;
            rasterizer.GetActiveIBuffer()[span] = this._index;


            {
                let z = 1.0 / w;
                let s = (u * z);
                let t = (v * z);
                let nnx = n.x * z;
                let nny = n.y * z;
                let nnz = n.z * z;

                rasterizer.GetActiveNBuffer()[(span * 3) + 0] = nnx;
                rasterizer.GetActiveNBuffer()[(span * 3) + 1] = nny;
                rasterizer.GetActiveNBuffer()[(span * 3) + 2] = nnz;


                let uu = (Math.abs(s * texture.width) | 0) % texture.width;
                let vv = (Math.abs(t * texture.height) | 0) % texture.height;
                let front = this.t.getPixelL(uu | 0, vv | 0, 1);

                // let front = 0;//this.t.getPixelL(uu | 0, vv | 0, 1);


                if (ltexture) {
                    let ls = (lu * z);
                    let lt = (lv * z);
                    let luu = this._light_map_posx + (Math.abs(ls * this._light_map_width) | 0) % this._light_map_width;
                    let lvv = this._light_map_posy + (Math.abs(lt * this._light_map_height) | 0) % this._light_map_height;
                    let lc = ltexture.GetPixel(luu | 0, lvv | 0);
                    //                    front = RGB((RGBToRed(front) + RGBToRed(lc)) >> 1, (RGBToGreen(front) + RGBToGreen(lc)) >> 1, (RGBToBlue(front) + RGBToBlue(lc)) >> 1);


                    let lr = Math.min(RGBToRed(lc) + rasterizer._abient_light.x, 255);
                    let lg = Math.min(RGBToGreen(lc) + rasterizer._abient_light.y, 255);
                    let lb = Math.min(RGBToBlue(lc) + rasterizer._abient_light.z, 255);

                    let r = (RGBToRed(front) * lr) >> 8;
                    let g = (RGBToGreen(front) * lg) >> 8;
                    let b = (RGBToBlue(front) * lb) >> 8;


                    /*
                                        let r = RGBToRed(front) * Math.min(rasterizer._abient_light.x + RGBToRed(lc), 1.0);
                                        let g = RGBToGreen(front) * Math.min(rasterizer._abient_light.y + RGBToGreen(lc), 1.0);
                                        let b = RGBToBlue(front) * Math.min(rasterizer._abient_light.z + RGBToBlue(lc), 1.0);
                    */
                    front = RGB(r, g, b);

                }


                //let front = this.t.getPixelL(uu | 0, vv | 0, w * 30);
                //let front = this.t.getPixelL(uu | 0, vv | 0, 1);
                //let front = this.t.getPixel(uu | 0, vv | 0);
                /*
                                let cx = (c.x * z);
                                let cy = (c.y * z);
                                let cz = (c.z * z);
                
                                front = RGB(((cx * 255) | 0) % 256,
                                    ((cy * 255) | 0) % 256,
                                    ((cz * 255) | 0) % 256);
                
                */
                rasterizer.GetActiveBuffer()[span] = front;
            }

            span++;
            u += this.du;
            v += this.dv;

            lu += this.ldu;
            lv += this.ldv;

            w += this.dw;

            c.x += this._dc.x
            c.y += this._dc.y
            c.z += this._dc.z

            n.x += this._dn.x
            n.y += this._dn.y
            n.z += this._dn.z

        }

    }

}


class SpanRenderer {


    get width() { return this._width; }
    get height() { return this._height; }
    get pitch() { return this._width; }
    get rasterizer() { return this._rasterizer; }
    set rasterizer(a) { this._rasterizer = a; }
    get max_depth() { return this._rasterizer.max_depth };

    constructor(rasterizer) {
        this._rasterizer = rasterizer;
        this._line = new Array();
        this._transparent = new Array(height);
        this.SetSize(this._rasterizer.width, this._rasterizer.height);

    }

    subtractSpan(span, cut0, cut1) {
        const out = [];

        // linker Rest
        if (cut0 > span.start) {
            out.push(span.clipped(span.start, Math.min(cut0, span.end)));
        }

        // rechter Rest
        if (cut1 < span.end) {
            out.push(span.clipped(Math.max(cut1, span.start), span.end));
        }

        return out;
    }


    overlap(a, b) {
        const x0 = Math.max(a.start, b.start);
        const x1 = Math.min(a.end, b.end);
        return (x0 < x1) ? [x0, x1] : null;
    }

    clipAgainst(a, b) {
        const ov = this.overlap(a, b);
        if (!ov) {
            return { a: [a], b: [b] };
        }

        const [ox0, ox1] = ov;

        const wa = a.wAt(ox0);
        const wb = b.wAt(ox0);

        if (wa > wb) {
            // A ist vorne → B verliert Bereich
            return {
                a: [a],
                b: this.subtractSpan(b, ox0, ox1)
            };
        } else {
            // B ist vorne → A verliert Bereich
            return {
                a: this.subtractSpan(a, ox0, ox1),
                b: [b]
            };
        }
    }

    insertSpan(newSpan, visible) {
        let fragments = [newSpan];

        for (let i = 0; i < visible.length; i++) {
            const oldSpan = visible[i];

            let newFragments = [];
            let oldFragments = [oldSpan];

            for (const frag of fragments) {
                for (const oldFrag of oldFragments) {
                    const clipped = this.clipAgainst(frag, oldFrag);
                    newFragments.push(...clipped.a);
                    oldFragments = clipped.b;
                }
            }

            fragments = newFragments;

            // oldSpan ersetzen
            visible.splice(i, 1, ...oldFragments);
            i += oldFragments.length - 1;

            if (fragments.length === 0) {
                return; // komplett verdeckt
            }
        }

        visible.push(...fragments);
    }

    resolveScanline(spans) {
        const visible = [];

        for (const s of spans) {
            this.insertSpan(s, visible);
        }

        visible.sort((a, b) => a.start - b.start);
        return visible;
    }

    Start() {
        if (this._width != this._rasterizer.width || this._rasterizer.height != this._height) {
            this.SetSize(this._rasterizer.width, this._rasterizer.height);
        }
        this.Init();


    }

    SetSize(width = 0, height = 0) {
        if (this._width === width && this._height === height) return;
        this._width = width;
        this._height = height;
        this.Init();
    }

    calcEdgeDeltas(edge, top, bot, shade = false) {
        var overHeight = 0;
        var h = (bot.y - top.y);
        if (h != 0) overHeight = 1.0 / h;

        edge.dalpha = (bot.alpha - top.alpha) * overHeight;
        edge.du = (bot.u - top.u) * overHeight;
        edge.dv = (bot.v - top.v) * overHeight;

        edge.ldu = (bot.lu - top.lu) * overHeight;
        edge.ldv = (bot.lv - top.lv) * overHeight;

        edge.dw = (bot.w - top.w) * overHeight;
        edge.dx = (bot.x - top.x) * overHeight;

        edge._dlight.x = (bot.light.x - top.light.x) * overHeight;
        edge._dlight.y = (bot.light.y - top.light.y) * overHeight;
        edge._dlight.z = (bot.light.z - top.light.z) * overHeight;

        edge._dnormal.x = (bot._normal.x - top._normal.x) * overHeight;
        edge._dnormal.y = (bot._normal.y - top._normal.y) * overHeight;
        edge._dnormal.z = (bot._normal.z - top._normal.z) * overHeight;

        edge._dcolor.x = (bot._color.x - top._color.x) * overHeight;
        edge._dcolor.y = (bot._color.y - top._color.y) * overHeight;
        edge._dcolor.z = (bot._color.z - top._color.z) * overHeight;



        //        edge.dlight = bot.light.sub(top.light).mul(overHeight);
        //        edge.dnormal = bot.normal.sub(top.normal).mul(overHeight);
        //        edge.dcolor = bot.color.sub(top.color).mul(overHeight);

        // Screen pixel Adjustments (some call this "sub-pixel accuracy")

        var subPix = top.iy - top.y;
        edge.dalpha = top.dalpha + edge.ddalpha * subPix;
        edge.u = top.u + edge.du * subPix;
        edge.v = top.v + edge.dv * subPix;

        edge.lu = top.lu + edge.ldu * subPix;
        edge.lv = top.lv + edge.ldv * subPix;

        edge.w = top.w + edge.dw * subPix;
        edge.x = top.x + edge.dx * subPix;


        edge._light.x = top._light.x + edge._dlight.x * subPix;
        edge._light.y = top._light.y + edge._dlight.y * subPix;
        edge._light.z = top._light.z + edge._dlight.z * subPix;

        edge._normal.x = top.normal.x + edge._dnormal.x * subPix;
        edge._normal.y = top.normal.y + edge._dnormal.y * subPix;
        edge._normal.z = top.normal.z + edge._dnormal.z * subPix;

        edge._color.x = top._color.x + edge._dcolor.x * subPix;
        edge._color.y = top._color.y + edge._dcolor.y * subPix;
        edge._color.z = top._color.z + edge._dcolor.z * subPix;


        //        edge.light = top.light.add(edge.dlight.mul(subPix));
        //        edge.normal = top.normal.add(edge.dnormal.mul(subPix));
        //       edge.color = top.color.add(edge.dcolor.mul(subPix));
    }

    AddPrimitive(primitive) {
        this.AddPrimitive_span(primitive);
    }


    AddPrimitive_span(primitive) // fehlerhaft
    {
        // Find the top-most vertex
        let verts = primitive.sverts;

        var lastVert = verts.length - 1;
        var lTop = 0;
        var rTop = 0;



        for (let i = 0; i < verts.length; i++) {
            //console.log(verts[i].normal.x, verts[i].normal.y, verts[i].normal.z);
            verts[i].iy = Math.ceil(verts[i].y);
            if (verts[i].y < verts[lTop].y) lTop = i;
        }

        // Make sure we have the top-most vertex that is earliest in the winding order

        if (verts[lastVert].y == verts[lTop].y && verts[0].y == verts[lTop].y) lTop = lastVert;

        rTop = lTop;

        // Top scanline of the polygon in the frame buffer

        var fb = verts[lTop].iy; //* this.pitch;


        // Left & Right edges (primed with 0 to force edge calcs first-time through)

        var le = new Edge();
        var re = new Edge();
        le.height = 0;
        re.height = 0;

        // Render the polygon

        var done = false;
        while (done == false) {


            if (!le.height) {
                let lBot = lTop - 1;
                if (lBot < 0) lBot = verts.length - 1;
                le.height = verts[lBot].iy - verts[lTop].iy;

                if (le.height < 0) return;
                this.calcEdgeDeltas(le, verts[lTop], verts[lBot]);
                lTop = lBot;
                if (lTop == rTop) done = true;
                if (lTop != rTop && done == true) return;
            }

            if (!re.height) {
                var rBot = rTop + 1;

                if (rBot > lastVert) rBot = 0;
                re.height = verts[rBot].iy - verts[rTop].iy;
                if (re.height < 0) return;
                this.calcEdgeDeltas(re, verts[rTop], verts[rBot]);
                rTop = rBot;
                if (lTop == rTop) done = true;
                if (lTop != rTop && done == true) return;
            }

            // Get the height

            var height = Math.min(le.height, re.height) | 0;

            // Subtract the height from each edge

            le.height -= height;
            re.height -= height;

            height = height | 0;

            // Render the current trapezoid defined by left & right edges



            while (((height--) | 0)) {


                var span = new Span();
                span._index = primitive._id;
                var overWidth = 1.0 / (re.x - le.x);
                span.dalpha = (re.alpha - le.alpha) * overWidth;

                span.du = (re.u - le.u) * overWidth;
                span.dv = (re.v - le.v) * overWidth;

                span.ldu = (re.lu - le.lu) * overWidth;
                span.ldv = (re.lv - le.lv) * overWidth;

                span.dw = (re.w - le.w) * overWidth;

                span._dc.x = (re._color.x - le._color.x) * overWidth
                span._dc.y = (re._color.y - le._color.y) * overWidth
                span._dc.z = (re._color.z - le._color.z) * overWidth

                span._dn.x = (re._normal.x - le._normal.x) * overWidth
                span._dn.y = (re._normal.y - le._normal.y) * overWidth
                span._dn.z = (re._normal.z - le._normal.z) * overWidth



                //span.dc = re.color.sub(le.color).mul(overWidth);
                //span.dn = re.normal.sub(le.normal).mul(overWidth);

                // Find the end-points

                span.start = Math.ceil(le.x) | 0;
                span.end = Math.ceil(re.x) | 0;

                // Texture adjustment (some call this "sub-texel accuracy")

                var subTex = span.start - le.x;

                span.alpha = (le.alpha + span.dalpha * subTex);
                span.u = (le.u + span.du * subTex);
                span.v = (le.v + span.dv * subTex);

                span.lu = (le.lu + span.ldu * subTex);
                span.lv = (le.lv + span.ldv * subTex);

                span.w = (le.w + span.dw * subTex);

                span._c.x = (le._color.x + span._dc.x * subTex);
                span._c.y = (le._color.y + span._dc.y * subTex);
                span._c.z = (le._color.z + span._dc.z * subTex);

                span._n.x = (le._normal.x + span._dn.x * subTex);
                span._n.y = (le._normal.y + span._dn.y * subTex);
                span._n.z = (le._normal.z + span._dn.z * subTex);

                span.y = fb;
                span.t = primitive._texture;
                span._ltexture = primitive._ltexture;
                span._light_map_width = primitive._light_map_width
                span._light_map_height = primitive._light_map_height
                span._light_map_posx = primitive._light_map_posx
                span._light_map_posy = primitive._light_map_posy
                span.index = primitive._id;
                this.AddSpan(span);
                // Step

                le.u += le.du;
                le.v += le.dv;

                le.lu += le.ldu;
                le.lv += le.ldv;

                le.w += le.dw;
                le.x += le.dx;
                le.alpha += le.dalpha;

                le._color.x += le._dcolor.x;
                le._color.y += le._dcolor.y;
                le._color.z += le._dcolor.z;

                le._normal.x += le._dnormal.x;
                le._normal.y += le._dnormal.y;
                le._normal.z += le._dnormal.z;

                //le.color = le.dcolor.add(le.dcolor);
                //le.normal = le.dnormal.add(le.dnormal);

                re.u += re.du;
                re.v += re.dv;

                re.lu += re.ldu;
                re.lv += re.ldv;


                re.w += re.dw;
                re.x += re.dx;
                re.alpha += re.dalpha;


                re._color.x += re._dcolor.x;
                re._color.y += re._dcolor.y;
                re._color.z += re._dcolor.z;

                re._normal.x += re._dnormal.x;
                re._normal.y += re._dnormal.y;
                re._normal.z += re._dnormal.z;



                //                re.color = re.dcolor.add(re.dcolor);
                //                re.normal = re.dnormal.add(re.dnormal);
                fb++;


            }

            // console.log("End Loope");
        }
    }

    AddSpan(span) {
        if (span.alpha < 1.0) {
            this._transparent[span.y].push(span);
        } else {
            this._line[span.y].push(span);
        }

        this._m_spans_in++;

    }

    Init() {
        this._m_spans_in = 0;
        this._m_spans_out = 0;
        this._line = new Array(this._rasterizer.height());
        this._transparent = new Array(this._rasterizer.height());

        for (let y = 0; y < this._rasterizer.height(); y++) {
            let span = new Span();
            span.y = y;
            span.start = 0;
            span.end = this._rasterizer.width();
            span.t = null;
            span.w = -this.max_depth / 2;
            span.a = 0;
            this._line[y] = new Array();
            this._transparent[y] = [];
            this.AddSpan(span);
        }
    }

    get SpansIn() { return this._m_spans_in; }
    get SpansOut() { return this._m_spans_out; }

    Render(sort = true) {

        this._spans_out = 0;
        this._spans_in = 0;

        for (let y = 0; y < this._line.length; y++) {
            // ===== OPAQUE =====
            this._spans_in += this._line[y].length;

            if (sort) {
                this._line[y] = this.resolveScanline(this._line[y]);
            }

            for (let s of this._line[y]) {
                s.Render(this);
            }

            this._spans_out += this._line[y].length;

            // ===== TRANSPARENT =====
            let transp = this._transparent[y];

            // Back-to-front sortieren
            transp.sort((a, b) => b.w - a.w);

            for (let s of transp) {
                s.RenderTransparent(this);
            }
        }
    }
}
