

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

      // Copy Node
      if (element instanceof DictionaryNode && typeof count !== 'number' && count == 0) 
      {
        
          this.element=element.element;
          this.count=element.count;  
          this._node_a=null;
          this._node_b=null;
          return;
 
      }

       
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
           for (let d of input._dictionary)    
           {
               this._dictionary.push(new DictionaryNode(d));
               this.BuildTree();
           }
           return;
        }

        for (let i=0;i<256;i++) this._dictionary.push(new DictionaryNode(i));
      }

    AddDataToDictionary(data) {
        for (let i=0;i<data.length;i++) {
          let index=data.charCodeAt(i);
          if (intdex>=0 && index <=255)this._dictionary[index].increment();
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


 }


class Archive {
     constructor() {


      this._dictionary = new Array();
         this._dictionary_tree = null;
         this._files= new Array();

         if (this._dictionary.length<=0) {
          for (let i=0;i<256;i++) this._dictionary.push(new DictionaryNode(i));
         }
      }


      decode(data) {
        let bitstream= new BitStream();
        for (let i =0;i<data.length;i++) {
          let index=data.charCodeAt(i);
          
          try {
             bitstream.SetAndShiftBit(this._dictionary[index]._bit);
          } catch(error) {
            alert(index);
          }
        }
        return bitstream;
    }

    encode(s) {
       let go=this._dictionary_tree;
       let out="";
       
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

     AddDataToDictionary(data) {
        for (let i=0;i<data.length;i++) {
          let index=data.charCodeAt(i);
          try { 
            
            this._dictionary[index].increment();
         } catch(error) {
            alert(index+"  "+data[i]);
          }

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
     
     Debug() {
        if (this._dictionary_tree) this._dictionary_tree.Debug();
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

    }