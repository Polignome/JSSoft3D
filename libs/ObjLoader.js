

class OBJLoader {

    static parseFromString(text) {

        const texture = [];
        const positions = [];
        const faces = [];

        const lines = text.split('\n');

        for (let line of lines) {

            line = line.trim();
            if (!line || line[0] === '#') continue;

            const p = line.split(/\s+/);
      
            if (p[0] === 'v') {
                positions.push([
                    parseFloat(p[1]),
                    parseFloat(p[2]),
                    parseFloat(p[3])
                ]);
            }

            if (p[0] === 'vt') {
                texture.push([
                    parseFloat(p[1]),
                    parseFloat(p[2])
                ]);
            }

            else if (p[0] === 'f') {

                const ids = [];

                for (let i = 1; i < p.length; i++) {
                    const v = p[i].split('/');
                    ids.push(parseInt(v[0]) - 1);
                   
                }

                // triangulate fan
                for (let i = 1; i < ids.length - 1; i++) {
                    faces.push([ ids[0], ids[i], ids[i+1] ]);
                }
            }
        }

        return { positions, faces, texture };
    }



    static buildPolygons(obj, scale = 1) {

        const polys = [];
        const bounds = new AABB();

        bounds.reset();

        for (const f of obj.faces) {

            const p0 = obj.positions[f[0]];
            const p1 = obj.positions[f[1]];
            const p2 = obj.positions[f[2]];

            const t0 = obj.texture[f[0]];
            const t1 = obj.texture[f[1]];
            const t2 = obj.texture[f[2]];

            //   console.log("Add f", p0[0] * scale, p0[1] * scale, p0[2] * scale)

            const v0 = new Vector3((p0[0] * scale),( p0[1] * scale), (p0[2] * scale));
            const v1 = new Vector3((p1[0] * scale),( p1[1] * scale), (p1[2] * scale));
            const v2 = new Vector3((p2[0] * scale),( p2[1] * scale), (p2[2] * scale));
           
            const vv=new Array(v0,v1,v2);
           
            let poly = new Polygon(vv);
            poly.verts[0].texture.x=t0[0];
            poly.verts[0].texture.y=t0[1];
            poly.verts[1].texture.x=t1[0];
            poly.verts[1].texture.y=t1[1];
            poly.verts[2].texture.x=t2[0];
            poly.verts[2].texture.y=t2[1];
            poly.render_type=POLY_PERSPECTIVE_TEXTURED;
            
              poly.calcPlane(); 
           //  poly.setPlanarTexture();
             poly.setWorldTexture();


              //poly.setWorldTexture();
	          poly.SetNormalColor(1,1,1); 
              polys.push(poly);
              
              /*
              for (const v of poly.verts)
              {
                console.log(v.world.x,v.world.y,v.world.z,"  ",(v.color.x*255)|0,(v.color.y*255)|0,(v.color.z*255)|0)
              }
                */

        }

        return polys;
    }


    static async loadFromURL(url, scale = 1.0) {
        const res  = await fetch(url);
        const text = await res.text();
        const obj  = OBJLoader.parseFromString(text);
        return OBJLoader.buildPolygons(obj, scale);
    }
}
