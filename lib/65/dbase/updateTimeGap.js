//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

//
// dbase.updateTimeGap()
//
mo_dbase.prototype.updateTimeGap = function (events) {
  for (let index = 1; index < events.length; index++) {
    let nowEnt = events[index - 1];
    let nowTime = new Date(nowEnt.date_s).getTime();
    let pastEnt = events[index];
    let pastTime = new Date(pastEnt.date_s).getTime();
    nowEnt.gap = nowTime - pastTime - nowEnt.time;
    nowEnt.gap_s = this.timeToSeconds(nowEnt.gap);
  }
};

//
// let t = dbase.timeToSeconds(time);
//
mo_dbase.prototype.timeToSeconds = function (time) {
  let str = '';
  let secs = time / 1000;
  let mins = Math.floor(secs / 60);
  // console.log('mins', mins);
  secs -= mins * 60;
  let hours = Math.floor(mins / 60);
  // console.log('hours', hours);
  mins -= hours * 60;
  let days = Math.floor(hours / 24);
  // console.log('days', days);
  hours -= days * 24;
  if (secs != 0) {
    secs = secs.toFixed(3);
    str = secs + ' secs';
  }
  if (mins != 0) {
    str = mins + ' mins ' + str;
  }
  if (hours != 0) {
    str = hours + ' hours ' + str;
  }
  if (days != 0) {
    str = days + ' days ' + str;
  }
  return str;
};
