var live_users_chart, new_returning_logedin_visitors_chart, mobile_desktop_chart;
(function ($) {
    "use strict";                     
    if (Morris.EventEmitter) {            
            live_users_chart = Morris.Line({
                element: 'graph-area',
                data:   [],
                xkey: 'x',
                ykeys: ['value'],
                labels: ['value'],
                lineColors:['#1FB5AD'],
                parseTime: false
            });         
            new_returning_logedin_visitors_chart = Morris.Donut({
              element: 'new_returning_visitors_donut',
              data: [
                {label: "New Visitors", value: 50},
                {label: "Returning Visitors", value: 50}
              ]
            });
            desktop_mobile_chart = Morris.Donut({
              element: 'desktop_mobile_chart',
              data: [
                {label: "Desktop", value: 50},
                {label: "Mobile", value: 50}
              ]
            });            
        }
})(jQuery);

var visitors_data = []

var websiteURL = window.location.protocol + "//" + window.location.host 
var socket = io.connect(websiteURL)
socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    setInterval(function(){
      socket.emit('update_chart', 'd', function (data) {
        if(visitors_data.length > 20) visitors_data.splice(0,1); 
        visitors_data.push({"x": data.date, "value": data.count})
        live_users_chart.setData(visitors_data);
        new_returning_logedin_visitors_chart.setData(data.new_returning_visitors);  
        desktop_mobile_chart.setData(data.desktop_mobile);  
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
    }, 10000);       
});

$( "#broadcast_message_button" ).click(function() {
    $( "#broadcast_title" ).prepend($("<span id='message_text'>message broadcasted</span>"));
    setTimeout(function(){$("#message_text").hide()}, 1000);
    socket.emit('broadcast_message', $( "#message" ).val());       
});