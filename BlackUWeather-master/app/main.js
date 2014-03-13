/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/experimental.app.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(intentData) {
    chrome.app.window.create('index.html', {
        width: 500,
        height: 309
    });
});
var app =angular.module("BlackUWeather", []);
app.controller('OllieCtrl', function($scope, $http){
  console.log("in the controller");
function isItGoneRain(){

  function gotLocation(location){
    var latlong = location.coords.latitude + ',' + location.coords.longitude;
    var apiKey = '252529335fa39680e530966f42ef1c56';
    var forecastURL = 'https://api.forecast.io/forecast/'+apiKey+'/'+latlong;
    $http.get(forecastURL).success(
      function(response){
        console.log(response);
        notify(response.minutely.summary, response.hourly.summary);
        if(response.minutely.summary.indexOf('rain')){document.getElementById('gonerain').play();}
      }
      )
  }
  
  function locationError (e){
    console.log(e);
  }

  if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(gotLocation, locationError);
  } else {
    error('not supported');
  }
}


function notify(title, subhead) {
  var havePermission = window.webkitNotifications.checkPermission();
  if (havePermission == 0) {
    // 0 is PERMISSION_ALLOWED
    var notification = window.webkitNotifications.createNotification(
      'ollie.gif', title, subhead
    );
    
    notification.onclick = function () {
      window.open("http://forecast.io");
      notification.close();
    }
    notification.show();
    setTimeout(notification.hide, 15000);
  } else {
      window.webkitNotifications.requestPermission();
  }
}

var blank = document.getElementById('blank');

var timeout = 
  setTimeout(
    isItGoneRain
  , 1000);



});
