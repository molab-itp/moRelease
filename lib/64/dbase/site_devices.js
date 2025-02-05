//
// app_init.js

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

// return array of devices, most recently active first
//
// let devices = dbase.site_devices(show);
//
mo_dbase.prototype.site_devices = function (show) {
  let my = this.my;
  if (!my.fireb_devices) {
    // console.log('no fireb_devices');
    return [];
  }
  let arr = Object.values(my.fireb_devices).sort((item1, item2) => {
    let date1 = item1.dbase.date_s;
    let date2 = item2.dbase.date_s;
    return date1.localeCompare(date2);
  });
  // Latest date first
  arr.reverse();
  if (show) {
    let lines = [];
    for (let item of arr) {
      let { uid } = item;
      let { date_s, visit_count, update_count, userAgent } = item.dbase;
      userAgent = userAgent.substring(8, 48);
      lines.push(date_s + ' visit_count ' + visit_count + ' update_count ' + update_count);
      lines.push(uid + ' ' + userAgent);
      // console.log('');
    }
    lines.push('dbase.site_devices n ' + arr.length);
    ui_log(lines.join('\n'));
  }
  return arr;
};
