

function RGBToRed(rgb) { return ((rgb & 0x000000FF) >> 0); }
function RGBToGreen(rgb) { return ((rgb & 0x0000FF00) >> 8); }
function RGBToBlue(rgb) { return ((rgb & 0x00FF0000) >> 16); }
function RGBToAlpha(rgb) { return ((rgb & 0xFF000000) >> 24) & 0x0ff; }

function RGBA(r, g, b, a) { return (((a & 0x0ff) << 24) | ((b & 0x0ff) << 16) | ((g & 0x0ff) << 8) | ((r & 0x0ff))); }
function RGB(r, g, b) { return RGBA(r, g, b, 0xff); }

function LUMA_REC709(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b); }
function GREY(r, g, b) { return (LUMA_REC709(r, g, b) + 0.5) | 0; }


function RGBBlend(src, dst) {
  const alpha = src & 0xFF; // AA (0..255)

  const invA = 255 - alpha;

  // RB gleichzeitig
  const rb =
    (((src >> 8) & 0x00FF00FF) * alpha +
      ((dst >> 8) & 0x00FF00FF) * invA) & 0xFF00FF00;

  // G separat
  const g =
    (((src >> 8) & 0x0000FF00) * alpha +
      ((dst >> 8) & 0x0000FF00) * invA) & 0x00FF0000;

  const rgb = (rb | g) >> 8;

  return (rgb << 8) | 0xFF; // neues Alpha = 255 (optional)
}


const INSIDE = 0
const LEFT = 1
const RIGHT = 2
const BOTTOM = 4
const TOP = 8

function AddRGtoRGB(c1, c2) {
  //  let r=Math.min(RGBToRed(c1)+RGBToRed(c2),255);
  //  let g=Math.min(RGBToGreen(c1)+RGBToGreen(c2),255);
  //  let b=Math.min(RGBToBlue(c1)+RGBToBlue(c2),255);

  let r = (RGBToRed(c1) + RGBToRed(c2)) >> 1;
  let g = (RGBToGreen(c1) + RGBToGreen(c2)) >> 1;
  let b = (RGBToBlue(c1) + RGBToBlue(c2)) >> 1;


  return RGB(r, g, b);
}



function RGBToGray(color) {
  let r = color % 256;
  let g = ((color / 256) | 0) % 256;
  let b = (((color / 256) | 0 / 256) | 0) % 256
  return (0.299 * r + 0.587 * g + 0.114 * b) | 0;
}

function saveRGBAtoBMP(filename, width, height, rgbaBuffer) {
  const bytesPerPixel = 3; // RGB (kein Alpha)
  const rowStride = Math.floor((width * bytesPerPixel + 3) / 4) * 4; // 4-byte alignment
  const imageSize = rowStride * height;
  const fileSize = 54 + imageSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  let offset = 0;

  // === BMP HEADER ===
  view.setUint8(offset++, 0x42); // B
  view.setUint8(offset++, 0x4D); // M
  view.setUint32(offset, fileSize, true); offset += 4;
  view.setUint32(offset, 0, true); offset += 4;
  view.setUint32(offset, 54, true); offset += 4;

  // === DIB HEADER (BITMAPINFOHEADER) ===
  view.setUint32(offset, 40, true); offset += 4;
  view.setInt32(offset, width, true); offset += 4;
  view.setInt32(offset, height, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 24, true); offset += 2; // 24-bit
  view.setUint32(offset, 0, true); offset += 4;
  view.setUint32(offset, imageSize, true); offset += 4;
  view.setInt32(offset, 2835, true); offset += 4;
  view.setInt32(offset, 2835, true); offset += 4;
  view.setUint32(offset, 0, true); offset += 4;
  view.setUint32(offset, 0, true); offset += 4;

  // === PIXEL DATA ===
  const padding = rowStride - width * bytesPerPixel;

  let pos = 54;

  for (let y = height - 1; y >= 0; y--) { // bottom-up!
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const r = rgbaBuffer[i];
      const g = rgbaBuffer[i + 1];
      const b = rgbaBuffer[i + 2];
      const a = rgbaBuffer[i + 3];

      //            view.setUint8(pos++, b); // BMP = BGR
      //            view.setUint8(pos++, g);
      //            view.setUint8(pos++, r);
      view.setUint8(pos++, r); // BMP = BGR
      view.setUint8(pos++, g);
      view.setUint8(pos++, b);

    }

    // Padding
    for (let p = 0; p < padding; p++) {
      view.setUint8(pos++, 0);
    }
  }

  // === DOWNLOAD ===
  const blob = new Blob([buffer], { type: "image/bmp" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


async function saveBMPAsync(filename, width, height, rgbaBuffer) {
  await new Promise(requestAnimationFrame);
  saveRGBAtoBMP(filename, width, height, rgbaBuffer);
}


class Rect {
  constructor(left = undefined, top = undefined, right = undefined, bottom = undefined) {
    this._top = -1;
    this._left = -1;
    this._bottom = -1;
    this._right = -1;
    this._width = -1;
    this._height = -1;
    this.Set(left, top, right, bottom);
  }


  Set(left = undefined, top = undefined, right = undefined, bottom = undefined) {

    if (left instanceof Rect) {
      this._top = left.top;
      this._bottom = left.bottom;
      this._left = left.left;
      this._right = left.right;
      this._height = left.height;
      this._width = left.width;
      return;
    }
    if ((typeof left === "number") &&
      (typeof top === "number") &&
      (typeof right === "number") &&
      (typeof bottom === "number")) {
      this._top = top;
      this._bottom = bottom;
      this._left = left;
      this._right = right;
      this._height = Math.abs(this.bottom - this.top);
      this._width = Math.abs(this.right - this.left);
      return;
    }


  }

  get top() { return this._top; }
  get left() { return this._left; }
  get bottom() { return this._bottom; }
  get right() { return this._right; }
  get width() { return this._width; }
  get height() { return this._height; }


  set top(a) { this._top = a; this._height = Math.abs(this.bottom - this.top); }
  set bottom(a) { this._bottom = a; this._height = Math.abs(this.bottom - this.top); }
  set left(a) { this._left = a; this._width = Math.abs(this.right - this.left); }
  set right(a) { this._right = a; this._width = Math.abs(this.right - this.left); }
  set width(a) { this._width = a; this._right = this._left + this._width; }
  set height(a) { this._height = a; this._bottom = this._top + this._height; }


}



class Canvas {


  constructor(name, width, height, num_buffers = 2) {
    this._canvas = undefined;
    this._ctx = undefined;
    this._imageData = undefined;
    this._buffer = new ArrayBuffer();
    //this._buffer.length=2;
    this._active_buffer_index = 0;
    this._active_buffer_ptr = undefined;
    this._clear_color = RGBA(0, 0, 0, 0xff);
    this.Init(name, width, height, num_buffers);
    this._mouse_x = 0;
    this._mouse_y = 0;
    this._num_buffers = num_buffers;

    this._canvas.addEventListener("mousemove", (ev) => {
      let cols = canvas.width;
      let { offsetX, offsetY } = ev;
      this._mpx = offsetX;
      this._mpy = offsetY;
      //this.PutPixel(offsetX, offsetY, RGB(255, 255, 0))
    });
  }

  SaveAsImg(filename = "canvas.png") {
    const imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    DebugOut(filename + "\n");
    // speichern
    saveBMPAsync(filename, this._canvas.width, this._canvas.height, imageData.data);
  }

  SetMousePos(evt) {
    this._canvas.style.cursor = "none";
    let rect = this._canvas.getBoundingClientRect()
    let scaleX = this._canvas.width / rect.width
    let scaleY = this._canvas.height / rect.height
    this._mouse_x = ((evt.clientX - rect.left) * scaleX) | 0;
    this._mouse_y = ((evt.clientY - rect.top) * scaleY) | 0;


  }

  DrawCoursor() {
    let color = RGB(0, 255, 0);
    this.DrawLine(this._mouse_x - 5, this._mouse_y, this._mouse_x + 5, this._mouse_y, color)
    this.DrawLine(this._mouse_x, this._mouse_y - 5, this._mouse_x, this._mouse_y + 5, color)
  }

  DrawTexture(posx, posy, texture) {
    for (let y = 0; y < texture.height; y++) {
      for (let x = 0; x < texture.width; x++) {
        let color = texture.buffer[x + y * texture.width];
        this.PutPixel(posx + x, posy + y, color);
      }
    }
  }


  compute_outcode(x, y, xmin, xmax, ymin, ymax) {
    let code = INSIDE

    if (x < xmin) code |= LEFT;
    else if (x > xmax) code |= RIGHT

    if (y < ymin) code |= BOTTOM;
    else if (y > ymax) code |= TOP

    return code
  }


  cohen_sutherland_line_clip(x1, y1, x2, y2, x_min = 0, x_max = this.width, y_min = 0, y_max = this.height) {
    let code1 = this.compute_outcode(x1, y1, x_min, x_max, y_min, y_max);
    let code2 = this.compute_outcode(x2, y2, x_min, x_max, y_min, y_max);
    //printf("%d\n", code2);

    // Initialize line as outside the rectangular window
    let accept = false;

    while (true) {
      if ((code1 == 0) && (code2 == 0)) {
        accept = true;
        break;
      }
      else if (code1 & code2) {
        break;
      }
      else {
        // Some segment of line lies within the rectangle
        let code_out = 0;
        let x = 0;
        let y = 0;

        // At least one endpoint is outside the rectangle, pick it.
        if (code1 != 0)
          code_out = code1;
        else
          code_out = code2;

        // Find intersection point; using formulas y = y1 + slope * (x - x1),
        // x = x1 + (1 / slope) * (y - y1)
        if (code_out & TOP) {
          // point is above the clip rectangle
          x = x1 + (x2 - x1) * (y_max - y1) / (y2 - y1);
          y = y_max;
        }
        else if (code_out & BOTTOM) {
          // point is below the rectangle
          x = x1 + (x2 - x1) * (y_min - y1) / (y2 - y1);
          y = y_min;
        }
        else if (code_out & RIGHT) {
          // point is to the right of rectangle
          y = y1 + (y2 - y1) * (x_max - x1) / (x2 - x1);
          x = x_max;
        }
        else if (code_out & LEFT) {
          // point is to the left of rectangle
          y = y1 + (y2 - y1) * (x_min - x1) / (x2 - x1);
          x = x_min;
        }

        // Now intersection point x,y is found We replace point outside rectangle by intersection point
        if (code_out == code1) {
          x1 = x;
          y1 = y;
          code1 = this.compute_outcode(x1, y1, x_min, x_max, y_min, y_max);
        }
        else {
          x2 = x;
          y2 = y;
          code2 = this.compute_outcode(x2, y2, x_min, x_max, y_min, y_max);
        }
      }
    }

    return [accept, x1, y1, x2, y2];

  }




  DrawRec(x1, y1, x2, y2, color) {
    this.DrawLine(x1, y1, x2, y1, color)
    this.DrawLine(x2, y1, x2, y2, color)
    this.DrawLine(x2, y2, x1, y2, color)
    this.DrawLine(x1, y2, x1, y1, color)
  }


  DrawLine(x1, y1, x2, y2, color) {
    // Differenzen berechnen


    let out = this.cohen_sutherland_line_clip(x1, y1, x2, y2);
    if (!out[0]) return;
    x1 = out[1];
    y1 = out[2];
    x2 = out[3];
    y2 = out[4];


    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    // Schrittrichtung bestimmen (1 oder -1)
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;

    // Initialer Fehlerwert
    let err = dx - dy;

    while (true) {
      // Pixel setzen
      this.PutPixelRaw(x1, y1, color);

      // Ziel erreicht?
      if (x1 === x2 && y1 === y2) break;

      // Fehlerwert anpassen und Koordinaten rücken
      let e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }

      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }

  SetClearColor(color) {
    this._clear_color = color;
  }

  EnableDepthtest() { this._depth = true; }
  DisableDepthtest() { this._depth = false; }

  get width() { return this._canvas.width; }
  get height() { return this._canvas.height; }
  get MouseX() { return this._mpx; }
  get MouseY() { return this._mpy; }
  get Canvas() { return this._canvas; }




  Clear() {
    if (this._active_buffer_ptr === undefined) {
      console.log("this._active_buffer_ptr === undefined");
      return;
    }
    this._active_buffer_ptr.fill(this._clear_color);
  }

  get Buffer() { return this._active_buffer_ptr; }

  GetActiveBuffer() {
    return this._active_buffer_ptr;
  }


  Init(name, width, height, num_buffers = 2) {

    this._num_buffers = num_buffers;
    this._canvas = document.getElementById(name);
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._canvas.width = width;
    this._canvas.height = height;
    this._imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    for (let i = 0; i < this._num_buffers; i++)
      this._buffer[i] = new Uint32Array(this._canvas.width * this._canvas.height);

    this._active_buffer_index = 0;
    this._active_buffer_ptr = this._buffer[this._active_buffer_index];

    this._imgdata = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    this._argb = new Uint32Array(this._imageData.data.buffer);


  }

  flip() {
    this._active_buffer_index = (this._active_buffer_index + 1) % this._num_buffers;
    this._active_buffer_ptr = this._buffer[this._active_buffer_index];
  }

  Redraw() {
    this._argb.set(this._active_buffer_ptr);
    this._ctx.putImageData(this._imageData, 0, 0);
    return this._ctx;
  }

  PutPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this._active_buffer_ptr[x + y * this.width] = color;

  }

  PutPixelRaw(x, y, color) {

    this._active_buffer_ptr[x + y * this.width] = color;

  }
  GetPixel(x, y) {

    return this._active_buffer_ptr[x + y * this.width];

  }

  SetPixel(pos, color) {
    if (pos < 0 || pos >= this.width * this.height) return;
    this._active_buffer_ptr[pos] = color;
  }

  DrawText(x, y, text) {
    this._ctx.font = "28px Arial";
    this._ctx.fillStyle = "white"
    this._ctx.fillText(text, x, y);
    this._ctx.font = "25px Arial";

    this._ctx.fillStyle = "black"
    this._ctx.fillText(text, x, y);
  }

}


