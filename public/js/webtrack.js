var websiteUrl = "https://0.0.0.0:3000", app_cookie = 'dash_visitor_id__45', logged_in_user_cookie = 'company_name_stats_user';
function setCookie(key, value, expiration) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (60 * 1000* expiration));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString()+"; path=/";;
}
function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

window.onload=function(){
	var logedincookie 				= getCookie(app_cookie); // logged_in_user_cookie
	var visitor_id    				= getCookie(app_cookie);
	var total_items_incart          = document.getElementById('total_items_incart').innerHTML
	var socket = io.connect(websiteUrl+'/track',{
		query: 'cookie='+logedincookie+'|'+visitor_id +'|'+total_items_incart
	});
	socket.on('broadcast_message', function(message) {
	 	$("body").append(message)
	});
	socket.on('visitor', function(visitor_id) {
	 	setCookie(app_cookie, visitor_id, 10000);
	});
	document.getElementById('shop_cart').onclick=function(){ socket.emit('alert', "Button clicked");}; 
}