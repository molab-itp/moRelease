//
//

import { mo_dbase } from './a_mo_dbase.js';
// mo_dbase.prototype.

//
// options.group
// options.count
// options.all
//
// dbase.update_device(props, options);
// dbase.update_props(props, options); // !!@ renamed
// this.update_props( // !!@ renamed
//
mo_dbase.prototype.update_device = function (props, options) {
  // console.log('update_device props', props, 'options', options);
  // console.log('update_device this.my', this.my);
  // console.log('update_device this.my.uid', this.my.uid);
  let my = this.my;
  let deviceProps = props;
  let groupProps = {};
  options = options || {};
  let uids = { [my.uid]: 1 };
  if (options.all) {
    uids = my.a_device_values || uids;
  }
  let group = options.group;
  if (group) {
    groupProps = props;
    // group selected -- not per device prop update
    deviceProps = {};
  }
  // ui_log('update_item my.uid', my.uid);
  if (!my.uid) {
    return;
  }
  let path = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}`;
  if (options.path && !group) {
    path += '/' + options.path;
  }
  let { getRefPath, update, increment } = my.fireb_.fbase;
  let refPath = getRefPath(path);

  let groups = options.group;
  if (!groups) groups = 's0';
  groups = groups.split(',');

  // ui_verbose('dbase.update_props props', props, 'deviceProps', deviceProps);
  // ui_verbose('dbase.update_props groups', groups);
  // console.log('dbase.update_props props', props, 'deviceProps', deviceProps);
  // console.log('dbase.update_props groups', groups);

  let updates = {};

  // options.count for increment
  //  ../mo_app/a_device/count
  if (options.count) {
    deviceProps.count = increment(1);
  }

  for (let uid in uids) {
    for (let prop in deviceProps) {
      let value = deviceProps[prop];
      let dpath = `a_device/${uid}/${prop}`;
      updates[dpath] = value;
    }
  }

  // group=s1,s2,s3,s4 to broadcast
  // console.log('dbase.update_props groups', groups);
  for (let group of groups) {
    for (let prop in groupProps) {
      let value = groupProps[prop];
      if (options.path) {
        prop = options.path + '/' + prop;
      }
      let dpath = `a_group/${group}/${prop}`;
      updates[dpath] = value;
    }
  }
  ui_verbose('dbase.update_props updates', updates);

  // refPath = [SITE-URL]/${my.mo_dbroot}/${my.mo_app}/${my.mo_room}
  update(refPath, updates);

  this.site_event_update();
};

//
// dbase.update_value(value, apps)
//
mo_dbase.prototype.update_value = function (value, apps) {
  // apps = { app, tag, suffix }
  //
  let my = this.my;
  let app = my.mo_app;
  let tag = 'dbase.update_value';
  let suffix = '';
  if (apps) {
    app = apps.app || app;
    tag = apps.tag || tag;
    if (apps.suffix != undefined) suffix = '/' + apps.suffix;
  }
  if (!my.uid) {
    ui_log(tag + ' no uid', my.uid);
    return;
  }
  let path = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}/${my.uid}${suffix}`;
  let { getRefPath, update } = my.fireb_.fbase;
  let refPath = getRefPath(path);

  update(refPath, value);

  this.site_event_update();
};

//
// dbase.increment(value)
//
mo_dbase.prototype.increment = function (value) {
  let my = this.my;
  let { increment } = my.fireb_.fbase;
  return increment(value);
};

//
// dbase.remove_room()
//
mo_dbase.prototype.remove_room = function () {
  //
  let my = this.my;
  let path = `${my.mo_dbroot}/${my.mo_app}/${my.mo_room}`;
  let { getRefPath, set } = my.fireb_.fbase;
  let refPath = getRefPath(path);
  set(refPath, {})
    .then(() => {
      // Data saved successfully!
      ui_log('dbase.remove_room OK');
    })
    .catch((error) => {
      // The write failed...
      ui_log('dbase.remove_room error', error);
    });
};

//
// dbase.remove_mo_app()
//
mo_dbase.prototype.remove_mo_app = function () {
  //
  let path = `${my.mo_dbroot}/${my.mo_app}`;
  let { getRefPath, set } = my.fireb_.fbase;
  let refPath = getRefPath(path);
  set(refPath, {})
    .then(() => {
      // Data saved successfully!
      ui_log('dbase.remove_mo_app OK');
    })
    .catch((error) => {
      // The write failed...
      ui_log('dbase.remove_mo_app error', error);
    });
};
