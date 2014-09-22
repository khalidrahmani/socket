var my_chart, new_returning_visitors_chart;
(function ($) {
    "use strict";
         
            
if (Morris.EventEmitter) {            
            my_chart = Morris.Line({
                element: 'graph-area',
                data:   [],
                xkey: 'x',
                ykeys: ['value'],
                labels: ['value'],
                lineColors:['#1FB5AD'],
                parseTime: false
            });         
            new_returning_visitors_chart = Morris.Donut({
              element: 'new_returning_visitors_donut',
              data: [
                {label: "New Visitors", value: 50},
                {label: "Returning Visitors", value: 50}
              ]
            });
        }

    

})(jQuery);

var visitors_data = []
var websiteURL = 'http://localhost'
var websiteURL = 'http://trackingdashboard.herokuapp.com'
var socket = io.connect(websiteURL)
socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    setInterval(function(){
      socket.emit('update_chart', 'd', function (data) {
        //console.log(data)       
        if(visitors_data.length > 20) visitors_data.splice(0,1); 
        visitors_data.push({"x": data.date, "value": data.count})
        my_chart.setData(visitors_data);
        new_returning_visitors_chart.setData(data.new_returning_visitors);  
        urls_hit = locations = "";        
        for(var prop in data.live_urls_hit){ 
            urls_hit+= '<tr><td>'+prop+'</td><td>'+data.live_urls_hit[prop]+'</td></tr>'
        }
        for(var prop in data.users_location){ 
            locations+= '<tr><td>'+prop+'</td><td>'+data.users_location[prop]+'</td></tr>'
        }
        $("#urls_hit").html(urls_hit)
        $("#users_location").html(locations)
      });       
    }, 5000);       
});

$( "#broadcast_message_button" ).click(function() {
    $( "#broadcast_title" ).prepend($("<span id='message_text'>message broadcasted</span>"));
    setTimeout(function(){$("#message_text").hide()}, 1000);
    socket.emit('broadcast_message', $( "#message" ).val());    
           /* 
        jQuery.ajax({
            type : "POST",
            data : {
                broadcast_message: $( "#broadcast_message" ).val()
            },
            url : "/dashboard/broadcast",            
            dataType : "json",
            success : function(data) {
                $( "#broadcast_title" ).prepend($("<span id='message_text'>"+data.message+"</span>"));
                setTimeout(function(){$("#message_text").hide()}, 1000);
            }
            }); 
        */
    });