

const  HUF_ROOT_NODE = 1<<1;
const  HUF_LEAF_NODE = 1<<2;
const  HUF_LEFT_NODE = 1<<3;
const  HUF_RIGHT_NODE = 1<<4;

class DictionaryElment {
    constructor(element,count=0) {
      if (typeof element === "number" && typeof count === "number")
      {  
        this._element=element;
        this._count=count;
        return;
      }
      this._element=0;
      this._count=0;
    }

    increment() {
      this._count++;
    } 

    get element() {return this._element;}
    get count() {return this._count;}

    set element(a) {this._element=a;}
    set count(a) {this._count=a;}

};

class DictionaryNode extends DictionaryElment {
    constructor(element,count=0) {
      super(element,count);  
      this._bit=new BitStream();
      this._parent=null;

   
       
      if (element instanceof DictionaryNode && count instanceof DictionaryNode ) {
            this.count=element.count+count.count;
            this._node_a=element;
            this._node_b=count;
            this._node_a.setParent(this);
            this._node_b.setParent(this);
            return; 
        }
        
        this._node_a=null;
        this._node_b=null;
    }

    setParent(node) {this._parent=node;}
    isLeaf() {return this._node_a==null && this._node_b==null;}
    Debug() 
    {
      DebugOut("Element :"+this.element+" Count :"+this.count+" Bit : "+this._bit.toStr()+"\n");
      if (this._node_a) this._node_a.Debug();
      if (this._node_b) this._node_b.Debug();
    }
};





class Dictionary {
   constructor(input=null) {
         this._dictionary = new Array();
         this._dictionary_tree = null;

         if (input instanceof Dictionary) 
         {
          
          for (let d=0;d<input._dictionary.length;d++)    
           {
            let dd=input._dictionary[d];   
          
               this._dictionary.push(new DictionaryNode(dd.element,dd.count));
            
           }
              this.BuildTree();
           return;
        }

        for (let i=0;i<256;i++) this._dictionary.push(new DictionaryNode(i));
      }
     

    InitByArray(data) {
        this._dictionary = new Array();
        this._dictionary_tree = null;
        for (let i=0;i<256;i++) this._dictionary.push(new DictionaryNode(i,data[i]));
        this.BuildTree();
    } 

    AddDataToDictionary(data) {
        for (let i=0;i<data.length;i++) {
          let index=data.charCodeAt(i);
          if (index>=0 && index <=255)this._dictionary[index].increment();
        }
     }

    asciiToChar(code) {
       if (typeof code !== 'number' || !Number.isInteger(code) || code < 0 || code > 65535) {
        return null;
      }
      return String.fromCharCode(code);
    }
     
    BuildBitStream(node,biti) 
    {
         if (node._node_a==null && node._node_b==null) {
             node._bit=new BitStream(biti);    
             return;
         }
         
        if (node._node_a){
          let bit=new BitStream(biti);
          bit.SetAndShiftBit(0);
          this.BuildBitStream(node._node_a,bit);   
          
        } 
        if (node._node_b) {
          let bit=new BitStream(biti);
          bit.SetAndShiftBit(1);
          this.BuildBitStream(node._node_b,bit);
        
        }
        
    }

     BuildTreeRec() {
          if (this._dictionary_tree.length<2) return this._dictionary_tree[0];
          let node= new DictionaryNode(this._dictionary_tree[0],this._dictionary_tree[1]);
          this._dictionary_tree.splice(0, 2);
          this._dictionary_tree.push(node);
          this._dictionary_tree.sort(function(a,b){return (a.count< b.count);})
          return this.BuildTreeRec();

     }

      BuildTree() {
          this._dictionary_tree=new Array();
          for (let d of this._dictionary) {
            if (d.count>0) this._dictionary_tree.push(d);
          }
          this._dictionary_tree.sort(function(a,b){return (a.count < b.count);})
          this._dictionary_tree=this.BuildTreeRec();
          let st = new BitStream();
          this.BuildBitStream(this._dictionary_tree,st);
     }
  
     encode(data) {
        let bitstream= new BitStream();
        for (let i =0;i<data.length;i++) {
          let index=data.charCodeAt(i);
          if (index>=0 && index <=255)
             bitstream.SetAndShiftBit(this._dictionary[index]._bit);
          
            
          
        }
        return bitstream;
    }

    decode(s) {
       let go=this._dictionary_tree;
       let out="";
//       alert(s)
       for (let i=0;i<s.GetLength();i++)
       {
           if (s.GetBit(i)) {
               go=go._node_b;
           } else go=go._node_a;
       
          if (go.isLeaf()) {
              out+=this.asciiToChar(go.element);
              go=this._dictionary_tree;
          }
       }
       return out;
    }


 }


//|  Type     | index              | Elements  |
//+-----------+--------------------+-----------+
// Dictionary | 0..255             |    256    |
// Num Files  | 256                |     1     |
// Filesize   | 257->257+Numfiles  | Numfiles  |
class Archive 
{
  constructor(data =null) 
  {
    this._dictionary = null;
    this._entrys=new Array();
    
   if (data) {
    this._dictionary = new Dictionary();
    this._dictionary.InitByArray(data);
   
    let index=256;
    let num_files=data[index]; index++;
    
    let FileSegOffset=257+num_files*2;
    DebugOut("Num Files .....:"+num_files+"\n")
  
    for (let i=0;i<num_files;i++) {

 let s=""
       let counter=0;
       let st=new BitStream();
       let bitlen=data[index+(i*2)]+1;
       for (let j=0;j<data[index+(i*2)];j++)
       {
         
         s+=data[FileSegOffset].charAt(counter)+data[FileSegOffset].charAt(counter+1); counter+=2;

       }
       st.SetByDataStr(s,bitlen);
       //DebugOut(this.decode(st));
      DebugOut("--->"+st.toStr()+"\n");
       
/*      for (let j=0;j<data[index];j++) {
         let s=data[FileSegOffset]+data[FileSegOffset+1];
         DebugOut(s) 

        FileSegOffset+=2;
       }
         DebugOut(s+"\n"); 
         */
       
    }
  
    
     
  }


  }

  encode(s) {
    let old=null;
    if (this._dictionary) old= new Dictionary(this._dictionary);
    else this._dictionary = new Dictionary();
    this._dictionary.AddDataToDictionary(s)  ;
    this._dictionary.BuildTree();
    
    let org_size=0;
    let pak_size=0;
    
    DebugOut("Files.....: "+(this._entrys.length+1)+"\n");

    for (let i=0;i<this._entrys.length;i++)
    {
        let ss=old.decode(this._entrys[i]);
        let ll=ss.length;        
        org_size+=ss.length;
        let ec=this._dictionary.encode(ss);
        this._entrys[i]=ec;
        pak_size+=ec.GetSize();
        let pp=((ec.GetSize()/ll)*100)|0;
        DebugOut("File ["+i+"]   "+ll+" / "+ ec.GetSize()+" Ratio : "+pp+"%\n");


      }
    
    let ec=this._dictionary.encode(s);
    let pp=((ec.GetSize()/s.length)*100)|0;
    DebugOut("File ["+this._entrys.length+"]   "+s.length+" / "+ ec.GetSize()+" Ratio : "+pp+"%\n");
 
    this._entrys.push(ec);

    pak_size+=ec.GetSize();   
    org_size+=s.length;
    let pro=((pak_size/org_size)*100)|0;
    DebugOut("----------------------------------------------\n");
    DebugOut("Orgsize : "+org_size+" Packsize : "+pak_size+" Ratio : "+pro+"%\n");
    return ec;
  }

  decode(s) {
    return this._dictionary.decode(s);
  }


  ConvertToDataArray() {
    let s="const DATA =[";
    let d=""
    for (let i=0;i<256;i++) {
       d+=this._dictionary._dictionary[i].count+",";
    }
    s+=d+" //Dictionary\n";

    s+=packer._entrys.length+",// Num Files\n";
   let s2="\"";
    for (let i=0;i< packer._entrys.length;i++) 
    {
      let p=packer._entrys[i];
      let test =p.toHexString();      
      s+=p.GetSize()+", // Files "+i+" size \n";
      s+=p.GetBitLength()+", // Files "+i+" NumBits \n";
      s2+= test
      if (i+1<packer._entrys.length) s2+=",";
    }

    s+=s2+"\"];\n";
    return s;
  }
}