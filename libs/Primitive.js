
class PrimitiveBase {
    constructor() {
        this._object_matrix = Matrix4x4.identity();
        this._verts = new Array();
        this._sverts = new Array();
        this._render_type = POLY_LINED;
        this._was_best_splitter = false;
        this._can_not_be_splitter = false;
        this._potential_portal = true;
        this._create_from_aabb = false;

    }




    GetObjectMatrix() {
        return this._object_matrix;
    }
    SetObjectMatrix(m) {
        this._object_matrix = new Matrix4x4(m);
    }

    get render_type() { return this._render_type; }
    set render_type(a) { this._render_type = a; }


    Visible(camera) {
        return true;
    }

    ClipByFrustum(frustum) {
        return undefined;
    }

    TransformToScreen(matrix) {
        return true;
    }

    Project(rasterizer) {
        return true;
    }

    Render(rasterizer) {
        return true;
    }
    identity() {
        this._object_matrix = Matrix4x4.identity();
    }

    Scale(x = 1, y = 1, z = 1) {
        var scale = Matrix4x4.scale(x, y, z);
        this._object_matrix = this._object_matrix.concat(scale);

    }

    Translate(x = 0, y = 0, z = 0) {
        var trans = Matrix4x4.translate(x, y, z);
        this._object_matrix = this._object_matrix.concat(trans);
        //this._transform_matrix
    }

    Rotate(x = 1, y = 1, z = 1) {
        var rot = Matrix4x4.rotation(x, y, z);
        this._object_matrix = this._object_matrix.concat(rot);
    }

}

//var dummy_texture = new Texture();

class Polygon extends PrimitiveBase {

    /**
     * function 
     */
    constructor(p, invert = false) {
        super();
        // this._verts= new Array();
        // this._sverts= new Array();
        this._texture = null;
        this._ltexture = null;
        this._plane = new Ray(3);
        this._center = new Vector3();
        this._recal_plane = true;
        this._recal_center = true;
        this._counterClock = true;
        this._screen_center = new Vector4();
        this._create_from_aabb = false;
        this._id = -1;
        this._node_id = -1;
        this._leaf_id = -1;
        this._light_map_posx = 0;
        this._light_map_posy = 0;
        this._light_map_width = 0;
        this._light_map_height = 0;
        this.m_edge1 = new Vector3();
        this.m_edge2 = new Vector3();
        if (p instanceof Polygon) {


            if (!invert) {
                for (let i = 0; i < p.verts.length; i++) {
                    var pp = new Vert(p.verts[i]);
                    this._verts.push(pp);
                }
            } else {
                for (let i = p.verts.length - 1; i > -1; i--) {
                    var pp = new Vert(p.verts[i]);
                    this._verts.push(pp);
                }


            }
            //this._plane=new Ray(p._plane);
            this.calcPlane();
            this.calcCenterOfMass();
            this.SetObjectMatrix(p.GetObjectMatrix());
            this._was_best_splitter = p._was_best_splitter;
            this._can_not_be_splitter = p._can_not_be_splitter;
            this._render_type = p._render_type;
            this._potential_portal = p._potential_portal;
            this._create_from_aabb = p._create_from_aabb;
            this._id = p._id;
            this._leaf_id = p._leaf_id;
            this._node_id = p._node_id;
            this._texture = p._texture;
            return;
        }


        if (Array.isArray(p) && p.length > 0 /*&& p[0] instanceof Vert*/) {
            var ve = new Vert();
            var vv = new Vector3();
            if (!invert) {
                for (let i = 0; i < p.length; i++) {
                    if (p[i] instanceof Vert || p[i] instanceof Vector3) {
                        let pp = new Vert(p[i]);
                        pp.world.x = pp.world.x;
                        pp.world.y = pp.world.y;
                        pp.world.z = pp.world.z;

                        this._verts.push(pp)
                    }
                }
            } else {

                for (let i = p.length; i > -1; i--) {
                    if (p[i] instanceof Vert || p[i] instanceof Vector3) {
                        let pp = new Vert(p[i]);
                        pp.world.x = pp.world.x;
                        pp.world.y = pp.world.y;
                        pp.world.z = pp.world.z;

                        this._verts.push(pp)
                    }

                }
            }

            this.calcPlane();
            this.calcCenterOfMass();
            this.identity();

            return;
        }

    }

    GetAlignement() {
        let normal = this._plane.normal;
        let norm = Math.abs(normal.x);
        if (norm < Math.abs(normal.y)) return 1;
        if (norm < Math.abs(normal.z)) return 2
        return 0;
    }


    Get2DBBox() {

        let axis = this.GetAlignement();

        let uumin = 0;
        let uumax = 0;
        let vvmin = 0;
        let vvmax = 0;


        for (let i = 0; i < this._verts.length; i++) {
            let u = 0;
            let v = 0;
            switch (axis) {
                case 0:
                    u = this._verts[i].world.y;
                    v = this._verts[i].world.z;
                    break;
                case 1:
                    u = this._verts[i].world.x;
                    v = this._verts[i].world.z;
                    break;
                case 2:
                    u = this._verts[i].world.x;
                    v = this._verts[i].world.y;
                    break;
            }

            if (i === 0) {
                uumin = u;
                uumax = u;
                vvmin = v;
                vvmax = v;
            } else {
                uumin = Math.min(uumin, u);
                vvmin = Math.min(vvmin, v);
                uumax = Math.max(uumax, u);
                vvmax = Math.max(vvmax, v);
            }
        }

        return new AABB2D(new Vector2(uumin, vvmin), new Vector2(uumax, vvmax));

    }



    Area() {
        if (this.verts.length < 3)
            return 0;

        let area = 0;
        let v0 = this.verts[0].world;

        for (let i = 1; i < this.verts.length - 1; i++) {
            let e1 = this.verts[i].world.sub(v0);
            let e2 = this.verts[i + 1].world.sub(v0);

            area +=
                e1.cross(e2).length() * 0.5;
        }

        return area;
    }

    static CreateByPlane(plane, size = 10000) {
        let verts = new Array();

        var absnormal = new Vector3(plane.normal);
        var aa = new Vector3(0.0, 0.0, 0.0);
        absnormal.abs();

        if (absnormal.y > absnormal.z) {
            if (absnormal.z > absnormal.x) aa.z = 1.0; else aa.x = 1.0;
        } else {
            if (absnormal.y <= absnormal.x) aa.y = 1.0; else aa.x = 1.0;
        }

        var normal = new Vector3(plane.normal);



        var u = aa.cross(normal); u.normalize();
        var v = u.cross(normal); v.normalize();
        u = u.mul(size);
        v = v.mul(size);

        var a = plane.origin.add(u.sub(v));
        var b = plane.origin.add(u.add(v));
        var c = plane.origin.sub(u.sub(v));
        var d = plane.origin.sub(u.add(v));

        verts.push(d);
        verts.push(c);
        verts.push(b);
        verts.push(a);

        let p = new Polygon(verts)
        p.calcPlane();
        p.calcCenterOfMass();
        p.setWorldTexture();
        return p;

    }

    IsVertexOnEdge(vertex) {
        for (let i = 0; i < this._verts.length; i++) {
            let j = (i + 1) % this._verts.length;
            let v0 = this._verts[i].world;
            let v1 = this._verts[j].world;
            const result = PointOnEdge(v0, v1, vertex);

            //const result = PointOnEdge2(vertex, v0, v1);
            //if (result) return i;
            if (result === EDGE_POINT_ON_EDGE) return i;
        }
        return -1;
    }

    // A--------B    A->B = 0
    // |        |    B->C = 1
    // |        |    C->D = 2
    // |        |    D->A = 3
    // D--------C       |

    InsertVertexOnEdge(edge_index, pos, check = true) {
        // if (edge_index < 0 || edge_index >= this, this._verts.length) return false;
        let v0 = this._verts[edge_index];
        let v1 = this._verts[(edge_index + 1) % this._verts.length];
        // if (check && PointOnEndge(v0, v1, vertex) === EDGE_POINT_ON_EDGE) return false;

        let vn = new Vert(pos);
        let t1 = pos.sub(v0.world);
        let t2 = v1.world.sub(v0.world);

        const percent = t1.length() / t2.length();
        vn.normal = v0.normal.add(v1.normal.sub(v0.normal).mul(percent));
        vn.texture = v0.texture.add(v1.texture.sub(v0.texture).mul(percent));
        vn.light_texture = v0.light_texture.add(v1.light_texture.sub(v0.light_texture).mul(percent));
        vn.color = v0.color.add(v1.color.sub(v0.color).mul(percent));
        vn.light = v0.light.add(v1.light.sub(v0.light).mul(percent));
        vn.alpha = v0.alpha + (v1.alpha - v0.alpha) * (percent);
        //        console.log(pos.x, pos.y, pos.z, "-> ", this._id)




        this._verts.splice([(edge_index + 1) % this._verts.length], 0, vn);
        return true;
    }

    SetFaceNormalToVerts() {
        for (let v of this._verts) v.normal = new Vector3(this._plane.normal);

    }

    SetFaceNormalToVerts2() {
        for (let v of this._verts) {
            v.normal = new Vector3(this._plane.normal);
            v.color = new Vector3(this._plane.normal.x * 0.5 + 0.5,
                this._plane.normal.y * 0.5 + 0.5,
                this._plane.normal.z * 0.5 + 0.5);

        }
    }

    InsertVertexOnPolyEdge(pos) {
        for (let i = 0; i < this._verts.length; i++) {
            if (this.InsertVertexOnEdge(i, pos, true)) return true;
        }
        return false;
    }

    CheckTJunction(p) {
        for (let v of p.verts) {
            let index = this.IsVertexOnEdge(v.world);
            if (index > -1) {

                return this.InsertVertexOnEdge(index, v.world, false);
                //console.log("Insert");

            }
        }

        return false;
    }


    TransformByObjectMatrix() {
        var p = new Polygon(this);
        p.ClearVerts();
        var matrix = this.GetObjectMatrix();;

        for (let i = 0; i < this.vertices.length; i++) {
            var w = new Vert(this.vertices[i]);
            var h = matrix.concat(w.world);

            w.world.x = h.x;
            w.world.y = h.y;
            w.world.z = h.z;

            p.AddVert(w);
        }

        p.calcCenterOfMass();
        p.calcPlane();
        return p;
    }

    CoppyAttribs(p, copy_best_splitter = true) {
        if (copy_best_splitter) this._was_best_splitter = p._was_best_splitter;
        this._can_not_be_splitter = p._can_not_be_splitter;
        this._render_type = p._render_type;
        this._potential_portal = p._potential_portal;
        this._create_from_aabb = p._create_from_aabb;
        this._leaf_id = p._leaf_id;
        this._node_id = p._node_id;
        this._id = p._id;
        this._texture = p._texture;
        this._ltexture = p._ltexture;
        this._light_map_posx = p._light_map_posx;
        this._light_map_posy = p._light_map_posy;
        this._light_map_width = p._light_map_width;
        this._light_map_height = p._light_map_height;
        this.m_edge1 = new Vector3(p.m_edge1);
        this.m_edge2 = new Vector3(p.m_edge2);
        this.m_uvvector = new Vector3();
    }

    get uvvector() { return this.m_uvvector; }
    set uvvector(a) { this.m_uvvector.x = a.x; this.m_uvvector.y = a.y; this.m_uvvector.z = a.z; }

    clalcAABB() {
        return new AABB(this);
    }



    setPlanarTexture(realx = 0, realy = 0, realw = 1, realh = 1) {
        let ali = this.plane.GetAlignement();
        let umin = 0;
        let umax = 0;
        let vmin = 0;
        let vmax = 0;


        if (ali === 0) {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.z;
                this._verts[i].texture.y = this._verts[i].world.y;

                if (i === 0) {
                    umin = umax = this._verts[i].texture.x;
                    vmin = vmax = this._verts[i].texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].texture.x);
                    umax = Math.max(umax, this._verts[i].texture.x);
                    vmin = Math.min(vmin, this._verts[i].texture.y);
                    vmax = Math.max(vmax, this._verts[i].texture.y);

                }

            }
        }

        // Primary axis == Y

        else if (ali === 1) {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.x;
                this._verts[i].texture.y = this._verts[i].world.z;


                if (i === 0) {
                    umin = umax = this._verts[i].texture.x;
                    vmin = vmax = this._verts[i].texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].texture.x);
                    umax = Math.max(umax, this._verts[i].texture.x);
                    vmin = Math.min(vmin, this._verts[i].texture.y);
                    vmax = Math.max(vmax, this._verts[i].texture.y);

                }

            }
        }

        // Primary axis == Z

        else {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.x;
                this._verts[i].texture.y = this._verts[i].world.y;

                if (i === 0) {
                    umin = umax = this._verts[i].texture.x;
                    vmin = vmax = this._verts[i].texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].texture.x);
                    umax = Math.max(umax, this._verts[i].texture.x);
                    vmin = Math.min(vmin, this._verts[i].texture.y);
                    vmax = Math.max(vmax, this._verts[i].texture.y);

                }


            }
        }


        let udelta = Math.abs(umax - umin);
        let vdelta = Math.abs(vmax - vmin);




        for (let i = 0; i < this._verts.length; i++) {
            this._verts[i].texture.x =
                ((this._verts[i].texture.x - umin) / udelta) * realw + realx;

            this._verts[i].texture.y =
                ((this._verts[i].texture.y - vmin) / vdelta) * realh + realy;



        }

    }


    setPlanarLightTexture(realx = 0, realy = 0, realw = 1, realh = 1) {
        let ali = this.plane.GetAlignement();
        let umin = 0;
        let umax = 0;
        let vmin = 0;
        let vmax = 0;

        for (let i = 0; i < this._verts.length; i++) {
            if (ali === 0) {

                this._verts[i].light_texture.x = this._verts[i].world.y;
                this._verts[i].light_texture.y = this._verts[i].world.z;

                if (i === 0) {
                    umin = umax = this._verts[i].light_texture.x;
                    vmin = vmax = this._verts[i].light_texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].light_texture.x);
                    umax = Math.max(umax, this._verts[i].light_texture.x);
                    vmin = Math.min(vmin, this._verts[i].light_texture.y);
                    vmax = Math.max(vmax, this._verts[i].light_texture.y);



                }

            }
            else if (ali === 1) {
                this._verts[i].light_texture.x = this._verts[i].world.x;
                this._verts[i].light_texture.y = this._verts[i].world.z;


                if (i === 0) {
                    umin = umax = this._verts[i].light_texture.x;
                    vmin = vmax = this._verts[i].light_texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].light_texture.x);
                    umax = Math.max(umax, this._verts[i].light_texture.x);
                    vmin = Math.min(vmin, this._verts[i].light_texture.y);
                    vmax = Math.max(vmax, this._verts[i].light_texture.y);

                }

            }
            else {
                this._verts[i].light_texture.x = this._verts[i].world.x;
                this._verts[i].light_texture.y = this._verts[i].world.y;

                if (i === 0) {
                    umin = umax = this._verts[i].texture.x;
                    vmin = vmax = this._verts[i].texture.y;
                } else {
                    umin = Math.min(umin, this._verts[i].light_texture.x);
                    umax = Math.max(umax, this._verts[i].light_texture.x);
                    vmin = Math.min(vmin, this._verts[i].light_texture.y);
                    vmax = Math.max(vmax, this._verts[i].light_texture.y);

                }
            }

        }
        let udelta = Math.abs(umax - umin);
        let vdelta = Math.abs(vmax - vmin);




        for (let i = 0; i < this._verts.length; i++) {
            this._verts[i].light_texture.x =
                ((this._verts[i].light_texture.x - umin) / udelta) * realw + realx;

            this._verts[i].light_texture.y =
                ((this._verts[i].light_texture.y - vmin) / vdelta) * realh + realy;
        }

    }



    setWorldTexture(uScale = 1, vScale = 1) {
        // Calculate |normal|

        let ali = this.plane.GetAlignement();                        // Primary axis == X

        if (ali === 0) {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.z * uScale;
                this._verts[i].texture.y = -this._verts[i].world.y * vScale;
            }
        }

        // Primary axis == Y

        else if (ali === 1) {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.x * uScale;
                this._verts[i].texture.y = -this._verts[i].world.z * vScale;
            }
        }

        // Primary axis == Z

        else {
            for (let i = 0; i < this._verts.length; i++) {
                this._verts[i].texture.x = this._verts[i].world.x * uScale;
                this._verts[i].texture.y = -this._verts[i].world.y * vScale;
            }
        }
    }

    /**
     * function 
     */
    AddVert(v, check) {

        if (check)
            for (let vv of this._verts) {
                let vvv = new Vector3(Math.abs(vv.world.x - v.world.x),
                    Math.abs(vv.world.y - v.world.y),
                    Math.abs(vv.world.z - v.world.z));
                let eps = 0.000000001;
                //Number.EPSILON
                //      if (vvv.x<=eps && vvv.y<=eps && vvv.z<=eps) {DebugOut("Double  "+this._verts.length+"\n");return;}

            }

        this._verts.push(new Vert(v));
        this._recal_plane = true;
        this._recal_center = true;

    }

    /**
     * function 
     */
    AddVec(v) {
        this._verts.push(new Vert(v));
        this._recal_plane = true;
        this._recal_center = true;

    }

    /**
     * function 
     */
    AddVerts(v) {
        for (let i = 0; i < v.length; i++) {

            this._verts.push(new Vert(v[i]));
        }
        this._recal_plane = true;
        this._recal_center = true;

    }

    /**
     * function 
     */
    get center() {
        this.calcCenterOfMass(); return this._center;
    }

    get centroid() {
        this.calcCenterOfMass(); return this._center;
    }

    /**
     * function 
     */
    get ScreenCenter() { return this._screen_center; }

    /**
     * function 
     */
    calcPlane(counterClock = false) {
        if (this.vertices.length < 3) {
            DebugOut("DOOOOOOF");
            return;
        }
        this._counterClock = counterClock;
        this._recal_center = false;
        this._plane.origin = this.vertices[0].world;
        var v0 = this.vertices[1].world.sub(this.vertices[0].world);
        var v1 = this.vertices[2].world.sub(this.vertices[1].world);
        this._plane.vector = v1.cross(v0);
        if (!counterClock) {
            this._plane.vector = this._plane.vector.mul(-1);
        };
        return this.plane;
    }

    /**
     * function 
     */
    calcCenterOfMass() {

        if (!this._recal_center && this._verts.length < 3) return this._plane;
        this._center = new Vector3(this._verts.world);
        this._recal_center = false;


        for (let i = 1; i < this._verts.length; i++) {
            this._center = this._center.add(this._verts[i].world);
        }
        var m = 1.0 / this._verts.length;
        this._center = this._center.mul(m);
        return this._center;
    }

    /**
     * function 
     */
    get plane() {
        return this._plane;
    }


    GetPrimitiveTransformByObjectMatrix() {
        var objmatrix = this.GetRotateMatrix();
    }

    /**
     * function 
     */
    Project(rasterizer) {
        if (super.Visible(rasterizer) == false) return false;
        this._sverts = new Array(this.verts.length);

        for (let j = 0; j < this.verts.length; j++) {
            var ow = 1.0 / this.verts[j].screen.w;
            this._sverts[j] = new SVec();
            //   this._sverts[j].alpha = this.verts[j].alpha;
            //   this._sverts[j].color = this.verts[j].color;

            this._sverts[j].x = (rasterizer.screenCenterX() + this.verts[j].screen.x * ow * rasterizer.screenCenterX() * rasterizer.xScale());
            this._sverts[j].y = (rasterizer.screenCenterY() - this.verts[j].screen.y * ow * rasterizer.screenCenterY() * rasterizer.yScale());
            this._sverts[j].z = this.verts[j].screen.w;
            this._sverts[j].w = ow;

            if (this._sverts[j].x < -0.5) this._sverts[j].x = -0.5;
            if (this._sverts[j].x > (rasterizer.width() - 0.5)) this._sverts[j].x = rasterizer.width() - 0.5;
            if (this._sverts[j].y < -0.5) this._sverts[j].y = -0.5;
            if (this._sverts[j].y > (rasterizer.height() - 0.5)) this._sverts[j].y = rasterizer.height() - 0.5;

            //        		if (rasterizer.PerspectiveCorrect() == 0) ow = 1.0;
            if (this.render_type != POLY_PERSPECTIVE_TEXTURED) ow = 1.0;

            this._sverts[j].u = this.verts[j].texture.x * ow;
            this._sverts[j].v = this.verts[j].texture.y * ow;

            this._sverts[j].lu = this.verts[j].light_texture.x * ow;
            this._sverts[j].lv = this.verts[j].light_texture.y * ow;

            this._sverts[j]._normal.x = this.verts[j]._normal.x * ow;
            this._sverts[j]._normal.y = this.verts[j]._normal.y * ow;
            this._sverts[j]._normal.z = this.verts[j]._normal.z * ow;

            this._sverts[j]._color.x = this.verts[j]._color.x * ow;
            this._sverts[j]._color.y = this.verts[j]._color.y * ow;
            this._sverts[j]._color.z = this.verts[j]._color.z * ow;

            if (j < this.verts.length - 1) this._sverts[j].next = this._sverts[j + 1];
        }
        this._sverts[this.verts.length - 1].next = undefined;
        return true;
    }


    /**
     * function 
     */
    Visible(camera) {
        if (super.Visible(camera) == false) return false;
        var res = this._plane.Classify(camera.position);
        if (res == BACK) return false;
        return true;
    }

    /**
     * function 
     */

    /**
     * function 
     */

    TransformToScreen(xform) {
        var codeOff = -1;
        var codeOn = 0;
        var code = 0;

        for (let j = 0; j < this._verts.length; j++) {
            let w = this._verts[j].world;
            var s = xform.concat(w);

            this._verts[j].screen.x = s.x;
            this._verts[j].screen.y = s.y;
            this._verts[j].screen.z = s.z;
            this._verts[j].screen.w = s.w

            code = (s.x > s.w ? 1 : 0) | (s.x < -s.w ? 2 : 0) |
                (s.y > s.w ? 4 : 0) | (s.y < -s.w ? 8 : 0) |
                (s.z < 0.0 ? 16 : 0) | (s.z > s.w ? 32 : 0);
            codeOff &= code;
            codeOn |= code;
        }

        super.TransformToScreen(xform);
        return new Array(codeOff, codeOn);
    }

    ClearVerts() { this._verts = new Array(); }

    /**
     * function 
     */
    get vertices() { return this._verts }

    /**
     * function 
     */
    get verts() { return this._verts }
    get sverts() { return this._sverts }

    /**
     * function 
     */

    SetAlpha(alpha) {
        for (let v of this.verts) v.alpha = alpha;
    }

    SetTestColor() {
        var a = new Vector3(128, 128, 128);

        for (let i = 0; i < this.verts.length; i++) {
            var c = new Vector3(this.verts[i].world);
            c.normalize();
            this.verts[i].color = a.add(c.mul(128));

        }


    }
    /**
     * function 
     */

    toStr() {
        var s = "";
        for (let i = 0; i < this.verts.length; i++) {
            let v = this.verts[i];
            s += "w:" + v.world.x + " " + v.world.y + " " + v.world.z + " | " + "t:" + v.texture.x + " " + v.texture.y + " | " + "s:" + v.screen.x + " " + v.screen.y + " " + v.screen.z + " " + v.screen.w + " \n";

        }
        return s;
    }
    /**
     * function 
     */

    SetNormalColor(r = 1, g = 1, b = 1) {
        this.calcPlane();
        for (let i = 0; i < this.verts.length; i++) {
            var n = new Vector3(this.verts[i].world);
            n.normalize();
            this.verts[i].color = n.mul(0.5).add(new Vector3(0.5, 0.5, 0.5));

        }

    }

    SetNormalGray() {
        this.calcPlane();
        let n = this._plane.normal.mul(0.5).add(new Vector3(0.5, 0.5, 0.5));
        let g = LUMA_REC709(n.x, n.y, n.z);
        for (let i = 0; i < this.verts.length; i++) {
            this.verts[i]._color.x = g;
            this.verts[i]._color.y = g;
            this.verts[i]._color.z = g;
        }

    }
    /**
     * function 
     */
    SetColor(r = 1, g = 1, b = 1) {


        var c = new Vector3(r | 0, g | 0, b | 0);
        //var c= new Vector3(this.plane.normal.x*r,this.plane.normal.y*g,this.plane.normal.z*b);
        for (let i = 0; i < this.verts.length; i++) {
            this.verts[i].color = c;

        }

    }

    /**
     * function 
     */

    Render(rasterizer) {

        if (this._sverts.length < 3) return;
        //  DrawTexture(this._sverts,dummy_texture,rasterizer.canvas,rasterizer,rasterizer.width())
        return true;

    }


    pointInPolygon(point) {

        const normal = this.plane.normal;

        for (let i = 0; i < poly.vertices.length; i++) {

            const a = this.verts[i].world;
            const b = this.verts[(i + 1) % this.verts.length].world;

            const edgeX = b.x - a.x;
            const edgeY = b.y - a.y;
            const edgeZ = b.z - a.z;

            const px = point.x - a.x;
            const py = point.y - a.y;
            const pz = point.z - a.z;

            // cross(edge, pointvec)
            const cx = edgeY * pz - edgeZ * py;
            const cy = edgeZ * px - edgeX * pz;
            const cz = edgeX * py - edgeY * px;

            const d =
                cx * normal.x +
                cy * normal.y +
                cz * normal.z;

            if (d < 0)
                return false;
        }

        return true;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    ClassifyByFrustum(frustum) {
        var f = frustum.planes[0];
        for (let i = 0; i < frustum.planes.length; i++) {
            var f = frustum.planes[i];
            var res = f.Classify(this);
            if (res == BACK || res == SPANNING) return res;
        }
        return FRONT;
    }


    ClipPolyByPlane(plane, poly) {
        var npoly = new Polygon();
        npoly.CoppyAttribs(this, false);

        for (let i = 0; i < poly.verts.length; i++) {
            var j = (i + 1) % poly.verts.length;
            var v0 = poly.verts[i];
            var v1 = poly.verts[j];
            var res0 = plane.Classify(v0);
            var res1 = plane.Classify(v1);


            if (res0 == COPLANAR) {
                npoly.AddVert(new Vert(v0));
                continue;
            }
            if (res0 == FRONT) {
                npoly.AddVert(new Vert(v0));
            }

            if ((res1 == FRONT && res0 == BACK) || (res0 == FRONT && res1 == BACK)) {
                var aDot = v0.world.dot(plane.normal);
                var bDot = v1.world.dot(plane.normal);
                var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
                var v = new Vert();

                v.alpha = v0.alpha + (scaled * (v1.alpha - v0.alpha));

                v.normal = new Vector3(v0.normal.x + (scaled * (v1.normal.x - v0.normal.x)),
                    v0.normal.y + (scaled * (v1.normal.y - v0.normal.y)),
                    v0.normal.z + (scaled * (v1.normal.z - v0.normal.z)));

                v.light = new Vector3(v0.light.x + (scaled * (v1.light.x - v0.light.x)),
                    v0.light.y + (scaled * (v1.light.y - v0.light.y)),
                    v0.light.z + (scaled * (v1.light.z - v0.light.z)));


                v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                    v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                    v0.world.z + (scaled * (v1.world.z - v0.world.z)));

                v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                    (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                    (v0.color.z + (scaled * (v1.color.z - v0.color.z))));


                if (USE_AXIS_SORT_AND_VECTOR_SNAP) v.world.snap();


                v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)), v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));
                v.light_texture = new Vector2(v0.light_texture.x + (scaled * (v1.light_texture.x - v0.light_texture.x)), v0.light_texture.y + (scaled * (v1.light_texture.y - v0.light_texture.y)));

                npoly.AddVert(v);
            }
        }

        if (npoly.verts.length < 3) return undefined;
        npoly.calcPlane();
        return npoly;
    }

    ClipPolyByPlaneNoSnap(plane, poly) {
        var npoly = new Polygon();
        npoly.CoppyAttribs(this, false);

        for (let i = 0; i < poly.verts.length; i++) {
            var j = (i + 1) % poly.verts.length;
            var v0 = poly.verts[i];
            var v1 = poly.verts[j];
            var res0 = plane.Classify(v0);
            var res1 = plane.Classify(v1);


            if (res0 == COPLANAR) {
                npoly.AddVert(new Vert(v0));
                continue;
            }
            if (res0 == FRONT) {
                npoly.AddVert(new Vert(v0));
            }

            if ((res1 == FRONT && res0 == BACK) || (res0 == FRONT && res1 == BACK)) {
                var aDot = v0.world.dot(plane.normal);
                var bDot = v1.world.dot(plane.normal);
                var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
                var v = new Vert();

                v.alpha = v0.alpha + (scaled * (v1.alpha - v0.alpha));

                v.normal = new Vector3(v0.normal.x + (scaled * (v1.normal.x - v0.normal.x)),
                    v0.normal.y + (scaled * (v1.normal.y - v0.normal.y)),
                    v0.normal.z + (scaled * (v1.normal.z - v0.normal.z)));

                v.light = new Vector3(v0.light.x + (scaled * (v1.light.x - v0.light.x)),
                    v0.light.y + (scaled * (v1.light.y - v0.light.y)),
                    v0.light.z + (scaled * (v1.light.z - v0.light.z)));


                v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                    v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                    v0.world.z + (scaled * (v1.world.z - v0.world.z)));

                v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                    (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                    (v0.color.z + (scaled * (v1.color.z - v0.color.z))));




                v.light_texture = new Vector2(v0.light_texture.x + (scaled * (v1.light_texture.x - v0.light_texture.x)),
                    v0.light_texture.y + (scaled * (v1.light_texture.y - v0.light_texture.y)));

                v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)),
                    v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));

                npoly.AddVert(v);
            }
        }

        if (npoly.verts.length < 3) return undefined;
        npoly.calcPlane();
        return npoly;
    }


    ClipPolyByPlaneNoSnapDebug(plane, poly) {
        var npoly = new Polygon();
        npoly.CoppyAttribs(this, false);
        let help = false;
        for (let i = 0; i < poly.verts.length; i++) {
            var j = (i + 1) % poly.verts.length;
            var v0 = poly.verts[i];
            var v1 = poly.verts[j];
            var res0 = plane.Classify(v0);
            var res1 = plane.Classify(v1);


            if (res0 == COPLANAR) {
                npoly.AddVert(new Vert(v0));
                continue;
            }
            if (res0 == FRONT) {
                npoly.AddVert(new Vert(v0));
            }

            if ((res1 == FRONT && res0 == BACK) || (res0 == FRONT && res1 == BACK)) {
                var aDot = v0.world.dot(plane.normal);
                var bDot = v1.world.dot(plane.normal);
                var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
                var v = new Vert();

                v.alpha = v0.alpha + (scaled * (v1.alpha - v0.alpha));

                v.normal = new Vector3(v0.normal.x + (scaled * (v1.normal.x - v0.normal.x)),
                    v0.normal.y + (scaled * (v1.normal.y - v0.normal.y)),
                    v0.normal.z + (scaled * (v1.normal.z - v0.normal.z)));

                v.light = new Vector3(v0.light.x + (scaled * (v1.light.x - v0.light.x)),
                    v0.light.y + (scaled * (v1.light.y - v0.light.y)),
                    v0.light.z + (scaled * (v1.light.z - v0.light.z)));


                v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                    v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                    v0.world.z + (scaled * (v1.world.z - v0.world.z)));

                v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                    (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                    (v0.color.z + (scaled * (v1.color.z - v0.color.z))));



                help = true;

                v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)), v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));
                v.light_texture = new Vector2(v0.light_texture.x + (scaled * (v1.light_texture.x - v0.light_texture.x)),
                    v0.light_texture.y + (scaled * (v1.light_texture.y - v0.light_texture.y)));

                npoly.AddVert(v);
            }
        }

        if (npoly.verts.length < 3) return undefined;
        npoly.calcPlane();
        return [npoly, help];
    }

    SplitPolyByPlane(plane, add_normal = false) {
        var fpoly = new Polygon();
        var bpoly = new Polygon();

        fpoly.CoppyAttribs(this, false);
        bpoly.CoppyAttribs(this, false);

        for (let i = 0; i < this.verts.length; i++) {
            var j = (i + 1) % this.verts.length;
            var v0 = this.verts[i];
            var v1 = this.verts[j];
            var res0 = plane.Classify(v0);
            var res1 = plane.Classify(v1);


            if (res0 == COPLANAR) {
                fpoly.AddVert(new Vert(v0), true);
                bpoly.AddVert(new Vert(v0), true);
            }

            if (res0 == FRONT) {
                fpoly.AddVert(new Vert(v0), true);
            }

            if (res0 == BACK) {
                bpoly.AddVert(new Vert(v0), true);
            }

            if ((res0 == FRONT && res1 == BACK) || (res1 == FRONT && res0 == BACK)) {
                var aDot = v0.world.dot(plane.normal);
                var bDot = v1.world.dot(plane.normal);
                var scaled = ((-plane.D) - aDot) / ((bDot - aDot));
                var v = new Vert();
                v.alpha = v0.alpha + (scaled * (v1.alpha - v0.alpha));

                v.normal = new Vector3(v0.normal.x + (scaled * (v1.normal.x - v0.normal.x)),
                    v0.normal.y + (scaled * (v1.normal.y - v0.normal.y)),
                    v0.normal.z + (scaled * (v1.normal.z - v0.normal.z)));

                v.light = new Vector3(v0.light.x + (scaled * (v1.light.x - v0.light.x)),
                    v0.light.y + (scaled * (v1.light.y - v0.light.y)),
                    v0.light.z + (scaled * (v1.light.z - v0.light.z)));


                v.world = new Vector3(v0.world.x + (scaled * (v1.world.x - v0.world.x)),
                    v0.world.y + (scaled * (v1.world.y - v0.world.y)),
                    v0.world.z + (scaled * (v1.world.z - v0.world.z)));

                v.color = new Vector3((v0.color.x + (scaled * (v1.color.x - v0.color.x))),
                    (v0.color.y + (scaled * (v1.color.y - v0.color.y))),
                    (v0.color.z + (scaled * (v1.color.z - v0.color.z))));


                v.light_texture = new Vector2(v0.light_texture.x + (scaled * (v1.light_texture.x - v0.light_texture.x)),
                    v0.light_texture.y + (scaled * (v1.light_texture.y - v0.light_texture.y)));

                v.texture = new Vector2(v0.texture.x + (scaled * (v1.texture.x - v0.texture.x)), v0.texture.y + (scaled * (v1.texture.y - v0.texture.y)));
                if (USE_AXIS_SORT_AND_VECTOR_SNAP) v.world.snap();

                fpoly.AddVert(new Vert(v), true);
                bpoly.AddVert(new Vert(v), true);
            }
        }




        if (fpoly.verts.length < 3) fpoly = null;
        else { fpoly.calcPlane(); fpoly.SetNormalColor(0, 1, 0); }

        if (bpoly.verts.length < 3) bpoly = null;
        else { bpoly.calcPlane(); bpoly.SetNormalColor(1, 0, 0); }

        return [fpoly, bpoly];
    }

    ClipByFrustum(frustum) {

        var p = this;
        var res = this.ClassifyByFrustum(frustum); //Hakki
        if (res == BACK) return [undefined, -1];
        if (res == FRONT) return [p, 0];

        var clip = 0;
        for (let i = 0; i < frustum.planes.length; i++) {
            if (frustum.planes[i].Classify(p) == SPANNING) {

                var p2 = this.ClipPolyByPlaneNoSnap(frustum.planes[i], p);
                if (p2 != undefined) p = p2;
                clip = 1;
            }
        }
        return [p, clip];
    }

    CalcLightMapParm(vscale = 1.0) {
        const ali = this.plane.GetAlignement();

        let umin = Infinity;
        let umax = -Infinity;
        let vmin = Infinity;
        let vmax = -Infinity;

        // Bounding Box im UV-Raum bestimmen
        for (const v of this.vertices) {
            switch (ali) {
                case XAXIS: // YZ
                    umin = Math.min(umin, v.world.y);
                    umax = Math.max(umax, v.world.y);

                    vmin = Math.min(vmin, v.world.z);
                    vmax = Math.max(vmax, v.world.z);
                    break;

                case YAXIS: // XZ
                    umin = Math.min(umin, v.world.x);
                    umax = Math.max(umax, v.world.x);

                    vmin = Math.min(vmin, v.world.z);
                    vmax = Math.max(vmax, v.world.z);
                    break;

                case ZAXIS: // XY
                    umin = Math.min(umin, v.world.x);
                    umax = Math.max(umax, v.world.x);

                    vmin = Math.min(vmin, v.world.y);
                    vmax = Math.max(vmax, v.world.y);
                    break;
            }
        }

        // WICHTIG:
        // Die Weltkoordinaten werden NICHT skaliert!
        const u0 = umin;
        const u1 = umax;
        const v0 = vmin;
        const v1 = vmax;

        const n = this.plane.normal;
        const d = this.plane.D;

        let p00, p10, p01;

        switch (ali) {
            //---------------------------------------------------
            // Dominante X-Achse -> Projektion auf YZ
            //---------------------------------------------------
            case XAXIS:
                {
                    const x00 = -(n.y * u0 + n.z * v0 + d) / n.x;
                    const x10 = -(n.y * u1 + n.z * v0 + d) / n.x;
                    const x01 = -(n.y * u0 + n.z * v1 + d) / n.x;

                    p00 = new Vector3(x00, u0, v0);
                    p10 = new Vector3(x10, u1, v0);
                    p01 = new Vector3(x01, u0, v1);
                    break;
                }

            //---------------------------------------------------
            // Dominante Y-Achse -> Projektion auf XZ
            //---------------------------------------------------
            case YAXIS:
                {
                    const y00 = -(n.x * u0 + n.z * v0 + d) / n.y;
                    const y10 = -(n.x * u1 + n.z * v0 + d) / n.y;
                    const y01 = -(n.x * u0 + n.z * v1 + d) / n.y;

                    p00 = new Vector3(u0, y00, v0);
                    p10 = new Vector3(u1, y10, v0);
                    p01 = new Vector3(u0, y01, v1);
                    break;
                }

            //---------------------------------------------------
            // Dominante Z-Achse -> Projektion auf XY
            //---------------------------------------------------
            case ZAXIS:
                {
                    const z00 = -(n.x * u0 + n.y * v0 + d) / n.z;
                    const z10 = -(n.x * u1 + n.y * v0 + d) / n.z;
                    const z01 = -(n.x * u0 + n.y * v1 + d) / n.z;

                    p00 = new Vector3(u0, v0, z00);
                    p10 = new Vector3(u1, v0, z10);
                    p01 = new Vector3(u0, v1, z01);
                    break;
                }
        }

        this.m_uvvector = p00;
        this.m_edge1 = p10.sub(p00);
        this.m_edge2 = p01.sub(p00);
    }



    get edge1() { return this.m_edge1; }
    get edge2() { return this.m_edge2; }

    set edge1(a) { this.m_edge1.x = a.x; this.m_edge1.y = a.y; this.m_edge1.z = a.z; }
    set edge2(a) { this.m_edge2.x = a.x; this.m_edge2.y = a.y; this.m_edge2.z = a.z; }



    RayPolygonDistance(start, end) {

        let ray = new Ray(start, end);
        let o = this.plane.intersect(ray);
        if (!o[0]) return -1;
        let t = Math.abs(o[1]);


        let np = ray.normal.mul(t).add(ray.origin);
        if (!this.PointInPolygon(np)) return -1;
        return t;
    }

    RayPolygonDistance2(ray) {


        let t = this.plane.intersect(ray);
        if (t == -1) return -1;

        let np = ray.normal.mul(t).add(ray.origin);
        if (!this.PointInPolygon(np)) return -1;
        return t;
    }


    PointInPolygon(point) {
        const n = this.plane.normal;
        const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);

        // Achse mit größter Normalen-Komponente weglassen -> beste 2D-Projektion
        let u, v;
        if (ax >= ay && ax >= az) {
            u = 'y'; v = 'z';
        } else if (ay >= ax && ay >= az) {
            u = 'x'; v = 'z';
        } else {
            u = 'x'; v = 'y';
        }

        const px = point[u], py = point[v];
        let inside = false;
        const n_verts = this.vertices.length;

        for (let i = 0, j = n_verts - 1; i < n_verts; j = i++) {
            const vi = this.vertices[i].world;
            const vj = this.vertices[j].world;

            const xi = vi[u], yi = vi[v];
            const xj = vj[u], yj = vj[v];

            const intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }

    SegmentPolygonDistance(start, end) {
        const ray = new Ray(start, end);
        const o = this.plane.intersect(ray);
        if (!o[0]) return -1; // parallel zur Ebene oder kein Schnitt

        const t = o[1]; // Achtung: KEIN Math.abs()!

        // Schnittpunkt muss zwischen start (t=0) und end (t=segmentLength) liegen
        const segmentLength = end.sub(start).length();

        if (t < -1e-6 || t > segmentLength + 1e-6) return -1;

        const hitPoint = ray.normal.mul(t).add(start);

        if (!this.PointInPolygon(hitPoint)) return -1;

        return t; // Distanz von start bis zum Treffpunkt
    }




}
class IndexedObject extends PrimitiveBase {
    constructor(a = undefined, b = undefined, indecesPerPolygon = 0) {
        super();
        this._planes = new Array();
        this._verts = new Array();
        this._indices = new Int32Array();
        this._ipp = indecesPerPolygon;
        this._recal_center = true;

        if (a instanceof IndexedObject && Int32Array.isArray(b)) {
        }


        if (Array.isArray(b) && Int32Array.isArray(b)) {
            if (a[0] instanceof Vert) {
                this._indices.set(b);
                for (let i = 0; i < a.length(); i++) {
                    this._verts.push(new Vert(a[i]));
                }
                return;
            }

            if (a[0] instanceof Vector3) {
                this._indices.set(b);
                for (let i = 0; i < a.length(); i++) {
                    this._verts.push(new Vert(a[i]));
                }
                return;
            }


        }


    }


    get planes() { return this._planes; }
    get vertices() { return this._verts; }
    get indices() { return this._indices; }
    get ipp() { return this._ipp; }

    calcCenterOfMass() {

        if (!this._recal_center && this._verts.length < 3) return this._plane;
        this._center = new Vector3(this._verts.world);
        this._recal_center = false;


        for (let i = 1; i < this._verts.length; i++) {
            this._center = this._center.add(this._verts[i].world);
        }
        var m = 1.0 / this._verts.length;
        this._center = this._center.mul(m);
        return this._center;
    }

    TransformByObjectMatrix() {
        var p = new IndexedObject();
        var matrix = this.GetObjectMatrix();;

        for (let i = 0; i < this.vertices.length; i++) {
            var w = new Vert(this.vertices[i]);
            var h = matrix.concat(w.world);
            w.world.x = h.x;
            w.world.y = h.y;
            w.world.z = h.z;

            p.AddVert(w);
        }

        p.calcCenterOfMass();
        p.calcPlanes();
        return p;
    }



}