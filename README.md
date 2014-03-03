
OpenKarotz NodeJS module
------------------------

A NodeJS Module to control a Karotz which run on [openkarotz](openkarotz.filippi.org).
It's simply an api wrapper.

#Use

```
npm install openkarotz
```

```
  var openkarotz = require('openkarotz');

  var karotz = new openkarotz('192.168.0.1');

  karotz.ears(5, 5, function(error, msg) {
    console.log(error); //false
    console.log(msg); //return json from the api
  });

```

#Commands

##Infos    
- internalStorage(callback);
- status(callback);
- get_version(callback);

##Led
- led(mainColor, secondColor, pulse, memory, period, callback)
- fixedLed(color, callback)
- pulsedLed(color, period, callback)

##Ears
- ears_mode(disabled, callback)
- ears(left, right, callback)
- ears_reset(callback)
- ears_random(callback)

##RFID
- rfid_start_record(callback)
- rfid_stop_record(callback)
- rfid_list(callback)
- rfid_list_ext(callback)
- rfid_info(tag, callback)
- rfid_delete(tag, callback)
- rfid_unassign(tag, callback)
- rfid_assign_eedomus_macro(tag, ip, macro, api_user, api_password, name, callback)
- rfid_test_vera_scene(tag, ip, scene, name, callback)
- rfid_assign_zibase_cmd(tag, ip, cmd, name, callback)
- rfid_assign_url(tag, url, name, user, password, callback)

##TTS
- display_cache(callback)
- clear_cache(callback)
- tts(text, voice, nocache, callback)
- voice_list(callback)

##Picture
- snapshot_list(callback)
- clear_snapshots(callback)
- take_snapshot(silent, callback)
- snapshot_ftp(server, user, password, dir, callback)

##Sounds
- sound(id, url, callback)
- sound_control(cmd, callback)
- sound_list(callback)

##Tools
- tools_clearlog(callback)
- tools_controllog(cmd, callback)
- tools_log(callback)
- tools_ls(callback)
- tools_net(callback)
- tools_ps(callback)
- correct_permissions(callback)



