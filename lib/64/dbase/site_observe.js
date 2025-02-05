//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

//
// dbase.site_observe()
//
mo_dbase.prototype.site_observe = function () {
  //
  let my = this.my;
  // Setup listener for changes to firebase db device
  let { getRefPath, onChildAdded, onChildChanged, onChildRemoved } = my.fireb_.fbase;
  let path = `${my.mo_dbroot}/${my.mo_app}/a_app`;
  let refPath = getRefPath(path);

  ui_log('dbase.site_observe path', path);

  if (!my.fireb_devices) {
    my.fireb_devices = {};
  }
  onChildAdded(refPath, (data) => {
    // console.log('dbase.site_observe Added this', this);
    receivedDeviceKey('dbase.site_observe Added', data);
  });

  onChildChanged(refPath, (data) => {
    // console.log('dbase.site_observe Changed', data);
    receivedDeviceKey('dbase.site_observe Changed', data);
  });

  onChildRemoved(refPath, (data) => {
    receivedDeviceKey('dbase.site_observe Removed', data, { remove: 1 });
  });

  let receivedDeviceKey = (msg, data, remove) => {
    // console.log('site_observe receivedDeviceKey this', this);
    // console.log('site_observe receivedDeviceKey this', this);
    // console.log('site_observe receivedDeviceKey msg', msg, data, remove);

    let key = data.key;
    let val = data.val();
    // ui_log(msg, key, 'n=', Object.keys(val).length);
    // ui_log(msg, key, 'n=', JSON.stringify(val));
    // ui_log(msg, key, val.name_s);

    if (remove) {
      delete my.fireb_devices[key];
      my.ndevice = Object.keys(my.fireb_devices).length;
      return;
    }
    this.fireb_device(key, val);
  };

  // console.log('site_observe this', this);
};

//
// my.fireb_devices
//  device = { uid, index, dbase }
//    device.dbase are values from the server
//
// dbase.fireb_device(uid,val)
//
mo_dbase.prototype.fireb_device = function (uid, val) {
  let my = this.my;
  let fresh = 0;
  let device = my.fireb_devices[uid];
  if (!device) {
    // First use of device, add to my.fireb_devices
    let index = Object.keys(my.fireb_devices).length;
    device = { uid, index };
    my.fireb_devices[uid] = device;
    my.ndevice = index + 1;
    fresh = 1;
  }
  if (val) {
    device.dbase = val;
  }
  if (fresh && uid == my.uid) {
    // device must be inited to record visit event
    this.site_event_visit();
  }
  let visit_count = device.dbase.visit_count;
  let ndevice = this.count_client_devices();
  this.report_status({ uid, visit_count, ndevice });
  return device;
};

// Only count devices that dont contain '-electron' in the name_s field
//
mo_dbase.prototype.count_client_devices = function () {
  // Object.keys(my.fireb_devices).length;
  let my = this.my;
  let count = 0;
  Object.entries(my.fireb_devices).map((ent) => {
    let dev = ent[1];
    // console.log('dev', dev);
    if (dev?.dbase?.name_s?.indexOf('-electron') < 0) {
      count++;
    }
  });
  return count;
};

// Object.entries(my.fireb_devices)
// [
//   [
//       "DK1Lcj16BFhDPgdvGGkVP9FS3Xy2",
//       {
//           "uid": "DK1Lcj16BFhDPgdvGGkVP9FS3Xy2",
//           "index": 0,
//           "dbase": {
//               "date_s": "2024-10-12T16:56:00.229Z",
//               "name_s": "facemesh",
//               "time": 0,
//               "time_s": "",
//               "update_count": 1,
//               "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
//               "visit": [
//                   {
//                       "date_s": "2024-10-12T16:56:00.229Z",
//                       "time": 0,
//                       "time_s": ""
//                   }
//               ],
//               "visit_count": 1
//           }
//       }
//   ]
// ]

//
//
mo_dbase.prototype.dbase_site_remove = function () {
  //
  let my = this.my;
  let { getRefPath, set } = my.fireb_.fbase;
  let path = `${my.mo_dbroot}/${my.mo_app}/a_device/${my.uid}`;
  let refPath = getRefPath(path);
  set(refPath, {})
    .then(() => {
      // Data saved successfully!
      // ui_log('dbase.site_remove OK');
    })
    .catch((error) => {
      // The write failed...
      ui_log('dbase.site_remove error', error);
    });
};

//
//
let fbase_device_dbase_sample = {
  //
  date_s: '2024-02-28T00:00:23.101Z',
  name_s: '',
  remote: 1,
  time: 13457,
  time_s: '13.457 secs',
  update: [
    {
      date_s: '2024-02-28T00:00:23.101Z',
      gap: 9543,
      gap_s: '9.543 secs',
      time: 13457,
      time_s: '13.457 secs',
    },
  ],
  update_count: 1007,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  visit: [
    {
      date_s: '2024-02-27T23:56:02.833Z',
      gap: 14968,
      gap_s: '14.968 secs',
      time: 0,
      time_s: '',
    },
  ],
  visit_count: 2,
};
