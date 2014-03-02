
/**
 * A wrapper for the OpenKarotz API
 *
 * More informations about OpenKarotz here : http://openkarotz.filippi.org (french)
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
    }

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
    }

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

        request({url: url() + api + '?' + serialize(params), json: true}, function(error, response, body) {

            //console.log(url() + api + '?' + serialize(params));

            if (!error && response.statusCode == 200) {

                callback(false, body);

            } else {
                callback(true, {msg: "Request error", status: response.statusCode});
            }

        });

    }

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
            return color

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
    } 



    /////////////////
    //API Wrapper  //
    /////////////////

    //Infos

    /**
     * internalStorage
     *
     * Get percent used space
     * 
     * @param  {Function} callback 
     */
    this.internalStorage = function(callback) {
        query('get_free_space', null, callback);
    }    

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
        "usb_percent_used_space":""}
     * 
     * @param  {Function} callback 
     */
    this.status = function(callback) {
        query('status', null, callback);
    }

    /**
     * sound_list
     *
     * Get sound_list
     * 
     * @param  {Function} callback 
     */
    this.sound_list = function(callback) {
        query('sound_list', null, callback);
    } 

    //State
    
    /**
     * wakeup
     *
     * @param  {boolean}  silent    Play sound or not. Default false
     * @param  {Function} callback 
     */
    this.wakeup = function(silent, callback) {

        var params = {
            silent : (silent ? 1 : 0)
        }

        query('wakeup', params, callback);
    }
    
    /**
     * sleep
     *
     * @param  {Function} callback 
     */
    this.sleep = function(callback) {

        query('sleep', params, callback);
    }

    //Led

    /**
     * led
     *
     * Control the led
     * 
     * @param  {string}   mainColor   The color. Default 'FFFFFF' RGB color.
     * @param  {string}   secondColor If pulse, the second color. Default '000000'. RGB color
     * @param  {boolean}  pulse       Activate pulse. Default false
     * @param  {boolean}  memory      Activate the log of the led's state. Default true.
     * @param  {int}      period      If pulse, the period (ms). Default 10000 ms.
     * @param  {Function} callback    
     */
    this.led = function(mainColor, secondColor, pulse, memory, period, callback){

        var params = {
            color  : (mainColor ? trueColor(mainColor) : trueColor('FFFFFF')),
            color2 : (secondColor ? trueColor(secondColor) : '000000'),
            pulse  : (pulse ? 1 : 0) || 0,
            memory : (memory ? 1 : 0) || 1,
            speed  : period || 1000
        } 

        query('leds', params, callback);

    }

    /**
     * fixedLed
     * 
     * @param  {string}   color    RGB
     * @param  {Function} callback 
     */
    this.fixedLed = function(color, callback) {
        karotz.led(color, null, false, true, null, callback);
    }

    /**
     * pulsedLed
     *
     * @param  {string}   color    RGB
     * @param  {int}      period   (ms)
     * @param  {Function} callback [description]
     */
    this.pulsedLed = function(color, period, callback) {
        karotz.led(color, null, true, true, period, callback);
    }

    //Ears
    
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
        }

        console.log(params);

        query('ears_mode', params, callback);
    }

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
        }

        query('ears', params, callback);
    }

    /**
     * ears_reset
     *
     * Reset ears position on top
     * 
     * @param  {Function} callback 
     */
    this.ears_reset = function(callback) {
        query('ears_reset', null, callback);
    }

    /**
     * ears_random
     * 
     * @param  {Function} callback
     */
    this.ears_random = function(callback) {
        query('ears_random', null, callback);
    }

    //RFID
    
    /**
     * rfid_start_record
     *
     * Start RFID recording to add a new rfid object
     * 
     * @param  {Function} callback
     */
    this.rfid_start_record = function(callback) {
        query('rfid_start_record', null, callback);
    }

    /**
     * rfid_stop_record
     *
     * Stop RFID recording
     * 
     * @param  {Function} callback
     */
    this.rfid_stop_record = function(callback) {
        query('rfid_stop_record', null, callback);
    }

    

}


module.exports = openKarotz;

