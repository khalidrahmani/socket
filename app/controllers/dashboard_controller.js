var mongoose        = require('mongoose')
   ,Visit           = mongoose.model('Visit')    
   ,Visitor         = mongoose.model('Visitor')  
   ,MaxVisitors      = mongoose.model('MaxVisitors')  
   ,moment          = require('moment')
   ,async           = require("async")
   ,_               = require('underscore')
   ,geoip           = require('geoip-lite')
   ,users_location  = {}
   ,map             = []
   ,live_urls_hit   = {}
   ,graph_data      = []
   ,total_items_in_cart = 0
   ,allUsers = []
   ,midnight

exports.index = function (req, res) {	
	var  now = new Date()           
        ,month_visitors_peack = 0;
        graph_data = []
        hours = []
        hour     = now.getHours()
        time_on_site_since_midnight = 0

    Visitor.aggregate([{ $match : { cart: { $ne: 0 } }},{$group: {_id: "$id", count: { $sum: 1 }}}], function(err,results){        
        total_items_in_cart = results[0].count
        getGraphData(0, hour, function(){
            midnight = now.setHours(0, 0, 0, 0)
            var last_month = new Date()
            var second_month = new Date()
            last_month.setDate(1)
            second_month.setDate(1)
            second_month.setMonth(second_month.getMonth() - 1)

            MaxVisitors.aggregate([{$match: {date: {$gte: second_month, $lt: last_month}}}, 
                {$group: {_id: null, count: { $max: "$count" }}}], function(err,results){

            if(results[0]) month_visitors_peack = results[0].count

                Visit.find({ end: {$gte: midnight} }).exec(function (err, visits) {
                    for (var key in visits){
                        time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
                    } 
                    res.render('dashboard/index', {             
                        time_on_site_since_midnight: time_on_site_since_midnight, 
                        formated_time_on_site_since_midnight: formatDate(moment(moment({ seconds: time_on_site_since_midnight }))),
                        month_visitors_peack: month_visitors_peack,
                        graph_data: graph_data,
                        total_items_in_cart: total_items_in_cart
                    })
                }) 
            })
        })
    })
}

exports.track = function(socket, io){
    var visitor_ip          = socket.handshake.headers['x-forwarded-for']    
       ,url                 = socket.handshake.headers.referer
    //visitor_ip              = '107.4.145.158' // '197.247.236.119' // // ;
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
    if(query[0] != 'null') { 
        socket.logged_in = true; 
        socket.cart = query[2];
    }
    if(query[1] != 'null') { 
        socket.visitor_id = query[1];
        socket.returning = true; 
    }   
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
    allUsers.push(socket)
    date = moment().add(1, 'day').format("YYYY/MM/DD");
    MaxVisitors.findOne({date:  date}, function (err, maxvisitors){        
        if(maxvisitors){
            console.log(maxvisitors.date)
            if (allUsers.length > maxvisitors.count){
                maxvisitors.count = allUsers.length
                maxvisitors.save()
            }
        }
        else{
            MaxVisitors.create({date: date, count: allUsers.length}, function (err) {  })
        }
    })

    socket.on('disconnect', function () {
        console.log('disconnected')
        start_date = new Date(socket.handshake.time)
        mobile = (socket.handshake.headers['user-agent'].indexOf("Mobile") > -1)
        if(socket.cart){ 
            Visitor.update({_id : socket.visitor_id}, { cart: socket.cart }, function(){})            
        }
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
        date = new Date()
        _date = format(date.getHours())+":"+format(date.getMinutes())+":"+format(date.getSeconds())
        visitors_data  = getVisitorsData(live_users_count, allUsers)

        time_on_site_since_midnight = 0
        Visit.find({ end: {$gte: midnight} }).exec(function (err, visits) {
                    for (var key in visits){
                        time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
                    } 


        Visitor.aggregate([{ $match : { cart: { $ne: 0 } }},{$group: {_id: "$id", count: { $sum: 1 }}}], function(err,results){
            total_items_in_cart = results[0].count
            urls_hit_array = []
            for(var elmnt in live_urls_hit){ 
                if(live_urls_hit[elmnt]>0) urls_hit_array.push({url: elmnt, count: live_urls_hit[elmnt]})                
            }
            users_location_array = []
            for(var elmnt in users_location){ 
                if(users_location[elmnt]>0) users_location_array.push({country: elmnt, count: users_location[elmnt]})                
            }            
            fn({
                date: _date,    
                count: live_users_count,
                new_returning_visitors: visitors_data[0],
                desktop_mobile: visitors_data[1],
                live_urls_hit: _.sortBy(urls_hit_array, function(elmnt){ return (- elmnt.count); }),
                users_location: _.sortBy(users_location_array, function(elmnt){ return (- elmnt.count); }),
                map: map,
                time_on_site_since_midnight: time_on_site_since_midnight,
                formated_time_on_site_since_midnight: formatDate(moment(moment({ seconds: time_on_site_since_midnight }))),
                total_items_in_cart: total_items_in_cart
            })
        })
})

    })
    socket.on('broadcast_message', function (message, fn) { 
        io.of('track').emit('broadcast_message', message);
    })
}

function getVisitorsData(live_users_count, SocketsArray){
    new_visitors_count = returning_visitors_count = logged_in_visitos_count = desktop_count = mobile_count = 0 ;
    if(live_users_count == 0){
        new_visitors_count = returning_visitors_count = logged_in_visitos_count = desktop_count = mobile_count = 50 ;
    }
    else{

        SocketsArray.forEach(function(socket) {
            if(socket.logged_in) logged_in_visitos_count+=1;
            else if(socket.returning) returning_visitors_count+=1;
            if(socket.handshake.headers['user-agent'].indexOf("Mobile") > -1) mobile_count+=1;
        });
        new_visitors_count =  live_users_count - returning_visitors_count - logged_in_visitos_count   
        desktop_count = live_users_count - mobile_count
        desktop_count = parseInt(desktop_count/live_users_count*100)
        mobile_count  = 100 - desktop_count
    }
    
    return [[ {label: "New Visitors", value: new_visitors_count}, 
             {label: "Returning Visitors", value: returning_visitors_count},
             {label: "Logged in visitors", value: logged_in_visitos_count} ], 
            [{desktop: desktop_count+ " %", mobile: mobile_count+ " %"}]];
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

function getGraphData(start, hour, cb){
    if(hour >= start ){
        date = new Date() 
        date.setHours(start)
        date.setMinutes(0)
        date.setSeconds(0)
        Visit.find({start: {$lt: date}, end: {$gte: date}}, function (err, visits) {
            graph_data.push({"x": format(start), "value": visits.length});
            getGraphData(start+1, hour, cb)
        })
    }
    else cb()
}