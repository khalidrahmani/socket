var websiteUrl = "http://trackingdashboard.herokuapp.com", cook = 'dash_visitor_id__38', logged_in_user_cookie = 'company_name_stats_user' ;
function setCookie(key, value, expiration) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (60 * 1000* expiration));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString()+"; path=/";;
}
function getCookie(key, set) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    if(set == true) setCookie(key, "123", 10000);
    return keyValue ? keyValue[2] : null;
}

var logedinkookie = getCookie(logged_in_user_cookie);
var cookie        = getCookie(cook, true);
var socket = io.connect(websiteUrl+'/track',{
    query: 'cookie='+logedinkookie+'|'+cookie 
  });

socket.on('broadcast_message', function(message) { 	
 	$("body").append(message)
});
