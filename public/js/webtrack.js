function setCookie(key, value, expiration) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (60 * 1000* expiration));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}
function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
$(document).ready(function(){
	var websiteUrl = "http://0.0.0.0:3000";
	var visitor_id = getCookie("dash_visitor_id__3") || "";
	var visit_id   = getCookie("dash_visit_id__3") || "";
    setInterval(function(){
		jQuery.ajax({
			type : "POST",
			data : {
				   visitor_id: visitor_id
				  ,visit_id: visit_id
			},
			url : websiteUrl+"/track",
			crossDomain : true,
			dataType : "json",
			success : function(data) {
				if(data.visitor_id){
					visitor_id = data.visitor_id;
					visit_id = data.visit_id;
					setCookie("dash_visitor_id__3", data.visitor_id, 1000);
					setCookie("dash_visit_id__3", data.visit_id, 5); // five min
				}
			}
		});
	}, 5000);
});
