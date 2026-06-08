
class BrushOCTreeNode extends AABB {
    constructor(brush_list, aabb, depth = 0, max_depth = 4, max_obj_in_node = 1) {
        super(aabb);
        this.depth = depth;
        this._brush_list = [];
        this._nodes = [];

        for (let brush of brush_list) {

            if (this.IntersectedByBounds(brush._aabb) || (this.PointInside(brush._aabb.min) && this.PointInside(brush._aabb.max))) this._brush_list.push(brush);

        }
        // console.log("Depth",depth,"Min:",this.min.x,this.min.y,this.min.z,"Max:",this.max.x,this.max.y,this.max.z,"Num ",this._brush_list.length)
        if (this._brush_list.length <= max_obj_in_node) return;


        if (depth + 1 > max_depth) return;

        let aabb_list = this.subdivide();
        for (let a of aabb_list) {
            let node = new BrushOCTreeNode(this._brush_list, a, depth + 1, max_depth, max_obj_in_node)
            //if (node._brush_list.length<=0) this._nodes.push(null); else this._nodes.push(node); 
            if (node._brush_list.length > 0) this._nodes.push(node);

        }
    }


    render(engine) {
        if (this._nodes.length <= 0) {
            let polys = this.BuildPolygons();

            if (!engine.frustum.intersectsAABB(this)) return;
            const color = new Vector3(0, 255, 0);
            for (let p of polys) {
                engine.DrawPolyLined(p, color);
            }

            return;
        }
        for (let n of this._nodes)
            if (n != null) n.render(engine);

    }




}


class PolyOCTreeNode extends AABB {
    constructor(poly_list, aabb, depth = 0, max_depth = 4, max_obj_in_node = 4) {
        super(aabb);
        this.depth = depth;
        this._poly_list = [];
        this._nodes = [];
        this.leaf = false;


        for (let poly of poly_list) {

            let aabb = new AABB(poly.verts)
            if (this.IntersectedByBounds(aabb) || (this.PointInside(aabb.min) && this.PointInside(abb.max))) this._poly_list.push(poly);

        }
        // console.log("Depth",depth,"Min:",this.min.x,this.min.y,this.min.z,"Max:",this.max.x,this.max.y,this.max.z,"Num ",this._brush_list.length)
        if (this._poly_list.length <= max_obj_in_node || (depth + 1 > max_depth)) {

            return;
        }




        let aabb_list = this.subdivide();

        for (let a of aabb_list) {
            let node = new PolyOCTreeNode(this._poly_list, a, depth + 1, max_depth, max_obj_in_node)
            if (node._poly_list.length > 0) {
                this._nodes.push(node);
            }
        }
        if (this._nodes.length > 0) this._poly_list = []; else this.leaf = true;
    }

}




class BrushOCTree {
    constructor(brush_list) {
        const aabb = new AABB();
        for (let brush of brush_list) {
            aabb.Add(brush.primitives);
        }
        aabb.MakeCube();
        this._root = new BrushOCTreeNode(brush_list, aabb)


    }

    render(engine) {



        if (this._root === null) return;
        this._root.render(engine);

        return true;
    }

}




