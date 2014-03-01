
/**
 * A wrapper for the OpenKarotz API
 *
 * More informations about OpenKarotz here : http://openkarotz.filippi.org (french)
 */

var request      = require('request');


var karotz = {};

karotz.ip



var url = function() {
    return ip + '/cgi-bin/';
}




karotz.hello = function(callback){

    callback("Your ip is " + karotz.ip);
}





karotz.led = function(mainColor, secondColor, pulse, memory, period, callback){


    var params = {
        color  : mainColor,
        color2 : secondColor || "000000",
        pulse  : pulse || 0,
        memory : memory || 1,
        speed  : period || 1000
    } 

    query('leds', params, callback);

}



module.exports = karotz;