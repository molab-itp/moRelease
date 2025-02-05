//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

//
// await dbase.fstoreage_render({ url, layer });
//
// !!@ DOC fstorage_render({ url, layer })
//
mo_dbase.prototype.fstoreage_render = function (args) {
  return new Promise(function (resolve, reject) {
    promise_render(args, resolve, reject);
  });
  function promise_render(args, resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
      // ui_log('fstorage_img_download blob ' + blob);
      renderBlobToLayer(blob, args, resolve);
    };
    xhr.open('GET', args.url);
    xhr.send();
  }
  function renderBlobToLayer(blob, args, resolve) {
    // let elt = my.canvas.elt;
    // let ctx = elt.getContext('2d');
    // let ctx = my.canvas.drawingContext;
    let { width, height } = args.layer;
    let ctx = args.layer.drawingContext;
    var img = new Image();
    img.onload = function () {
      // console.log('renderBlobToLayer img', img);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);
      resolve();
    };
    img.src = URL.createObjectURL(blob);
  }
};

//
// dbase.fstorage_upload({ layer, path, imageQuality })
//
mo_dbase.prototype.fstorage_upload = async function ({ layer, path, imageQuality }) {
  // console.log('fstorage_img_upload');
  let my = this.my;
  if (!layer || !layer.elt || !layer.elt.toBlob) {
    ui_error('fstorage_upload bad layer', layer);
    return;
  }
  if (!path) {
    ui_error('fstorage_upload missing path', path);
    return;
  }
  let imageType = 'image/jpeg';
  let last4 = path.substring(path.length - 4);
  if (last4.toLowerCase() == '.png') {
    imageType = 'image/png';
  }
  // console.log('last4', last4, 'imageType', imageType);

  let imagePath = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}/${path}`;

  let blob = await getBlob(layer.elt, imageType, imageQuality);

  function getBlob(elt, imageType, imageQuality) {
    return new Promise(function (resolve, reject) {
      elt.toBlob(
        (blob) => {
          resolve(blob);
        },
        imageType,
        imageQuality
      );
    });
  }
  return this.fstorage_upload_blob(blob, imagePath);
};

//
// dbase.fstorage_upload_blob(blob, imagePath)
//
mo_dbase.prototype.fstorage_upload_blob = async function (blob, imagePath) {
  // console.log('fstorage_upload', blob);
  let { getStorageRefPath, uploadBytes } = my.fireb_.fstorage;
  // ui_log('fstorage_upload my.imagePath', my.imagePath);
  const storageRef = getStorageRefPath(imagePath);

  // 'file' comes from the Blob or File API
  return uploadBytes(storageRef, blob);
};

//
// dbase.fstorage_remove({ path })
//
mo_dbase.prototype.fstorage_remove = async function ({ path }) {
  let my = this.my;
  if (!path) {
    ui_error('fstorage_remove missing path', path);
    return;
  }
  let imagePath = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}/${path}`;

  ui_log('fstorage_remove imagePath', imagePath);

  let { getStorageRefPath, deleteObject } = my.fireb_.fstorage;
  const deleteRef = getStorageRefPath(imagePath);

  return deleteObject(deleteRef);
};

//
// dbase.fstorage_download_url({ path })
//
mo_dbase.prototype.fstorage_download_url = async function ({ path }) {
  // console.log('fstorage_img_download ');
  let my = this.my;

  let imagePath = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}/${path}`;

  let { getStorageRefPath, getDownloadURL } = my.fireb_.fstorage;

  let refPath = getStorageRefPath(imagePath);

  return getDownloadURL(refPath);
};
