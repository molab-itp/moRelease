//
// firebase-storage
// Expose firebase api to non-import code p5js script.js
// via variable fireb_.xxxx
// fireb_.fstorage.storage
// ...

// console.log('fireb_fstorage');

import {
  deleteObject,
  getDownloadURL,
  getStorage,
  list,
  listAll,
  ref,
  uploadBytes, //
} from 'firebase/storage';

export function fstorage_init(my) {
  my.fireb_.fstorage = {
    deleteObject,
    getDownloadURL,
    // getStorage,
    list,
    listAll,
    ref,
    uploadBytes,
  };
  let storageRoot = getStorage(my.fireb_.app);
  my.fireb_.fstorage.getStorageRefPath = function (path) {
    return ref(storageRoot, path);
  };
}

/* 

https://firebase.google.com/docs/storage/web/start

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

  let { getStorage, ref, uploadBytes } = my.fireb_.fstorage;

  function getStorageRefPath(path) {
    ref(getStorage(app), path);
  }

*/
