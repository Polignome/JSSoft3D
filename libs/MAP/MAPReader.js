const PARSER_NO_ERRORS = 1
const PARSER_MULTI_LINE_COMMENT_ERROR = -1
const PARSER_DEPTH_ERROR = -2
const PARSER_PARAMETER_ERROR = -3
const PARSER_ENTRY_NULL_ERROR = -4
const PARSER_SYNTAX_ERROR = -5

const PARSER_FACE_V1_ERROR = -6
const PARSER_FACE_V2_ERROR = -7
const PARSER_FACE_V3_ERROR = -8

const PARSER_TEXTINFO_1_ERROR = -9
const PARSER_TEXTINFO_2_ERROR = -10

const PARSER_TEXTINFO_3_ERROR = -11
const PARSER_TEXTINFO_4_ERROR = -12
const PARSER_TEXTINFO_5_ERROR = -13
const PARSER_ILLEGAL_BRUSH_ERROR = -14

function rgbToGray(r,g,b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function normalToColor(normal,r=1,g=1,b=1,togray=false) {
  let rgb=new Vector3(0.5+normal.x*0.5,0.5+normal.y*0.5,0.5+normal.z*0.5);
  if (togray ===false) return rgb;
  let f=rgbToGray(rgb.x,rgb.y,rgb.z);
  
  rgb.x=f*r;
  rgb.y=f*g;
  rgb.z=f*b;
  return rgb;
}

 function isString(ss) {
    var s2=""
    var i=0;
    if (ss.charAt(0)=='"' && ss.charAt(ss.length-1)=='"') {
        ss=ss.slice(1,ss.length-1);
        return ss;
    }
        
    return "";
 }



function isTrible(ss) {
    var e=new Array();

    if (ss.charAt(0)=='(' && ss.charAt(ss.length-1)==')') {
        ss=ss.slice(1,ss.length-1);
    } else e;
    
    var i=0;
    var s="";
    for (i=0;i<ss.length;i++) {
      if (ss.charAt(i)==' ') 
      { 
         if (s.length>0) {
            e.push(parseFloat(s));
            s="";
         } 
      }  else s+=ss.charAt(i);
    }
   if (s.length>0) e.push(parseFloat(s));
    
   if (e.length!=3) return null;
   return new Vector3(parseFloat(e[0]),parseFloat(e[1]),parseFloat(e[2]))
   
   
}

function isTruble(ss) {
    var e=new Array();

    if (ss.charAt(0)=='[' && ss.charAt(ss.length-1)==']') {
        ss=ss.slice(1,ss.length-1);
    } else e;
    
    var i=0;
    var s="";
    for (i=0;i<ss.length;i++) {
      if (ss.charAt(i)==' ') 
      { 
         if (s.length>0) {
            e.push(parseFloat(s));
            s="";
         } 
      }  else s+=ss.charAt(i);
    }
   if (s.length>0) e.push(parseFloat(s));
    
   if (e.length!=4) return null;
   return new Vector4(parseFloat(e[0]),parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]))
}



class Parameter {
   constructor(name,value)
   {
    this.name=name;
    this.value=value;
   }
}

class MAPEntry {
     constructor() {  
        this.classname ="";
        this.params= new Array();
        this.bush_list = new Array();
        this.worldspan=false;
        this.light=false;
        this.light_color=null;
        this.light_orgin=null;
    }
    
    isWorldSpan() {
        return this.worldspan;
    }

    isLight() {
        if (!this.light) return false;
        if (this.light_color!=null || this.light_orgin!=null) return true;

        for (let i=0;i<this.params.length;i++) {
          if (this.params[i].name=="_light") {
            this.light_color=isTruble("[ "+this.params[i].value+" ]");
          }

          if (this.params[i].name=="origin") {
            this.light_orgin=isTrible("( "+this.params[i].value+" )");
            if (this.light_orgin!=null) this.light_orgin.swap("yz");
          }

        }
        if (this.light_color==null || this.light_orgin==null) this.light=false;
        return this.light;

    }
    SetName(name) {
       this.classname =name;
    }
    AddParam(name,value) {
    const a="worldspawn";
    const b="light";
    
       if (name==="classname")
       {
        this.classname=value;  
        
        if (this.classname== "worldspawn") this.worldspan=true; 
        if (this.classname== "light")    this.light=true; 
       }
       this.params.push(new Parameter(name,value));
    }

    AddBrush(brush) {
        this.bush_list.push(brush);
      //  console.log(brush.toStr());
       // console.log("Add Brush To :'" + this.classname+"' Brush has "+brush.GetNumFaces());
    }
}


class Map {
    constructor() {  
        this.map_entrys= new Array();
    }
    
    AddEntry(entry) {
        this.map_entrys.push(entry)

    }

   GetBrushList() {
        const brush_list=[];

       for (let i=0;i<this.map_entrys.length;i++)     
       {
        var entry=this.map_entrys[i];
        

        if (entry.isLight())  {
           continue;   
        }
  
        for (let j=0;j<entry.bush_list.length;j++)
        {
         
         const brush= entry.bush_list[j];
         brush.BuildFaces();   
         brush_list.push(brush);        
        }
      }
       return brush_list;

   }

    ConvertToPolygonlist(scale =0.05) {

 let help =0;
        const polys=[];

       for (let i=0;i<this.map_entrys.length;i++)     
       {
        var entry=this.map_entrys[i];
        

        if (entry.isLight())  {
           continue;   
        }

        //if (entry.isWorldSpan())
        for (let j=0;j<entry.bush_list.length;j++)
        {
         const brush= entry.bush_list[j];
         brush.BuildFaces();   
         console.log("BRUSH ["+help+"] "+brush.face_list.length+"\n");help++;
         
         for (let f of brush.face_list)
         {
           
           let vv=[]
           for (let ii= f.verts.length-1;ii>-1;ii--) vv.push(f.verts[ii].mul(scale));
           let p= new Polygon(vv);
           p.calcPlane();
           p.calcCenterOfMass();
           //p.setPlanarTexture();
           p.setWorldTexture(0.25,0.25);
           
           p.SetNormalColor();
           p.render_type=POLY_PERSPECTIVE_TEXTURED;
           polys.push(p);
         }
        
        }
      }
       return polys;
      }
}

class MAPParser {
    
     constructor() {  
        this.strings_lines =  new Array();
        this.line_index=0;
        this.string_index=0;
        this.depth=0;  // depth of {}
        this.map = new Map;
     } 
 
 
DebugOut() {
    var l=0;

    for (l=0;l<this.strings_lines.length;l++)
    {
        var k=0;
        var s="";
        for (k=0;k<this.strings_lines[l].length;k++)
        {
            s+="_"+this.strings_lines[l][k];
        }
        console.log ("Line: "+l+": "+s);
    }
}
 
    SplitString(s)  {
        this.strings_lines =  new Array();
        var line =  new Array();
        var ss="";
        var c='';
        var cc="";
        var line_comment=false;
        var multi_line_comment=false;
        var parm='';
        console.clear();
        this.line_index=0;
        this.string_index=0;
        this.depth=0;
        
        for (var i=0;i<s.length;i++)
        {
            c=s.charAt(i);
            if (i+1<s.length) {
                cc=c+s.charAt(i+1);
            } else cc=c;
             
                         

            if (c=='\n' && !multi_line_comment) {line_comment=false;}
            if (cc=="//" && !line_comment && !multi_line_comment)  {line_comment= true;}
            if (cc=="/*" && !line_comment && !multi_line_comment)  multi_line_comment= true;
            if (cc=="*/" && !line_comment) 
            {
                if (! multi_line_comment)  return PARSER_MULTI_LINE_COMMENT_ERROR;
                    multi_line_comment=false;
                    i++;
                 continue;
            } 
            
            if (line_comment || multi_line_comment) continue;
            
            if ( parm == '' ) {
               if (c=='(' || c=='"' || c=='[')  parm=c;
            } else {
               if (c==')' && parm=='(')  parm='';
               if (c=='"' && parm=='"')  parm='';
               if (c==']' && parm=='[')  parm='';

            }
            
            if (c=='\n' || (c==' ' && parm=='') ) {

                if (ss.length!=0) {line.push(ss);}
                if (c=='\n') {
   
                    if (line.length>0) 
                        this.strings_lines.push(line);
                    line =  new Array();
                }
                ss="";
                continue;                
            } else ss+=c;
             
        }
       
        if (ss.length>0) line.push(ss);
        if (line.length>0 ) this.strings_lines.push(line);
        if (parm!='') return PARSER_PARAMETER_ERROR;
         
      
      
        // this.DebugOut();
       return PARSER_NO_ERRORS;
    
}
  
GetString() {
  if (this.line_index>=this.strings_lines.length) return "";


  var s=this.strings_lines[this.line_index][this.string_index];
  this.string_index+=1;
  if (this.string_index>=this.strings_lines[this.line_index].length)
  {
    this.string_index=0;
    this.line_index+=1;
  }
   return s;

}

 isString(ss) {
    var s2=""
    var i=0;
    if (ss.charAt(0)=='"' && ss.charAt(ss.length-1)=='"') {
        ss=ss.slice(1,ss.length-1);
        return ss;
    }
        
    return "";
 }


isTrible(ss) {
    var e=new Array();

    if (ss.charAt(0)=='(' && ss.charAt(ss.length-1)==')') {
        ss=ss.slice(1,ss.length-1);
    } else e;
    
    var i=0;
    var s="";
    for (i=0;i<ss.length;i++) {
      if (ss.charAt(i)==' ') 
      { 
         if (s.length>0) {
            e.push(parseFloat(s));
            s="";
         } 
      }  else s+=ss.charAt(i);
    }
   if (s.length>0) e.push(parseFloat(s));
    
   if (e.length!=3) return null;
   return new Vector3(parseFloat(e[0]),parseFloat(e[1]),parseFloat(e[2]))
   
   
}

isTruble(ss) {
    var e=new Array();

    if (ss.charAt(0)=='[' && ss.charAt(ss.length-1)==']') {
        ss=ss.slice(1,ss.length-1);
    } else e;
    
    var i=0;
    var s="";
    for (i=0;i<ss.length;i++) {
      if (ss.charAt(i)==' ') 
      { 
         if (s.length>0) {
            e.push(parseFloat(s));
            s="";
         } 
      }  else s+=ss.charAt(i);
    }
   if (s.length>0) e.push(parseFloat(s));
    
   if (e.length!=4) return null;
   return new Vector4(parseFloat(e[0]),parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]))
}



ParseBrush(c,entry) {
    let ss=c;
    if (ss!="{") return PARSER_SYNTAX_ERROR;
    if (entry==null) return PARSER_SYNTAX_ERROR;

    let brush= new Brush();
    while (ss!="")   {
        ss = this.GetString();
      
        if (ss=="}") {
            if (brush.face_list.length<5) return PARSER_ILLEGAL_BRUSH_ERROR;
            brush.BuildFaces();
            entry.AddBrush(brush);
            return PARSER_NO_ERRORS;
        } 
        if (ss.charAt(0)=='(') 
        {
          var face1=this.isTrible(ss);                 if (face1==null) return PARSER_FACE_V1_ERROR;
          var face2=this.isTrible(this.GetString());   if (face2==null) return PARSER_FACE_V1_ERROR;
          var face3=this.isTrible(this.GetString());   if (face3==null) return PARSER_FACE_V1_ERROR;
        
          var tex_name=this.GetString();          if (tex_name=="") return PARSER_FACE_V1_ERROR;
        
          var tex_info_1=this.isTruble(this.GetString());  if (tex_info_1==null) return PARSER_TEXTINFO_1_ERROR;
          var tex_info_2=this.isTruble(this.GetString());  if (tex_info_2==null) return PARSER_TEXTINFO_2_ERROR;
        
          var tex_rot     =parseFloat(this.GetString()); if (tex_rot==NaN) return PARSER_TEXTINFO_3_ERROR;
          var tex_scale_u =parseFloat(this.GetString()); if (tex_scale_u==NaN) return PARSER_TEXTINFO_4_ERROR;
          var tex_scale_v =parseFloat(this.GetString()); if (tex_scale_v==NaN) return PARSER_TEXTINFO_5_ERROR;
          brush.AddFace(new BrusFace(face1,face2,face3,tex_name,tex_info_1,tex_info_2,new Vector3(tex_rot,tex_scale_u,tex_scale_v),"yz"));     
        continue;
       } 
     return PARSER_SYNTAX_ERROR;
    }

    return PARSER_SYNTAX_ERROR;
   
}

ParseEntry(c)
{
    let ss=c;
    if (ss!="{") return PARSER_SYNTAX_ERROR;
    const entry= new MAPEntry();
    

    while (ss!="")   {
        ss = this.GetString();
       
        if (ss=="{") {
            let err=this.ParseBrush(ss,entry);  
            if (err != PARSER_NO_ERRORS) return err;
            continue;

        }
       
       
        if (ss=="}") {
            this.map.AddEntry(entry);
            return PARSER_NO_ERRORS;
        }
        

      var ss1=this.isString(ss);
     
      if (ss1!="" && ss1!=undefined) 
      {
        var ss2=this.GetString();
        ss2=this.isString(ss2);
        if (ss2=="" && ss2!=undefined) return PARSER_PARAMETER_ERROR;
        entry.AddParam(ss1,ss2);
  
    }



    }
    
    return PARSER_SYNTAX_ERROR;
    
}


ParseMap() {
    var ss=this.GetString();
    var classname="classname";   
     
    while (ss!="")  
    {
        if (ss!="{") return PARSER_SYNTAX_ERROR;
        let err=this.ParseEntry(ss);
        if (err!=PARSER_NO_ERRORS) return err;
        ss=this.GetString();  
        
    
      }
  return PARSER_NO_ERRORS;
   
  
}


LoadMapFromString(s) {
        this.map = new Map;
        var error=this.SplitString(s);
       if (error != PARSER_NO_ERRORS) {
        DebugOut("Parser Error "+error+"\n");
        return null;
       }
       var err=this.ParseMap(null);

       if (error != PARSER_NO_ERRORS) {
        DebugOut("Parser Error "+error+"\n");
        return null;
       }
        DebugOut("No Errors \n");
         
       return this.map;
    }
};