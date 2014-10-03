var websiteUrl = "http://0.0.0.0:3000", cook = 'dash_visitor_id__38', logged_in_user_cookie = 'company_name_stats_user' ;

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

/*
$(document).ready(function(){	
	var visitor_id = getCookie("dash_visitor_id__32") || "";
	var visit_id   = getCookie("dash_visit_id__32") || "";
    setInterval(function(){
		jQuery.ajax({
			type : "POST",
			data : {
				   visitor_id: visitor_id
				  ,visit_id: visit_id
				  ,mobile: jQuery.browser.mobile
			},
			url : websiteUrl+"/track",
			crossDomain : true,
			dataType : "json",
			success : function(data) {
				if(data.visitor_id){
					visitor_id = data.visitor_id;
					visit_id = data.visit_id;
					setCookie("dash_visitor_id__32", data.visitor_id, 1000);
					setCookie("dash_visit_id__32", data.visit_id, 5); // five min
				}
			}
		});
	}, 5000);
});
*/

var logedinkookie = getCookie(logged_in_user_cookie);
var cookie        = getCookie(cook, true);
var socket = io.connect(websiteUrl,{
    query: 'cookie='+logedinkookie+'|'+cookie 
  });
socket.on('broadcast_message', function(message) { 	
 	$("body").append(message)
});
