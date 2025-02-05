//

export class Pane {
  // { backImage, x0, y0, z0, width, height, initCentered, refBox, regionIndex }
  constructor(props) {
    //
    Object.assign(this, props);

    if (!this.regionIndex) this.regionIndex = 0;

    // console.log('Pane', this.label, 'width', this.width, 'height', this.height);

    // panX
    // panY
    // zoomIndex
    // zoomRatio

    this.pan_init();

    // console.log('Pane initCentered', this.initCentered);
    if (this.initCentered) {
      this.pan_center();
    }

    this.focusRect_init();

    this.anim_init();
  }

  render() {
    // must step values before render
    this.anim.stepValues();
    this.render_backImage();
    if (this.anim.running) {
      // animation is running, don't touch props
      // this.focus_pan();
    }
    // Disabled: when not animating show focus rect
    // } else
    if (this.refBox) {
      this.focus_focusRect();
      this.focusRect.render();
    }
  }

  // let targetProps = { panX: 1, panY: 1, zoomIndex: 1 };
  // pan_updateZoom(newValue) {

  focus() {
    this.focus_pan();
    this.focus_focusRect();
  }

  focus_animated() {
    this.anim.initValues({ panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex });
    if (this.regionIndex == 1) {
      let zoomOutIndex = 2.0;
      this.anim.addChange(3, { panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex }); // Pause
      this.focus_pan();
      this.focus_focusRect();
      this.anim.addChange(1, { panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex }); // pan and zoom
      this.anim.addChange(0, { panZoomIndex: this.zoomIndex }); // Pause
      this.anim.addChange(2, { panZoomIndex: zoomOutIndex }); // Zoom out
      this.anim.addChange(2, { panZoomIndex: zoomOutIndex }); // Pause
      this.anim.addChange(1, { panZoomIndex: this.zoomIndex }); // zoom in
    } else {
      this.focus_pan();
      this.focus_focusRect();
      this.anim.addChange(1.0, { panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex });
    }
  }

  focus_pan() {
    let rg = this.region();
    this.zoomIndex = rg.z;
    let cm = this.canvasMap();
    let crg = this.rgToCanvas(rg);

    // Centering on Y does not work
    // set to top Y for now
    // console.log('\nfocus_pan rg', rg);
    // console.log('focus_pan crg', crg);
    // console.log('focus_pan cm.zWidth zHeight', cm.zWidth, cm.zHeight);
    // console.log('focus_pan rg.y , rg.x, rg.w - cm.zWidth', rg.x, rg.w - cm.zWidth);
    this.panX = floor(rg.x + (rg.w - cm.zWidth) * 0.5);
    if (this.panX < 0) this.panX = 0;
    // console.log('focus_pan rg.y , (rg.h - cm.zHeight)', rg.y, rg.h - cm.zHeight);
    let vizHeight = this.height * this.zoomRatio;
    this.panY = floor(rg.y - (vizHeight - rg.h) * 0.5);
    // console.log('focus_pan panX panY', this.panX, this.panY);
    // this.panX = floor(rg.x);
    this.panY = floor(rg.y);
    // console.log('focus_pan panX panY', this.panX, this.panY);
    // this.panY = floor(rg.y - (rg.h - cm.zHeightClipped) * 0.5);
  }

  focus_pan_cut() {
    let rg = this.region();
    this.zoomIndex = rg.z;
    let cm = this.canvasMap();
    this.panX = floor(rg.x + (rg.w - cm.zWidth) * 0.5);
    if (this.panX < 0) this.panX = 0;
    // this.panX = rg.x;
    this.panY = rg.y;
    ui_log('\nfocus_pan_cut panX', this.panX, this.panY);
  }

  focus_animated_cut(cut_time) {
    if (!cut_time) {
      cut_time = 1;
    }
    this.anim.initValues({ panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex });
    this.focus_pan_cut();
    this.focus_focusRect();
    this.anim.addChange(cut_time, { panX: this.panX, panY: this.panY, zoomIndex: this.zoomIndex });
  }

  anim_init() {
    this.anim = new Anim({ target: this });
  }

  focusRect_init() {
    let x0 = 0;
    let y0 = 0;
    let width = 0;
    let height = 0;
    let stroke = this.focsRect_stroke || color(234, 171, 126); // color('yellow');
    let strokeWeight = this.focsRect_strokeWeight || 2;
    let shadowBlur = 15;
    let shadowColor = color(234, 171, 126); // color('white');
    this.focusRect = new Rect({ x0, y0, width, height, stroke, strokeWeight, shadowBlur, shadowColor });
  }

  render_backImage() {
    let cm = this.canvasMap();
    let backImage = this.backImage;
    // zoom background image to the full width of the canvas
    let dx = this.x0;
    let dy = this.y0;
    let sx = this.panX;
    let sy = this.panY;
    // Use backBuffer to clip render to width and height
    let bf = this.backBuffer;
    bf.clear();
    bf.image(backImage, 0, 0, cm.cWidth, cm.cHeight, sx, sy, cm.zWidth, cm.zHeight);
    image(bf, dx, dy, bf.width, bf.height, 0, 0, bf.width, bf.height);
  }

  // image(img, x, y, [width], [height])
  // image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [zHeight], [fit], [xAlign], [yAlign])
  // destination, source

  set zoomIndex(newValue) {
    this._zoomIndex = newValue;
    this.zoomRatio = 1 / newValue;
  }

  get zoomIndex() {
    return this._zoomIndex;
  }

  set panZoomIndex(newValue) {
    this.pan_updateZoom(newValue);
  }

  get panZoomIndex() {
    return this._zoomIndex;
  }

  refEntry() {
    if (!this.refBox) {
      return this.default_region();
    }
    return this.refBox.refEntry();
  }

  default_region() {
    return { label: '', i: 0, regions: [{ x: 0, y: 0, w: this.width, h: this.height, z: 1 }] };
  }

  get label() {
    return 'pane' + this.regionIndex;
  }

  region() {
    let ent = this.refEntry();
    let rg = ent.regions[this.regionIndex];
    // console.log(this.label, 'rg', JSON.stringify(rg));
    if (!rg) {
      // console.log('Pane render MISSING regionIndex', this.regionIndex);
      return this.default_region();
    }
    return rg;
  }

  focus_focusRect() {
    let rg = this.region();
    let crg = this.rgToCanvas(rg);
    this.focusRect.x0 = crg.x;
    this.focusRect.y0 = crg.y;
    this.focusRect.width = crg.w;
    this.focusRect.height = crg.h;
  }

  touchPoint(x, y) {
    let xhit = this.x0 < x && x < this.x0 + this.width;
    let yhit = this.y0 < y && y < this.y0 + this.height;
    return xhit && yhit;
  }

  pan_updateZoom(newValue) {
    let oRatio = this.zoomRatio;
    this.zoomIndex = newValue;

    let iWidth = this.backImage.width;
    let iHeight = this.backImage.height;

    let oW = floor(iWidth * oRatio * 0.5);
    let oH = floor(iHeight * oRatio * 0.5);

    let nW = floor(iWidth * this.zoomRatio * 0.5);
    let nH = floor(iHeight * this.zoomRatio * 0.5);

    this.panX = this.panX + oW - nW;
    this.panY = this.panY + oH - nH;
    ui_log('pan_updateZoom panX', this.panX, this.panY);
  }

  pan_init() {
    this.panX = 0;
    this.panY = 0;
    this.zoomIndex = this.z0;
    // this.zoomRatio = 1 / this.zoomIndex;
    if (!this.backBuffer) {
      this.backBuffer = createGraphics(this.width, this.height);
    }
  }

  pan_center() {
    this.zoomIndex = this.z0;
    let cm = this.canvasMap();
    this.panX = floor((cm.iWidth - cm.zWidth) * 0.5);
    this.panY = floor((cm.iHeight - cm.zHeight) * 0.5);
    ui_log('pan_center panX', this.panX, this.panY);
  }

  mousePressed() {
    // console.log('Pane mousePressed', this.label);
    this.mouse0 = { x: mouseX, y: mouseY };
    // console.log('mousePressed im', this.im);
  }

  mouseDragged() {
    let im = this.mouse0;
    let nm = { x: mouseX, y: mouseY };
    let df = { x: nm.x - im.x, y: nm.y - im.y };

    let cm = this.canvasMap();

    this.panX -= df.x * cm.scale;
    this.panY -= df.y * cm.scale;

    // console.log('mouseDragged df', df.x);
    // console.log('mouseDragged panX', this.panX, this.panY);
    this.mouse0 = nm;
  }

  mouseReleased() {
    // console.log('Pane mouseReleased', this.label);
  }

  copyRefEntry(index, props) {
    let ent = this.refEntry();
    let rg = ent.regions[this.regionIndex];
    let rgFrom = ent.regions[index];

    // console.log('copyRefEntry rg', rg, 'props', props);
    // console.log('copyRefEntry rgFrom', rgFrom);

    Object.assign(rg, rgFrom, props);
    this.refBox.save_localStorage();
  }

  // props = { z: 4 }
  updateRefEntry(canvasPts, props) {
    // console.log('updateRefEntry canvasPts', canvasPts, 'props', props);
    let ent = this.refEntry();
    if (canvasPts.length >= 2) {
      this.updateEnt(ent, canvasPts);
    } else {
      let rg = ent.regions[this.regionIndex];
      rg.z = this.zoomIndex;
    }
    if (props) {
      let rg = ent.regions[this.regionIndex];
      Object.assign(rg, props);
    }
    this.refBox.save_localStorage();
  }

  mapToImage(canvasPts) {
    // console.log('mapToImage canvasPts', canvasPts);
    let cm = this.canvasMap();
    let rw = cm.zWidth / cm.cWidth;
    let rh = cm.zHeight / cm.cHeight;
    let points = [];
    // Map from canvas/screen coordindates to image
    // console.log('mapToImage x0', this.x0, this.y0, this.panX, this.panY);
    for (let ment of canvasPts) {
      let x = floor((ment.x - this.x0) * rw) + this.panX;
      let y = floor((ment.y - this.y0) * rh) + this.panY;
      points.push({ x, y });
    }
    // console.log('mapToImage points', points);
    return points;
  }

  updateEnt(ent, canvasPts) {
    // map from image to screen coordinates
    let cm = this.canvasMap();
    let rw = cm.zWidth / cm.cWidth;
    let rh = cm.zHeight / cm.cHeight;
    let points = [];
    // Map from canvas/screen coordindates to image
    for (let ment of canvasPts) {
      let x = floor((ment.x - this.x0) * rw) + this.panX;
      let y = floor((ment.y - this.y0) * rh) + this.panY;
      points.push({ x, y });
    }
    ui_log('updateEnt points', points);
    if (points[0].x > points[1].x) {
      let temp = points[1].x;
      points[1].x = points[0].x;
      points[0].x = temp;
    }
    if (points[0].y > points[1].y) {
      let temp = points[1].y;
      points[1].y = points[0].y;
      points[0].y = temp;
    }
    let x = points[0].x;
    let y = points[0].y;
    let w = points[1].x - x;
    let h = points[1].y - y;
    let z = this.zoomIndex;
    if (w == 0 || h == 0) {
      alert('updateEnt: zero canvasPts. Must click and drag to create rect');
    }
    ent.regions[this.regionIndex] = { x, y, w, h, z };
  }

  rgToCanvas(rg) {
    // map from screen to image coordinates

    let cm = this.canvasMap();
    let wr = cm.cWidth / cm.zWidth;
    let hr = cm.cHeight / cm.zHeight;

    // solve for ment.x
    // let x = floor((ment.x - this.x0) * rw) + this.panX;
    // let y = floor((ment.y - this.y0) * rh) + this.panY;

    // Map from image coordinates to canvas
    //
    let x = floor((rg.x - this.panX) * wr + this.x0);
    let y = floor((rg.y - this.panY) * hr + this.y0);
    let w = floor(rg.w * wr);
    let h = floor(rg.h * hr);

    return { x, y, w, h };
  }

  // { cWidth, cHeight, zWidth, zHeight, iWidth, iHeight };
  canvasMap() {
    let backImage = this.backImage;
    let iWidth = backImage.width;
    let iHeight = backImage.height;
    let rr = iHeight / iWidth;

    let cWidth = this.width;
    let cHeight = floor(cWidth * rr);

    let zWidth = floor(iWidth * this.zoomRatio);
    let zHeight = floor(iHeight * this.zoomRatio);

    let scale = zWidth / cWidth;

    return { cWidth, cHeight, zWidth, zHeight, iWidth, iHeight, scale };
  }
}

globalThis.Pane = Pane;
