
/**
 * A wrapper for the OpenKarotz API
 *
 * More informations about OpenKarotz here : http://openkarotz.filippi.org (french)
 */

var request      = require('request');





var karotz = {};

karotz.ip





////////////////////////
// Internal Functions //
////////////////////////

/**
 * url
 * @return {string}  
 */
var url = function() {
    return 'http://' + karotz.ip + '/cgi-bin/';
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
function serialize(obj, prefix) {
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
function query(api, params, callback) {

    request(url() + api + '?' + serialize(params), function(error, response, body) {

        if (!error && response.statusCode == 200) {

            callback(false, body);

        } else {
            callback(true, {msg: "Request error", status: response.statusCode});
        }

    });

}





/////////////////
//API Wrapper  //
/////////////////

karotz.hello = function(callback){

    //callback("Your ip is " + karotz.ip);
    
    var params = {
        pulse : 1,
        color: "FFFFFF",
        speed: 700
    }

    query('leds', null, callback);
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

