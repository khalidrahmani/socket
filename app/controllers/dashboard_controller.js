var mongoose        = require('mongoose')
   ,Visit           = mongoose.model('Visit')    
   ,Visitor         = mongoose.model('Visitor')  
   ,moment          = require('moment')
   ,async           = require("async")
   ,_               = require('underscore')
   ,geoip           = require('geoip-lite')
   ,users_location  = {}
   ,map             = []
   ,live_urls_hit   = {}
   ,graph_data      = []
   ,time_on_site_since_midnight = 0
   

var allUsers = [];
exports.index = function (req, res) {	
	var  now = new Date()           
        ,month_visitors_peack = 0;
        graph_data = []
        hours = []
        hour     = now.getHours()
        time_on_site_since_midnight = 0
        //for (i = 0; i <= hour; i++){
        //    hours.push(i)
        //}

        getGraphData(0, hour, function(){
                midnight = now.setHours(0, 0, 0, 0)
                var last_month = new Date()
                last_month.setMonth(last_month.getMonth() - 1)
                mvp = [];    
                Visit.find({ start: {$gte: last_month} }).exec(function (err, visits) {
                    for (var i = 0;i<visits.length;i++){
                        index = visits[i].start.getDay()+"-"+visits[i].start.getMonth()
                        mvp[index] = mvp[index] || 0;
                        mvp[index] += 1;
                        if(mvp[index] > month_visitors_peack ) month_visitors_peack = mvp[index]
                    }    
                    Visit.find({ end: {$gte: midnight} }).exec(function (err, visits) {
                        for (var key in visits) {
                            time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
                        } 
                        res.render('dashboard/index', {             
                            time_on_site_since_midnight: time_on_site_since_midnight, 
                            formated_time_on_site_since_midnight: formatDate(moment(moment({ seconds: time_on_site_since_midnight }))),
                            month_visitors_peack: month_visitors_peack,
                            graph_data: graph_data
                        })
                    })  
                })
        })

/*
        //minutes  = now.getMinutes()
        for (i = 0; i <= hour; i++){
            hours.push(i)
            //graph_data.push({"x": format(i), "value": i*2})
            //if(i != hour || minutes > 30) graph_data.push({"x": formatMinutes(i), "value": i*2})
        }  
        console.log(hours)
        async.each(hours, function(hour, callback){
            date = now.setHours(hour)
            console.log(date)
           // Visit.count({ }, function (err, count) { //  start: {$lt: date}, end: {$gte: date}
              //  if(err) console.log(err)
                console.log(hour)
                graph_data.push({"x": format(hour), "value": 4});
                //console.log(graph_data)
                 
            //});
            callback();
          },
          function(err){
            console.log("render")
                midnight = now.setHours(0, 0, 0, 0)
                var last_month = new Date()
                last_month.setMonth(last_month.getMonth() - 1)
                mvp = [];    
                Visit.find({ start: {$gte: last_month} }).exec(function (err, visits) {
                    for (var i = 0;i<visits.length;i++){
                        index = visits[i].start.getDay()+"-"+visits[i].start.getMonth()
                        mvp[index] = mvp[index] || 0;
                        mvp[index] += 1;
                        if(mvp[index] > month_visitors_peack ) month_visitors_peack = mvp[index]
                    }    
                    Visit.find({ end: {$gte: midnight} }).exec(function (err, visits) {
                        for (var key in visits) {
                            time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
                        } 
                        res.render('dashboard/index', {             
                            time_on_site_since_midnight: time_on_site_since_midnight, 
                            formated_time_on_site_since_midnight: formatDate(moment(moment({ seconds: time_on_site_since_midnight }))),
                            month_visitors_peack: month_visitors_peack,
                            graph_data: graph_data
                        })
                    })  
                })
            }
        );
*/
        
    /*for (var i = 0; i < 30; i++) {
        start =   now.setDays(now.getDays()-i);
        end   =   now.setDays(now.getDays()-i-1);
        Visit.count({ start: {$gte: start}, end: {$lt: end} }).exec(function (err, count) {
            max_count = (count > max_count)? count : max_count;
        })
    };   
    */
   
}
function getGraphData(start, hour, cb){
    if(hour >= start ){
        date = new Date() 
        date.setHours(start)
        date.setMinutes(0)
        date.setSeconds(0)
        Visit.count({start: {$lt: date}, end: {$gte: date}}, function (err, count) {
            console.log("start : "+ start)
            console.log(date)
            console.log("count :"+ count)
            graph_data.push({"x": format(start), "value": count}); 
            getGraphData(start+1, hour, cb)      
        })
    }
    else cb()
}
exports.track = function(socket, io){  
    var visitor_ip          = socket.handshake.headers['x-forwarded-for']    
       ,url                 = socket.handshake.headers.origin
       
    visitor_ip              = '107.4.145.158' // '197.247.236.119' // // ;
    console.log(visitor_ip + '----------------------------------------------------------------');
    var geo                 = geoip.lookup(visitor_ip);
    console.log(geo)
    socket.geo = geo
    if(geo){
        country = geo.country+' '+geo.city
        map.push({ latLng: [geo.ll[0], geo.ll[1]], name: country })
        console.log(map)        
        if(users_location[country]) users_location[country] += 1;
        else users_location[country] = 1;
    }
    if(live_urls_hit[url]) live_urls_hit[url] += 1;
    else live_urls_hit[url] =  1;
    
    query = socket.request._query.cookie
    console.log(query)
    query = query.split('|')  
    if(query[0] != 'null') { socket.logged_in = true; }
    if(query[1] != 'null') { socket.returning = true; }   
    else { 
        visitor = new Visitor()
        visitor.ip = visitor_ip
        visitor.save(function(err, rec) {
            if(err) console.log(err)
            else{
               socket.visitor_id = rec.id
               socket.emit('visitor', rec.id)         
            }           
        });        
    } 

    allUsers.push(socket);   
    
    socket.on('disconnect', function () {
        console.log('disconnected')
        start_date = new Date(socket.handshake.time)
        mobile = (socket.handshake.headers['user-agent'].indexOf("Mobile") > -1)
        Visit.create({visitor: socket.visitor_id, start: start_date, url: url, mobile: mobile}, function (err) {  })        
        live_urls_hit[url] -= 1
        var i = allUsers.indexOf(socket)
        allUsers.splice(i, 1)
        if(socket.geo){      
            users_location[country] -= 1      
            for(key in map){
                if(map[key].latLng[0] == socket.geo.ll[0] && map[key].latLng[1] == socket.geo.ll[1]){
                    console.log(map[key].latLng[0] + " =  " +  socket.geo.ll[0])
                    map.splice(key, 1)      
                }                
            }             
        }
    });  
    socket.on('alert', function (message, fn) {
        console.log(message)
        io.of('app').emit('alert', message);
    })
}

exports.app = function(socket, io){
    socket.on('update_chart', function (name, fn) {
        var new_visitors = returning_visitors = 0
        var live_users_count = allUsers.length
        console.log(time_on_site_since_midnight)
        time_on_site_since_midnight = time_on_site_since_midnight + live_users_count*10
        console.log(map)
        date = new Date()
        _date = format(date.getHours())+":"+format(date.getMinutes())+":"+format(date.getSeconds())
        visitors_data  = getVisitorsData(live_users_count, allUsers)
        fn({    date: _date,    
                count: live_users_count,
                new_returning_visitors: visitors_data[0],
                desktop_mobile: visitors_data[1],
                live_urls_hit: live_urls_hit,
                users_location: users_location,
                map: map,
                time_on_site_since_midnight: time_on_site_since_midnight,
                formated_time_on_site_since_midnight: formatDate(moment(moment({ seconds: time_on_site_since_midnight })))
            })
    })
    socket.on('broadcast_message', function (message, fn) { 
        io.of('track').emit('broadcast_message', message);
    })
}

function getVisitorsData(live_users_count, SocketsArray){
    new_visitors_count = returning_visitors_count = logged_in_visitos_count = desktop_count = mobile_count = 0 ;
    SocketsArray.forEach(function(socket) {
        if(socket.logged_in) logged_in_visitos_count+=1;
        else if(socket.returning) returning_visitors_count+=1;
        if(socket.handshake.headers['user-agent'].indexOf("Mobile") > -1) mobile_count+=1;
    });
    new_visitors_count =  live_users_count - returning_visitors_count - logged_in_visitos_count   
    desktop_count = live_users_count - mobile_count
    return [[ {label: "New Visitors", value: new_visitors_count}, 
             {label: "Returning Visitors", value: returning_visitors_count},
             {label: "Logged in visitors", value: logged_in_visitos_count} ], 
            [{label: "Desktop", value: desktop_count},
             {label: "Mobile", value: mobile_count}]
            ];
}

function format(i){
    return (i<10)? "0"+i : ""+i;
}

function formatMinutes(i){
    return format(i)+":30";
} 

function formatDate(time){
    return time.hour() + "H:" + time.minute()+"M";
}






/*
    socket.on('update_chart', function (name, fn) {      io=xHu6iLUThY4RomVgAAAA;   
        var new_visitors = returning_visitors = 0 ;
        date = new Date()
        date.setSeconds(date.getSeconds() - 6)
        _date = format(date.getHours())+":"+format(date.getMinutes())+":"+format(date.getSeconds())
        live_urls_hit = {}
        users_location = {}
        Visit.where({ end: {$gte: date} }).populate('visitor').exec(function (err, visits) {  
            for (var i = 0;i<visits.length;i++){
                if(visits[i].visitor.visits > 1) { returning_visitors+= 1 }
                else                             { new_visitors+= 1 }                
                live_urls_hit[visits[i].url] = live_urls_hit[visits[i].url] || 0
                live_urls_hit[visits[i].url] += 1
                country = visits[i].visitor.country || ""
                state = visits[i].visitor.state || ""
                city = visits[i].visitor.city || ""
                location = country+" - "+state+" - "+city
                users_location[location] = users_location[location] || 0
                users_location[location] += 1
            }     
            new_returning_visitors = [ {label: "New Visitors", value: new_visitors}, {label: "Returning Visitors", value: returning_visitors} ]
            fn({ date: _date, 
                count: visits.length, 
                new_returning_visitors: new_returning_visitors, 
                live_urls_hit: live_urls_hit, 
                users_location: users_location
            });
        })
    });
*/