//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

if (globalThis.window) {
  window.addEventListener('resize', () => {
    // ui_log('report_status resize globalThis.my', globalThis.my);
    let my = globalThis.my;
    if (!my || !my.dbase) {
      if (!globalThis.report_status_reported) {
        globalThis.report_status_reported = 1;
        ui_log('report_status no my || my.dbase');
      }
      return;
    }
    my.dbase.report_status({});
  });
}

mo_dbase.prototype.report_status = function (props) {
  let my = this.my;
  ui_verbose('dbase.report_status props', props);
  if (!my.statusElement) {
    this.createStatusElement();
    if (!my.statusElement) return;
  }
  let options = {};
  if (my.showQRCode && my.showQRCode(options)) {
    createQRCode(options);
  } else if (my.footerElement) {
    my.footerElement.style.display = 'none';
    my.qrcodeElement.style.display = 'none';
  }

  let msg = props.msg;
  if (!msg) {
    let muid = my.uid || '';
    let uid = props.uid || '';
    let visit_count = props.visit_count || '';
    let ndevice = props.ndevice || '';
    msg = `${muid} ${uid} (${visit_count}) [${ndevice}]`;
  }
  my.statusElement.textContent = msg;
};

mo_dbase.prototype.createStatusElement = function () {
  let my = this.my;
  if (!globalThis.window) return;
  if (!my.statusElement) {
    my.statusElement = document.createElement('div');
    document.body.appendChild(my.statusElement);
    my.statusElement.style.position = 'fixed';
    my.statusElement.style.pointerEvents = 'none';
  }

  let h = 10;
  let x = 0;

  my.statusElement.style.position = 'fixed';
  my.statusElement.style.bottom = '0';
  my.statusElement.style.left = `${x}px`;
  my.statusElement.style.width = `100%`;

  my.statusElement.style.zIndex = 1000;
  my.statusElement.style.backgroundColor = 'black';
  // my.statusElement.style.backgroundColor = 'green';
  my.statusElement.style.color = 'white';
  my.statusElement.style.fontSize = `${h}px`;
  my.statusElement.style.padding = '1px 2px';
};

mo_dbase.prototype.qrcode_url = function () {
  let my = this.my;
  let url;
  if (my.qrcode_url) {
    url = my.qrcode_url();
  } else {
    // let url = `https://molab-itp.github.io/p5moExamples/examples/let-america-be/qrcode/s0.png`;
    url = `https://molab-itp.github.io/moSalon/src/let-america-be/qrcode/${my.mo_group}.png`;
  }
  ui_log('qrcode_url', url);
  return url;
};

// function init_qrcode_url() {
//   if (my.qrcodeElement) {
//     my.qrcodeElement.src = qrcode_url();
//   }
// }
// globalThis.init_qrcode_url = init_qrcode_url;

mo_dbase.prototype.footerText = function () {
  let my = this.my;
  return `
  <div >
    <h1>POWER TO THE PEOPLE!</h1> 
    <h3>scan the qrcode to control this screen  </h2>
    <br/>
    <h3>${my.appTitle} ${my.mo_group} ${my.version}</h2>
  </div>
`;
};

mo_dbase.prototype.createQRCode = function (options) {
  let my = this.my;
  // console.log('createQRCode document', document, 'my.qrcodeElement', my.qrcodeElement);
  if (!globalThis.window) return;
  if (my.footerElement) {
    my.footerElement.style.display = 'block';
    my.qrcodeElement.style.display = 'block';
    return;
  }
  if (my.qrcodeElement) {
    return;
  }
  if (options && !options.hide_footer) {
    my.footerElement = document.createElement('div');
    document.body.appendChild(my.footerElement);
    my.footerElement.style.position = 'fixed';
    my.footerElement.style.bottom = '0';
    my.footerElement.style.left = '0';
    my.footerElement.style.zIndex = 999;
    my.footerElement.style.width = '100%';
    my.footerElement.style.height = my.footerHeight; // '192px';
    my.footerElement.style.backgroundColor = 'black';
    my.footerElement.style.color = 'white';
    my.footerElement.innerHTML = this.footerText(); // 'HELLO';
  }
  // let w = Math.floor(window.innerWidth * 0.25);
  // let x = window.innerWidth - w;
  my.qrcodeElement = document.createElement('img');
  document.body.appendChild(my.qrcodeElement);
  my.qrcodeElement.style.position = 'fixed';
  my.qrcodeElement.style.bottom = '0';
  my.qrcodeElement.style.right = '0';
  my.qrcodeElement.style.zIndex = 1000;
  my.qrcodeElement.style.width = my.qrCodeWidth; // `${Math.floor(100 * my.qrCodeWidth)}%`;
  my.qrcodeElement.src = qrcode_url();

  if (my.qrCodeClickAction) {
    my.qrcodeElement.addEventListener('click', my.qrCodeClickAction);
  }

  ui_log('createQRCode my.qrcodeElement', my.qrcodeElement);
};
