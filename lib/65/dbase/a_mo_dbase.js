//
//

import { fireb_init } from '../fireb_/fireb_init.js';

//
// my.dbase = await mo_dbase_init(my)
//
export async function mo_dbase_init(my) {
  let dbase = new mo_dbase(my);
  await dbase.init();
  return dbase;
}
globalThis.mo_dbase_init = mo_dbase_init;
// explict global needed for browser non-module reference

export class mo_dbase {
  constructor(my) {
    this.my = my;
  }
  async init() {
    //
    let my = this.my;
    let config = fireb_init(my, my.fireb_config);
    //
    if (!my.mo_dbroot) my.mo_dbroot = 'm0-@r-@w-';
    //
    ui_log('configVersion', config.configVersion);
    ui_log('config.projectId', config.projectId);
    ui_log('configLabel', config.configLabel);
    ui_log('mo_dbroot', my.mo_dbroot);
    ui_log('mo_app', my.mo_app);
    ui_log('mo_room', my.mo_room);
    ui_log('mo_group', my.mo_group);

    this.report_status({ msg: 'Starting...' });

    let { signInAnonymously, auth } = my.fireb_;

    await signInAnonymously(auth);

    my.uid = auth.currentUser.uid;
    ui_log('dbase.app_init my.uid', my.uid);

    this.report_status({});

    this.site_observe();

    // Send initial ping
    this.update_device({}, { count: 1 });
  }
}
