
/**
 * A wrapper for the OpenKarotz API
 *
 * More informations about OpenKarotz here : http://openkarotz.filippi.org (french)
 */

var request      = require('request');


var karotz = {};

karotz.ip

karotz.hello = function(callback){

    callback("Your ip is " + karotz.ip);
}


module.exports = karotz;