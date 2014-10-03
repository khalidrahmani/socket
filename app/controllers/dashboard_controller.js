var mongoose        = require('mongoose')
   ,Visit           = mongoose.model('Visit')    
   ,moment          = require('moment')
   ,_               = require('underscore')
   ,geoip           = require('geoip-lite')
   ,users_locations = {};

var allUsers = [];
exports.index = function (req, res) {	
	var  now = new Date()
        ,time_on_site_since_midnight = 0
        ,visitors_data = []
        ,mounth_visitors_peack = 0;

    /*
        hour     = now.getHours()
        minutes  = now.getMinutes()       
        for (i = 0; i <= hour; i++){
            visitors_data.push({"x": format(i), "value": i*2})
            if(i != hour || minutes > 30) visitors_data.push({"x": formatMinutes(i), "value": i*2})
        }
    */    
    /*for (var i = 0; i < 30; i++) {
        start =   now.setDays(now.getDays()-i);
        end   =   now.setDays(now.getDays()-i-1);
        Visit.count({ start: {$gte: start}, end: {$lt: end} }).exec(function (err, count) {
            max_count = (count > max_count)? count : max_count;
        })
    };
    */

    midnight = now.setHours(0, 0, 0, 0)
    var last_month = new Date();
    last_month.setMonth(last_month.getMonth() - 1);
    mvp = [];    
    Visit.find({ start: {$gte: last_month} }).exec(function (err, visits) {
        for (var i = 0;i<visits.length;i++){
            index = visits[i].start.getDay()+"-"+visits[i].start.getMonth()
            mvp[index] = mvp[index] || 0;
            mvp[index] += 1;
            if(mvp[index] > mounth_visitors_peack ) mounth_visitors_peack = mvp[index]
        }        
        Visit.find({ end: {$gte: midnight} }).exec(function (err, visits) {
            for (var key in visits) {
                time_on_site_since_midnight   +=  moment(visits[key].end).diff(moment(visits[key].start), 'seconds');
            } 
            time_on_site_since_midnight = moment(moment({ seconds: time_on_site_since_midnight }));
            time_on_site_since_midnight = time_on_site_since_midnight.hour() + "H:" + time_on_site_since_midnight.minute()+"M";
        	res.render('dashboard/index', {            	
                time_on_site_since_midnight: time_on_site_since_midnight,
                mounth_visitors_peack: mounth_visitors_peack
        	})
    	})
    })  
}

exports.respond = function(socket){  
    var visitor_ip        = socket.handshake.headers['x-forwarded-for'];
    var url               = socket.handshake.headers.origin;
    var browser_type      = (socket.handshake.headers['user-agent'].indexOf("Mobile") > -1) ? 'Mobile' : 'Desktop';
    console.log('----------------------------------------------------------------');
    var geo = geoip.lookup(visitor_ip);
    console.log(geo);
    country = geo.country
    users_location[country] = users_location[country] || 0
    users_location[country] += 1;
    query = socket.request._query.cookie
    console.log(query)
    query = query.split('|')    
    var logged_in = true;
    var returning = true;
    if(query[0] == 'null') {logged_in = false; console.log('not logged in');}
    if(query[1] == 'null') {returning = false; console.log('new'); }    
    allUsers.push(socket);
    socket.on('disconnect', function () {
        console.log('disconnected')
        var i = allUsers.indexOf(socket)
        users_location[country] -= 1;
        allUsers.splice(i, 1)        
    });
    
    console.log(allUsers.length)
    socket.on('update_chart', function (name, fn) {
      var new_visitors = returning_visitors = 0 ;
        date = new Date()
        date.setSeconds(date.getSeconds() - 6)
        _date = format(date.getHours())+":"+format(date.getMinutes())+":"+format(date.getSeconds())
        new_returning_visitors = [ {label: "New Visitors", value: 15}, {label: "Returning Visitors", value: 75} ]       
        fn({    date: _date, 
                count: allUsers.length, 
                new_returning_visitors: new_returning_visitors, 
                live_urls_hit: {}, 
                users_location: users_location
            });

    });
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
    socket.on('broadcast_message', function (message, fn) { 
        console.log(message)
        socket.broadcast.emit('broadcast_message', message);
    })
}
/*
exports.broadcast = function (req, res) {
    socket.broadcast.send({message: "message"});
    res.json({message: " Message broadcasted ! "})
}
*/
function format(i){
    return (i<10)? "0"+i : i;
}

function formatMinutes(i){
    return format(i)+":30";
} 
