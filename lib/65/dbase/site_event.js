//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

//
// device {
//   "count": 259,
//   "date_s": "2023-12-22T03:51:03.651Z",
//   event: [ ... ]
// }

// inputs:
// my.uid
// my.nameDevice

mo_dbase.prototype.site_event_visit = function () {
  this.site_event({ event: 'visit', count: 'visit_count' });
};

mo_dbase.prototype.site_event_update = function () {
  // ui_log('dbase.site_event_update');
  this.site_event({ event: 'update', count: 'update_count' });
};

mo_dbase.prototype.site_event = function (keys) {
  this.app_update({}, keys);
};

//
// dbase.update_info(a_info)
// dbase.app_update() // !!@ Rename
//
mo_dbase.prototype.update_info = function (a_info) {
  this.app_update({ a_info });
};

mo_dbase.prototype.app_update = function (updates, keys) {
  ui_verbose('dbase.app_update updates', updates, 'keys', keys);
  // console.log('dbase.site_event my.uid', my.uid);
  // ui_log('dbase.site_event my.uid', my.uid);
  let my = this.my;
  if (!my.uid) {
    return;
  }
  let path = `${my.mo_dbroot}/${my.mo_app}/a_app/${my.uid}`;
  let { getRefPath, update, increment } = my.fireb_.fbase;
  let refPath = getRefPath(path);
  // ui_log('dbase.site_event', path);

  let date_s = new Date().toISOString();
  let count = increment(1);
  let name_s = my.nameDevice || '';
  let userAgent = 'unknown';
  if (globalThis.navigator) {
    userAgent = globalThis.navigator.userAgent;
  }

  if (!updates) updates = {};
  if (!keys) {
    keys = { event: 'update', count: 'update_count' };
  }
  Object.assign(updates, { date_s, [keys.count]: count, name_s, userAgent });

  // Acivity is only updated if present in recently received server info
  let events = this.site_events(keys, my.uid, date_s);
  if (events) {
    updates[keys.event] = events;
    updates.time = events[0].time;
    updates.time_s = events[0].time_s;
  }
  update(refPath, updates);
};

mo_dbase.prototype.site_events = function (keys, uid, date_s) {
  // ui_log('dbase.site_events uid', uid, date_s);
  let my = this.my;
  let events = this.app_init_events(keys, uid, date_s);
  if (!events) return null;

  let event = events[0];
  if (!my.eventLogTimeMax) {
    my.eventLogTimeMax = 2000;
    my.eventLogMax = 9;
  }
  let nowTime = new Date(date_s).getTime();
  let pastTime = new Date(event.date_s).getTime();
  let ndiff = nowTime - pastTime;
  if (ndiff > my.eventLogTimeMax) {
    // Create a new entry at head of the event log
    let time = 0;
    let time_s = '';
    event = { date_s, time, time_s };
    events.unshift(event);
  } else {
    // Update the first entry with new time and date
    event.date_s = date_s;
    event.time += ndiff;
    event.time_s = this.timeToSeconds(event.time);
  }
  this.updateTimeGap(events);
  if (events.length > my.eventLogMax) {
    // Delete the last entry to keep to max number permitted
    events.splice(-1, 1);
  }
  return events;
};

mo_dbase.prototype.app_init_events = function (keys, uid, date_s) {
  let my = this.my;
  let time = 0;
  let initActivities = [{ date_s, time }];
  // return null if no server info received yet
  //  or no entry for this device
  if (!my.fireb_devices) return null;

  let device = my.fireb_devices[uid];
  if (!device) return null;

  let events = device.dbase && device.dbase[keys.event];
  if (!events || events.length == 0) {
    return initActivities;
  }

  return events;
};

mo_dbase.prototype.site_isActive = function (device) {
  let my = this.my;
  let gapTime = this.site_eventGapTime(device);
  // console.log('dbase.site_isActive device.index', device.index, 'gapTime', lapgapTimese, my.eventLogTimeMax);
  return gapTime < my.eventLogTimeMax;
};

mo_dbase.prototype.site_eventGapTime = function (device) {
  let events = device.dbase && device.dbase.update;
  if (!events || events.length == 0) {
    return Number.MAX_VALUE;
  }
  let event = events[0];
  let gapTime = Date.now() - new Date(event.date_s);
  // console.log('dbase.site_eventGapTime device.index', device.index, 'gapTime', gapTime);
  return gapTime;
};

mo_dbase.prototype.site_device_for_uid = function (uid) {
  let my = this.my;
  let device = my.fireb_devices[uid];
  return device;
};

//
// fdevice.dbase.remote
// let active = dbase.device_uid_isActive(uid)
//
mo_dbase.prototype.device_uid_isActive = function (uid) {
  //
  let my = this.my;
  let fdevice = my.fireb_devices[uid];
  // console.log('device_uid_isActive uid', uid, 'remote', fdevice.dbase.remote);
  return this.site_isActive(fdevice) && fdevice.dbase.remote;
};
