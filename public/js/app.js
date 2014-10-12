var live_users_chart, new_returning_logedin_visitors_chart, mobile_desktop_chart, urls_hit, locations, mapObject;
(function ($) {
    "use strict";                     

    $('#visitors-map').vectorMap({map: 'world_mill_en',
    scaleColors: ['#C8EEFF', '#0071A4'],
    normalizeFunction: 'polynomial',
    hoverOpacity: 0.7,
    hoverColor: false,
    markerStyle: {
      initial: {
        fill: '#F8E23B',
        stroke: '#383f47'
      }
    },
    backgroundColor: '#383f47',
    markers: []
    });

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

var visitors_data = []
var websiteURL = window.location.protocol + "//" + window.location.host 
var socket = io.connect(websiteURL+'/app')
mapObject = $('#visitors-map').vectorMap('get', 'mapObject');

socket.on('connect', function () { 
    setInterval(function(){
      socket.emit('update_chart', 'd', function (data) {
        if(visitors_data.length > 20) visitors_data.splice(0,1); 
        $("#engagement_time").html(data.time_on_site_since_midnight)
        visitors_data.push({"x": data.date, "value": data.count})
        live_users_chart.setData(visitors_data);
        new_returning_logedin_visitors_chart.setData(data.new_returning_visitors);  
        desktop_mobile_chart.setData(data.desktop_mobile);  
        urls_hit = "";        
        locations = "";
        for(var prop in data.live_urls_hit){ 
            urls_hit+= '<tr><td>'+prop+'</td><td>'+data.live_urls_hit[prop]+'</td></tr>'
        }
        for(var prop in data.users_location){ 
            locations+= '<tr><td>'+prop+'</td><td>'+data.users_location[prop]+'</td></tr>'
        }
        $("#urls_hit").html(urls_hit)
        $("#users_location").html(locations)
        mapObject.removeAllMarkers();        
        mapObject.addMarkers(data.map, []);
      });       
    }, 10000);       // 10 seconds
});

$( "#broadcast_message_button" ).click(function() {
    $( "#broadcast_title" ).prepend($("<span id='message_text'>message broadcasted</span>"));
    setTimeout(function(){$("#message_text").hide()}, 1000);
    socket.emit('broadcast_message', $( "#message" ).val());       
});
socket.on('alert', function(message) {      
    $.gritter.add({            
            title: 'Alert',            
            text: message,  
            sticky: true,            
            time: '',            
            class_name: 'my-sticky-class'
        });    
});

})(jQuery);



