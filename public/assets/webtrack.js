var domain = document.domain, c_name = "rptrack_"+domain, websiteUrl = "http://sitetracker.redpointrack.com"; 
function loaded() {
	
			var v_id = v_phone = v_type = clientId = ''
			if (typeof(_gaq) != 'undefined') {
				ga(function(tracker) {
			      clientId = tracker.b.data.w[":trackingId"]
				})
			}
			var mySwfStore = new SwfStore({
				  namespace: "redpointrack.com",
				  swf_url: "//nfriedly.github.io/Javascript-Flash-Cookies/storage.swf",		  
				  onready: function() {
				  	  var phones = []
					  $("span[class^='phone']").each(function( index ) {
					  	  	txt = $( this ).text().replace(/-/g, '').slice( 1 )
				  			if (phones.indexOf(txt)==-1) phones.push(txt);
			  			})				  	  
					  if(mySwfStore.get(c_name+'v_id')){					  		
							v_id    = mySwfStore.get(c_name+'v_id');
							v_phone = mySwfStore.get(c_name+'v_phone');
							v_type  = mySwfStore.get(c_name+'v_type');
						}
					  jQuery.ajax({
							type : "POST",
							data : {
								  v_id: v_id
								 ,v_phone: v_phone
								 ,v_type: v_type
								 ,phones: phones								
								 ,ref: document.referrer
								 ,clientId: clientId
							},
							url : websiteUrl+"/ph",
							crossDomain : true,
							dataType : "json",
							success : function(data) {
								mySwfStore.set(c_name+'v_type', data.type);
								mySwfStore.set(c_name+'v_id', data.v_id);
								if(data.changeNumber){
									$("span[class^='"+data.spanclass+"']").each(function( index ) {
										var  _this  = $( this )
											,number = _this.text().replace(/[()-]/g, "");
										if(data.type == "PhoneNumberPerVisitor"){
											_this.html(data.ph);
										}
										else{
											for (var elmnt in data.ph) {														
												if(number.indexOf(elmnt) > -1){
													number = data.ph[elmnt];
													number = "1-"+number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
													_this.html(number);
													break	
												}
											}
										}
									});									
								}
								else{
									jQuery('span.'+data.spanclass).html(data.ph);									
									mySwfStore.set(c_name+'v_phone', data.ph);
								}																														
							}
						})					    
				  },
				  onerror: function() {
				    console.error('swfStore failed to load :(');
				  }
				});
};

function load(){	
    if(window.jQuery === undefined){
        var script = document.createElement('script');
        script.onload = loadFlashStorage;
        script.src = ('https:' == location.protocol ? 'https':'http')+'://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);        
    }else{
    	loadFlashStorage();
    }	
}	
function loadFlashStorage(){
	var script = document.createElement('script');
    script.onload = loaded;
    script.src = '//nfriedly.github.io/Javascript-Flash-Cookies/src/swfstore.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
}

setTimeout(function(){	load(); }, 1000);	
