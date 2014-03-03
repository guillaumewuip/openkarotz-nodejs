
/**
 * A wrapper for the OpenKarotz API
 *
 * More informations about OpenKarotz here : http://openkarotz.filippi.org 
 * (french)
 */

var request      = require('request');





var openKarotz = function(ip) {


    ////////////////////////
    // Internal Functions //
    ////////////////////////

    /**
     * url
     * @return {string}  
     */
    var url = function() {
        return 'http://' + ip + '/cgi-bin/';
    };

    /**
     * serialize
     *
     * Transform an object in a query string 
     * ex: {foo: "hi there", bar: "100%" } to foo=hi%20there&bar=100%25
     *
     * @see http://stackoverflow.com/a/1714899/2058840
     * 
     * @param  {object} obj    The object containning the params
     * @param  {string} prefix 
     * @return {string}        
     */
    var serialize = function (obj, prefix) {
      var str = [];

      for(var p in obj) {

        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];

        str.push(typeof v == "object" ?
          serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));

      }
      return str.join("&");
    };

    /**
     * query
     *
     * Manage a query to the Karotz
     * 
     * @param  {string}   api      The api to reach (ex: leds)
     * @param  {object}   params   Some params
     * @param  {Function} callback 
     */
    var query = function (api, params, callback) {

        request(
            {url: url() + api + '?' + serialize(params), json: true}, 
            function(error, response, body) {

            //console.log(url() + api + '?' + serialize(params));
            //console.log(body);

            if (!error && response && response.statusCode == 200) {

                callback(false, body);

            } else {
                callback(
                    true, 
                    {
                        msg: "Request error", 
                        status: (response ? response.statusCode : undefined)
                    }
                );
            }

        });

    };

    /**
     * trueColor
     *
     * Because the rabbit has a filter in front of the led,
     * we need to transform the color to see the good one.
     * 
     * @param  {string} color RGB color. format RRGGBB
     * @return {string}       RGB color
     */
    var trueColor = function(color) {

        if (color.length != 6 ) 
            return color;

        var r = color.substring(0,2);
        var g = color.substring(2,4);
        var b = color.substring(4,6);

        r = parseInt(r,16);
        b = parseInt(b,16);

        r = Math.floor(r*0.3);
        b = Math.floor(b*0.4);

        r = r.toString(16);
        b = b.toString(16);

        if (r.length == 1) r = "0"+r;
        if (b.length == 1) b = "0"+b;

        return r + g + b;
    }; 



    /////////////////
    //API Wrapper  //
    /////////////////

    //$Infos

    /**
     * internalStorage
     *
     * Get percent used space
     * 
     * @param  {Function} callback 
     */
    this.internalStorage = function(callback) {
        query('get_free_space', null, callback);
    };    

    /**
     * status
     *
     * Get status
     *
        {"version":"200",
        "ears_disabled":"0",
        "sleep":"0",
        "sleep_time":"0",
        "led_color":"000066",
        "led_pulse":"1",
        "tts_cache_size":"0",
        "usb_free_space":"-1",
        "karotz_free_space":"154.1M",
        "eth_mac":"00:00:00:00:00:00",
        "wlan_mac":"00:00:00:00:00:00",
        "nb_tags":"0",
        "nb_moods":"305",
        "nb_sounds":"14",
        "nb_stories":"0",
        "karotz_percent_used_space":"34",
        "usb_percent_used_space":""};
     * 
     * @param  {Function} callback 
     */
    this.status = function(callback) {
        query('status', null, callback);
    }; 

    /**
     * get_version
     *
     * Get openKarotz's version
     * @param  {Function} callback 
     */
    this.get_version = function(callback) {
        query('get_version', null, callback);
    };

    //$State
    
    /**
     * wakeup
     *
     * @param  {boolean}  silent    Play sound or not. Default false
     * @param  {Function} callback 
     */
    this.wakeup = function(silent, callback) {

        var params = {
            silent : (silent ? 1 : 0)
        };

        query('wakeup', params, callback);
    };
    
    /**
     * sleep
     *
     * @param  {Function} callback 
     */
    this.sleep = function(callback) {

        query('sleep', params, callback);
    };

    //$Led

    /**
     * led
     *
     * Control the led
     * 
     * @param  {string}   mainColor   The color. Default 'FFFFFF' RGB color.
     * @param  {string}   secondColor If pulse, the second color. 
     *                                Default '000000'. RGB color
     * @param  {boolean}  pulse       Activate pulse. Default false
     * @param  {boolean}  memory      Activate the log of the led's state. 
     *                                Default false.
     * @param  {int}      period      If pulse, the period (ms). 
     *                                Default 10000 ms.
     * @param  {Function} callback    
     */
    this.led = function(
        mainColor, secondColor, pulse, memory, period, callback) {

        var params = {
            color  : (mainColor ? trueColor(mainColor) : trueColor('FFFFFF')),
            color2 : (secondColor ? trueColor(secondColor) : '000000'),
            pulse  : (pulse ? 1 : 0),
            memory : (memory ? 1 : 0),
            speed  : period || 1000
        }; 

        query('leds', params, callback);

    };

    /**
     * fixedLed
     * 
     * @param  {string}   color    RGB
     * @param  {Function} callback 
     */
    this.fixedLed = function(color, callback) {
        karotz.led(color, null, false, true, null, callback);
    };

    /**
     * pulsedLed
     *
     * @param  {string}   color    RGB
     * @param  {int}      period   (ms)
     * @param  {Function} callback 
     */
    this.pulsedLed = function(color, period, callback) {
        karotz.led(color, null, true, true, period, callback);
    };

    //$Ears
    
    /**
     * ears_mode
     *
     * Enable or disable ears move
     * 
     * @param  {boolean}  disabled Default false
     * @param  {Function} callback 
     */
    this.ears_mode = function(disabled, callback) {

        var params = {
            disable : (disabled ? 1 : 0)
        };

        console.log(params);

        query('ears_mode', params, callback);
    };

    /**
     * ears
     *
     * Move ears
     * 
     * @param  {int}      left     in [1, 16]
     * @param  {int}      right    in [1, 16]
     * @param  {Function} callback 
     */
    this.ears = function(left, right, callback) {
        
        var params = {
            left  : left,
            right : right
        };

        query('ears', params, callback);
    };

    /**
     * ears_reset
     *
     * Reset ears position on top
     * 
     * @param  {Function} callback 
     */
    this.ears_reset = function(callback) {
        query('ears_reset', null, callback);
    };

    /**
     * ears_random
     * 
     * @param  {Function} callback
     */
    this.ears_random = function(callback) {
        query('ears_random', null, callback);
    };

    //$RFID
    
    /**
     * rfid_start_record
     *
     * Start RFID recording to add a new rfid object
     * 
     * @param  {Function} callback
     */
    this.rfid_start_record = function(callback) {
        query('rfid_start_record', null, callback);
    };

    /**
     * rfid_stop_record
     *
     * Stop RFID recording
     * 
     * @param  {Function} callback
     */
    this.rfid_stop_record = function(callback) {
        query('rfid_stop_record', null, callback);
    };

    /**
     * rfid_list
     *
     * Return recorded RFID tags with assignement
     * 
     * @param  {Function} callback 
     */
    this.rfid_list = function(callback) {
        query('rfid_list', null, callback);
    };

    /**
     * rfid_list_ext
     *
     * Return recorded RFID tags
     * 
     * @param  {Function} callback 
     */
    this.rfid_list_ext = function(callback) {
        query('rfid_list_ext', null, callback);
    };

    /**
     * rfid_info
     *
     * Get info about a tag
     * 
     * @param  {strinf}   tag      The tag's id
     * @param  {Function} callback 
     * @return {[type]}            
     */
    this.rfid_info = function(tag, callback) {

        var params = {
            tag : tag
        };

        query('rfid_info', params, callback);
    };

    /**
     * rfid_delete
     *
     * Delete tag
     * 
     * @param  {string}   tag      The tag's id
     * @param  {Function} callback 
     */
    this.rfid_delete = function(tag, callback) {

        var params = {
            tag : tag
        };

        query('rfid_delete', params, callback);
    };

    /**
     * rfid_unassign
     *
     * Unassign tag
     * 
     * @param  {string}   tag      The tag's id
     * @param  {Function} callback 
     */
    this.rfid_unassign = function(tag, callback) {

        var params = {
            tag : tag
        };

        query('rfid_unassign', params, callback);
    };

    /**
     * rfid_assign_eedomus_macro
     * 
     * @param  {string}   tag          
     * @param  {string}   ip           
     * @param  {string}   macro        
     * @param  {string}   api_user     
     * @param  {string}   api_password 
     * @param  {string}   name         
     * @param  {Function} callback                   
     */
    this.rfid_assign_eedomus_macro = function(
        tag, ip, macro, api_user, api_password, name, callback) {

        var params = {
            tag          : tag,
            ip           : ip,
            macro        : macro,
            api_user     : api_user,
            api_password : api_password,
            name         : name
        };

        query('rfid_assign_eedomus_macro', params, callback);
    };

    /**
     * rfid_test_vera_scene
     * 
     * @param  {string}   tag      
     * @param  {string}   ip       
     * @param  {string}   scene    
     * @param  {string}   name     
     * @param  {Function} callback 
     */
    this.rfid_test_vera_scene = function(tag, ip, scene, name, callback) {

        var params = {
            tag          : tag,
            ip           : ip,
            scene        : scene,
            name         : name
        };

        query('rfid_test_vera_scene', params, callback);
    };

    /**
     * rfid_assign_zibase_cmd
     * 
     * @param  {string}   tag      
     * @param  {string}   ip       
     * @param  {string}   cmd      
     * @param  {string}   name     
     * @param  {Function} callback 
     */
    this.rfid_assign_zibase_cmd = function(tag, ip, cmd, name, callback) {

        var params = {
            tag          : tag,
            ip           : ip,
            cmd          : cmd,
            name         : name
        };

        query('rfid_assign_zibase_cmd', params, callback);
    };

    /**
     * rfid_assign_url
     *
     * Assign an url to an rfid tag
     *
     * Warning : it seems that urls with params (ie ?foo=bar&etc=123) don't work
     * The problem comes from OpenKarotz
     * @see url.inc in OpenKarotz
     * 
     * @param  {string}   tag      
     * @param  {string}   url      
     * @param  {string}   name     
     * @param  {string}   user     
     * @param  {string}   password 
     * @param  {Function} callback       
     */
    this.rfid_assign_url = function(tag, url, name, user, password, callback) {

        var params = {
            tag          : tag,
            url          : url,
            name         : name,
            user         : user,
            password     : password
        };

        query('rfid_assign_url', params, callback);
    };

    //$TTS
    
    /**
     * display_cache
     *
     * Return tts in cache
     * 
     * @param  {Function} callback 
     */
    this.display_cache = function(callback) {
        query('display_cache', null, callback);
    };

    /**
     * clear_cache
     * 
     * @param  {Function} callback 
     */
    this.clear_cache = function(callback) {
        query('clear_cache', null, callback);
    };

    /**
     * tts
     * 
     * @param  {string}   text     The text to speech
     * @param  {string}   voice    The voice 
     *                             (Alice, Claire, Julie, Justine, Margaux, 
     *                             Louise, Antoine, Bruno, Heather, Ryan)
     * @param  {boolean}  nocache  Don't the text in cache. Default false.
     * @param  {Function} callback 
     */
    this.tts = function(text, voice, nocache, callback) {
        var params = {
            text  : text,
            voice : voice || "margaux",
            nocache : (nocache ? 1 : 0)
        };

        query('tts', params, callback);
    };

    /**
     * voice_list
     *
     * @param  {Function} callback 
     * @return {[type]}            
     */
    this.voice_list = function(callback) {
        query('voice_list', null, callback);
    };

    //$Picture
    
    /**
     * snapshot_list
     *
     * Get snapshot list
     * 
     * @param  {Function} callback 
     */
    this.snapshot_list = function(callback) {
        query('snapshot_list', params, callback);
    };

    /**
     * clear_snapshots
     *
     * Clear all snapshots
     * 
     * @param  {Function} callback 
     */
    this.clear_snapshots = function(callback) {
        query('clear_snapshots', params, callback);
    };

    /**
     * take_snapshot
     *
     * Take a snapshot
     *
     * Example :
     
        {"filename":"snapshot_2014_03_02_19_51_49.jpg",
         "thumb":"snapshot_2014_03_02_19_51_49.thumb.gif",
         "return":"0"}
     *
     * All snapshots are saved in openkarotz/Snapshots
     *
     * Get snapshot : 
     * .../cgi-bin/spnapshot_get/?filename=snapshot_2014_02_28_19_38_26.jpg
     * 
     * @param  {boolean}  silent   Be silent or not. Default not.
     * @param  {Function} callback 
     */
    this.take_snapshot = function(silent, callback) {

        var params = {
            silent : (silent ? 1 : 0)
        };

        query('take_snapshot', params, callback);
    };

    /**
     * snapshot_ftp
     *
     * Take a snapshot and upload it to FTP.
     * 
     * @param  {string}   server   
     * @param  {string}   user     
     * @param  {string}   password 
     * @param  {string}   dir      Remote directory
     * @param  {Function} callback 
     */
    this.snapshot_ftp = function(server, user, password, dir, callback) {

        var params = {
            server : server,
            user : user || "",
            password : password || "",
            dir : dir || ""
        };

        query('snapshot_ftp', params, callback);
    };

    //$Sounds

    /**
     * sound
     *
     * Play a sound with his id (local) or his url (external).
     *
     * Local sounds are in openkarotz/Sounds
     * 
     * @param  {int}      id        @see sound_list()
     * @param  {string}   url      
     * @param  {Function} callback        
     */
    this.sound = function(id, url, callback) {

        var param = {};

        if (id)
            params.id = id;
        else if (url)
            params.url = url;

        query('sound', params, callback);
    };

    /**
     * sound_control
     *
     * Control sound
     * 
     * @param  {string}   cmd      seek, quit, pause, loop, volume, mute, 
     *                             loadfile, loadlist, run
     * @param  {Function} callback 
     */
    this.sound_control = function(cmd, callback) {

        var params = {
            cmd : cmd
        };

        query('sound_control', params, callback);
    };

    /**
     * sound_list
     *
     * Get sound_list
     * 
     * @param  {Function} callback 
     */
    this.sound_list = function(callback) {
        query('sound_list', null, callback);
    };

    //$Tools
    
    /**
     * tools_clearlog
     *
     * Clear /var/log/messages
     * 
     * @param  {Function} callback 
     */
    this.tools_clearlog = function(callback) {
        query('tools_clearlog', null, callback);
    };  

    /**
     * tools_controllog
     *
     * Start / stop log
     * 
     * @param  {string}   cmd      "start" | "stop"
     * @param  {Function} callback 
     */
    this.tools_controllog = function(cmd, callback) {

        var params = {
            cmd : cmd
        };

        query('tools_controllog', params, callback);
    };    

    /**
     * tools_log
     *
     * Get log
     * 
     * @param  {Function} callback
     */
    this.tools_log = function(callback) {
        query('tools_log', null, callback);
    };    
    
    /**
     * tools_ls
     *
     * Result of the command "ls -la" in src
     * 
     * @param  {string}   src      
     * @param  {Function} callback 
     */
    this.tools_ls = function(src, callback) {

        var params = {
            src : src
        };

        query('tools_ls', params, callback);
    };
  
    /**
     * tools_net
     * 
     * @param  {Function} callback
     */
    this.tools_net = function(callback) {
        query('tools_net', null, callback);
    };

    /**
     * tools_ps
     * 
     * @param  {Function} callback
     */
    this.tools_ps = function(callback) {
        query('tools_ps', null, callback);
    };

    /**
     * correct_permissions
     *
     * 777 permission for usr/www & usr/www/cgi-bin
     * 
     * @param  {Function} callback 
     */
    this.correct_permissions = function(callback) {
        query('correct_permissions', null, callback);
    };
    
    
};


module.exports = openKarotz;

