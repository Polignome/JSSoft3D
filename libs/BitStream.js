class BitStream {
    
      
    constructor(length=0,bits=[],bit=0,chunk=0)
    {
        
        if (length instanceof BitStream)
        {
            
          this.m_length=length.m_length;
          this.m_8bits=length.m_8bits.slice();
          this.m_bit=length.m_bit;
          this.m_chunk=length.m_chunk;
          return;
        }



        this.m_length=length;
        this.m_8bits=bits;
        this.m_bit=bit;
        this.m_chunk=chunk;

    

     }
    
    
    

       Get8bits() {return this.m_8bits;}
       GetChunk() {return this.m_chunk;}
       GetBit()   {return this.m_bit;}
       GetLength() {return this.m_length;}
       GetBitLength() {return this.m_length;}
       GetSize() {return this.m_8bits.length;}
       length() {return this.m_length;}
      
       GetBit(i) {
         let bit=i%8;
         let chunk=(i/8)|0;
         return (this.m_8bits[chunk]&(1<<bit));       

      }

      SetByDataStr(data_string,num_bits) {
        
        
         this.m_bit = this.hexToBytes(data_string);
         this.m_length=num_bits;
         this.m_bit=this.m_length%8;
         this.m_chunk=(this.m_length/8)|0;
      }

      SetAndShiftBit(b)
      {
        if (b instanceof BitStream) {
          for (let i=0;i<b.length();i++) {
                 this.SetAndShiftBit(b.GetBit(i));
          }
          return; 
        }

         if (this.m_bit==0) this.m_8bits.push(0);
         if (b) this.m_8bits[this.m_chunk]=this.m_8bits[this.m_chunk]|(1<<this.m_bit);
         this.m_length++;
         this.m_bit=this.m_length%8;
         this.m_chunk=(this.m_length/8)|0;
         
      }
      
       toStr() {
          let s="";
          
          for (let i=0;i<this.m_length;i++)
          {
           if (this.GetBit(i)) s+="1";else s+="0";       
          }
          return s;
      }

      toHexString(byteArray) {
        return Array.from(this.m_8bits, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    }

   
    hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
  
    toByteArrayStr() {
          let s="";
          let k=0;
          for (let i=0;i<this.m_8bits.length;i++)
          {
            s+=this.m_8bits[i];
            if (i+1<this.m_8bits.length) s+=",";       
            k++;
            if (k>=40) {
               k=0;
               s+="\n";
            }
          }
          return s;
      }

};
