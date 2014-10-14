var websiteUrl = "https://0.0.0.0:3000", cook = 'dash_visitor_id__44', logged_in_user_cookie = 'company_name_stats_user';
function setCookie(key, value, expiration) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (60 * 1000* expiration));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString()+"; path=/";;
}
function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
var logedincookie = getCookie(logged_in_user_cookie);
var cookie        = getCookie(cook);
var socket = io.connect(websiteUrl+'/track',{
	query: 'cookie='+logedincookie+'|'+cookie 
});
socket.on('broadcast_message', function(message) { 	
 	$("body").append(message)
});
socket.on('visitor', function(visitor_id) { 	
 	setCookie(cook, visitor_id, 10000);
});
window.onload=function(){ document.getElementById('shop_cart').onclick=function(){ socket.emit('alert', "Button clicked");}; }