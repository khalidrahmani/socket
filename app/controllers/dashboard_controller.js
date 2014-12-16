require("moment-duration-format");
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
   ,total_items_in_cart = 0
   ,allUsers            = {}
   ,midnight            = new Date().setHours(0, 0, 0, 0)  
   ,URL                 = require('url')

exports.index = function (req, res) {    
    tracking_url         = req.user.formatedwebsite_url    

	var month_visitors_peack = 0;
        hours = []
        hour     = new Date().getHours()
    var time_on_site_since_midnight = 0

        getGraphData([], 0, hour, tracking_url, function(graph_data){
            var last_month = new Date()
            var second_month = new Date()
            last_month.setDate(1)
            second_month.setDate(1)
            second_month.setMonth(second_month.getMonth() - 1)

            MaxVisitors.aggregate([{$match: {tracking_url: tracking_url, date: {$gte: second_month, $lt: last_month}}}, 
                {$group: {_id: null, count: { $max: "$count" }}}], function(err,results){
                month_visitors_peack = (results.length) ? results[0].count : 0;
                    res.render('dashboard/index', {             
                        time_on_site_since_midnight: time_on_site_since_midnight, 
                        formated_time_on_site_since_midnight: moment.duration(time_on_site_since_midnight, "seconds").format("M[M] W[W] d[days] H[hr] m[m]"),
                        month_visitors_peack: month_visitors_peack,
                        graph_data: graph_data
                })
        })
    })
}

exports.track = function(socket, io){
    var visitor_ip          = socket.handshake.headers['x-forwarded-for']    
       ,url                 = socket.handshake.headers.referer
       ,tracking_url        = URL.parse(url).hostname

    allUsers[tracking_url]      = allUsers[tracking_url] || []
    live_urls_hit[tracking_url] = live_urls_hit[tracking_url] || {}
    users_location[tracking_url] = users_location[tracking_url] || {}
    map[tracking_url] = map[tracking_url] || []

    //visitor_ip              = '107.4.145.158' // '197.247.236.119' // // ;
    var geo                 = geoip.lookup(visitor_ip);
    socket.geo = geo
    if(geo){
        country = geo.country+' '+geo.city
        map[tracking_url].push({ latLng: [geo.ll[0], geo.ll[1]], name: country })
        if(users_location[tracking_url][country]) users_location[tracking_url][country] += 1;
        else users_location[tracking_url][country] = 1;
    }
    if(live_urls_hit[tracking_url][url]) live_urls_hit[tracking_url][url] += 1;
    else live_urls_hit[tracking_url][url] =  1;
    
    query = socket.request._query.cookie    
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
        Visitor.create({ip: visitor_ip, tracking_url: tracking_url}, function(err, visitor){
            if(!err){
                socket.visitor_id = visitor.id
                socket.emit('visitor', visitor.id)   
            }
        })
    }
    //allUsers.push(socket)
    allUsers[tracking_url].push(socket)
    date = moment().add(1, 'day').format("YYYY/MM/DD");
    MaxVisitors.findOne({date:  date, tracking_url: tracking_url}, function (err, maxvisitors){        
        if(maxvisitors){
            console.log(maxvisitors.date)
            if (getUsersCount(allUsers[tracking_url]) > maxvisitors.count){
                maxvisitors.count = getUsersCount(allUsers[tracking_url])
                maxvisitors.save()
            }
        }
        else{
            MaxVisitors.create({date: date, tracking_url: tracking_url, count: getUsersCount(allUsers)}, function (err) {  })
        }
    })

    socket.on('disconnect', function () {
        console.log('disconnected')
        start_date = new Date(socket.handshake.time)
        mobile = (socket.handshake.headers['user-agent'].indexOf("Mobile") > -1)
        if(socket.cart){
            Visitor.update({_id : socket.visitor_id}, { cart: socket.cart }, function(){})            
        }
        Visitor.update({_id : socket.visitor_id}, { last_visit: new Date() }, function(){}) 
        Visit.create({visitor: socket.visitor_id, start: start_date, url: url, mobile: mobile, tracking_url: tracking_url}, function (err) {  })
        live_urls_hit[tracking_url][url] -= 1
        var i = allUsers[tracking_url].indexOf(socket)
        allUsers[tracking_url].splice(i, 1)
        if(socket.geo){      
            users_location[tracking_url][country] -= 1      
            for(key in map[tracking_url]){
                if(map[tracking_url][key].latLng[0] == socket.geo.ll[0] && map[tracking_url][key].latLng[1] == socket.geo.ll[1]){
                    console.log(map[tracking_url][key].latLng[0] + " =  " +  socket.geo.ll[0])
                    map[tracking_url].splice(key, 1)      
                }
            }             
        }

    });  
    socket.on('alert', function (message, fn) {        
        io.of('app').emit('alert', {message: message, tracking_url: tracking_url});
    })
}

exports.app = function(socket, io){    
    socket.on('update_chart', function (tracking_url, fn) {   
        var new_visitors = returning_visitors = 0
        var live_users_count = getUsersCount(allUsers[tracking_url])
        date = new Date()
        _date = format(date.getHours())+":"+format(date.getMinutes())+":"+format(date.getSeconds())
        visitors_data  = getVisitorsData(live_users_count, allUsers[tracking_url])
        time_on_site_since_midnight = visitors_data[2][0]['value'] 
        sales = 0          
        Visit.find({ tracking_url: tracking_url, start: {$gte: midnight} }).exec(function (err, visits) {
            for (var key in visits){
                time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
                if(visits[key].url.indexOf("cart/thankyou") > -1) { sales += 1 }
            }
            Visitor.count({tracking_url: tracking_url, last_visit: {$gt: midnight}}, function(err, count_visitors){            
                average_engagement = (count_visitors==0)? 0 : Math.round(time_on_site_since_midnight/count_visitors);
                Visitor.count({tracking_url: tracking_url, cart: { $ne: 0 }, last_visit: {$gt: midnight}}, function(err, count_visitors){      
                    total_items_in_cart = count_visitors
                    cart_abandonment = (total_items_in_cart/(sales+total_items_in_cart))*100
                    cart_abandonment = Math.round(cart_abandonment, 2);
                    cart_abandonment = cart_abandonment +"%"          
                    urls_hit_array = []
                    for(var elmnt in live_urls_hit[tracking_url]){ 
                        if(live_urls_hit[tracking_url][elmnt]>0) urls_hit_array.push({url: elmnt, count: live_urls_hit[tracking_url][elmnt]})                
                    }
                    users_location_array = []
                    for(var elmnt in users_location[tracking_url]){ 
                        if(users_location[tracking_url][elmnt]>0) users_location_array.push({country: elmnt, count: users_location[tracking_url][elmnt]})                
                    }            
                    fn({
                        date: _date,    
                        count: live_users_count,
                        new_returning_visitors: visitors_data[0],
                        desktop_mobile: visitors_data[1],
                        live_urls_hit: _.sortBy(urls_hit_array, function(elmnt){ return (- elmnt.count); }),
                        users_location: _.sortBy(users_location_array, function(elmnt){ return (- elmnt.count); }),
                        map: map[tracking_url],
                        time_on_site_since_midnight: time_on_site_since_midnight,
                        formated_time_on_site_since_midnight: moment.duration(time_on_site_since_midnight, "seconds").format("M[M] W[W] d[days] H[hr] m[m]"),
                        total_items_in_cart: total_items_in_cart,
                        cart_abandonment: cart_abandonment,
                        average_engagement: moment.duration(average_engagement, "seconds").format("M[M] W[W] d[days] H[hr] m[m] s[s]")
                    })
                })
            })
        })
    })
    socket.on('broadcast_message', function (message, fn) { 
        io.of('track').emit('broadcast_message', message);
    })
}

function getUsersCount(socketArray){
    var usersID = []
    for (var key in socketArray){
        socket = socketArray[key]
        if(usersID.indexOf(socket.visitor_id) == -1) usersID.push(socket.visitor_id)
    }
    return usersID.length
}

function getVisitorsData(live_users_count, SocketsArray){
    new_visitors_count = _time_on_site_since_midnight = returning_visitors_count = logged_in_visitos_count = desktop_count = mobile_count = 0 ;
    if(live_users_count == 0){
        new_visitors_count = returning_visitors_count = logged_in_visitos_count = desktop_count = mobile_count = 0 ;
    }
    else{
        var usersID = []
        SocketsArray.forEach(function(socket) {            
            if(usersID.indexOf(socket.visitor_id) == -1) {
                usersID.push(socket.visitor_id)
                if(socket.logged_in) logged_in_visitos_count+=1;
                else if(socket.returning) returning_visitors_count+=1;
                if(socket.handshake.headers['user-agent'].indexOf("Mobile") > -1) mobile_count+=1;
            }
            _time_on_site_since_midnight += moment().diff(moment(socket.handshake.time), 'seconds');
        });
        new_visitors_count =  live_users_count - returning_visitors_count - logged_in_visitos_count   
        desktop_count = live_users_count - mobile_count
        desktop_count = parseInt(desktop_count/live_users_count*100)
        mobile_count  = 100 - desktop_count
    }
    
    return [[ {label: "New Visitors", value: new_visitors_count}, 
             {label: "Returning Visitors", value: returning_visitors_count},
             {label: "Logged in visitors", value: logged_in_visitos_count}],
            [{desktop: desktop_count+ "%", mobile: mobile_count+ "%"}],
            [{label: "Total Engagement", value: _time_on_site_since_midnight}]
            ];
}

function format(i){
    return (i<10)? "0"+i : ""+i;
}

function formatMinutes(i){
    return format(i)+":30";
} 

function formatDate(time){
    return time.month() + " Month, " + time.week() + " Week, " + time.day() + " Day " + time.hour() + " H:" + time.minute()+"M";
}

function getGraphData(graph_data, start, hour, tracking_url, cb){
    if(hour >= start ){
        start_date = moment({ hour:start, minute:0, second: 0 });
        end_date   = moment({ hour: (start+1), minute:0, second: 0 });
        Visit.find({tracking_url: tracking_url, start: {$gt: start_date}, end: {$lt: end_date}}).distinct('visitor',
                      function(err, visits){                        
            graph_data.push({"x": format(start), "value": visits.length});
            getGraphData(graph_data, start+1, hour, tracking_url, cb)
        })
    }
    else cb(graph_data)
}