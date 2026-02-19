


const CSG_BACK_LEAF  =-1;
const CSG_NONE_LEAF   =0;
const CSG_FRONT_LEAF =1;
const CSG_SOLID_SPACE_LEAVE =1
const CSG_NONE_SOLID_SPACE_LEAVE =2

class CSGNode 
{
    constructor(planes=null) {
        this._front=null;
        this._back=null;
        this._leaf=CSG_NONE_LEAF;
        this._plane=null;
        if (planes != null) this.BuildUnion(planes,planes.length);
    }

    GetDeepestNodeCount(c = 1) {
      let depth=c; 
        
      if (this._front) depth=Math.max(depth,this.m_front.GetDeepestNodeCount(c+1))
      if (this._back) depth=Math.max(depth,this.m_back.GetDeepestNodeCount(c+1))
      return depth;
    }


    BuildUnion(planes, index)
    {
      
       this._plane = new Ray( planes[index]);
       this._front = new CSGNode();
       this._front._leaf = CSG_SOLID_SPACE_LEAVE;
       this._back = new CSGNode();
      
      
    
      if( index===0) {
        this._back._leaf = CSG_NONE_SOLID_SPACE_LEAVE;
        return;
      }
      this._back.BuildUnion(planes, index - 1)
    }


    ClipUnion(pl,strong) 
    {

      if (this._leaf === CSG_NONE_SOLID_SPACE_LEAVE) return new Array();
      if (this._leaf === CSG_SOLID_SPACE_LEAVE) return  pl;
      let fl=new Array();
      let bl=new Array(); 
      
      
      for (let p of pl)
      {
          let result = this._plane.Classify(p);
          if (result === FRONT) {fl.push(new Polygon(p)); continue;}
          if (result === BACK) {bl.push(new Polygon(p)); continue;}
          if (result === SPANNING) {
            let r=p.SplitPolyByPlane(this._plane)
            if (r[0]!=null) { r[0].SetColor(1,0,0); fl.push(r[0]); }
            if (r[1]!=null) { r[1].SetColor(0,1,0); bl.push(r[1]); }
            continue;
          }
          if (result === COPLANAR)
          {
            if (this._plane.normal.dot(p.plane.normal)>=-Math.E ) 
            {
              if (strong) {fl.push(new Polygon(p)); fl[fl.length-1].SetColor(0,0,1);} else {
                bl.push(new Polygon(p));
                bl[bl.length-1].SetColor(0,1,1);
               }
            } else { bl.push(new Polygon(p));  bl[bl.length-1].SetColor(0,1,1);}
            
            continue;
        }         
         
       }

      var out=new Array();

      if (fl.length > 0)  fl=this._front.ClipUnion(fl, strong);
      if (bl.length > 0)  bl=this._back.ClipUnion(bl, strong);
      
      for (let i=0;i<fl.length;i++) out.push(new Polygon(fl[i]));
      for (let i=0;i<bl.length;i++) out.push(new Polygon(bl[i]));
      
     

      return out;
    }



    
}



class CSGTree {

      constructor(planes) {
        this._root=null;
        if (planes != null) this.Build(planes);
      }


      Build(planes) {
        if (planes===null) return;
        
          this._root=new CSGNode(planes);
      }
      
      ClipUnion(pl,strong) {
         if (this._root===null) return;
         return this._root.ClipUnion(pl,strong);

      }

}


class CSG {
     static union(brush_list) {
       for (let i = 0;i<brush_list.length;i++)
       {
          let a= brush_list[i];
          for (let j = 0/*i+1*/;j<brush_list.length;j++)
          {
             if (i===j) continue;
             let b= brush_list[j];
             if (!b._aabb.IntersectedByBounds(a._aabb,0)) continue;
             
             
             a.clip( b, false);
             
             b.clip( a, true);
          } 
        
       }
   }

}