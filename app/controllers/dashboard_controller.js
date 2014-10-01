var mongoose   = require('mongoose')
   ,Visit      = mongoose.model('Visit')    
   ,moment     = require('moment')
   ,_          = require('underscore')

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
    var remote_ip_address = socket.handshake.address;
    console.log(" ----------------------------------------------------------------------------");
    console.log(remote_ip_address);
	socket.on('update_chart', function (name, fn) {        
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
    socket.on('broadcast_message', function (message, fn) { 
        console.log(message)
        socket.broadcast.emit('broadcast_message', message);
    })
}

exports.broadcast = function (req, res) {
    socket.broadcast.send({message: "message"});
    res.json({message: " Message broadcasted ! "})
}

function format(i){
    return (i<10)? "0"+i : i;
}

function formatMinutes(i){
    return format(i)+":30";
} 
