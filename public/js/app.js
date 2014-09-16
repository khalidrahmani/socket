$(document).ready(function(){	
	$('#copy_script').on('click',function(e) {
	    $("#script_tags").show('')	    
	}); 

	$('.ajax_submit').click(function (e) {
	        e.preventDefault()       
	        el = $(this) 	        
	        $.get(el.data("action"),{id: el.data("id")},
	        function(data){           
	           if(data.status === "updated") {             
	           	if(data.message === "inactive") {             
	           		el.text("active").removeClass("label-important").addClass("label-info")  
	           	}
	           	else {
	           		el.text("inactive").removeClass("label-info").addClass("label-important")  	
	           	}
	           }      
	        }, 'json')	        
    })

	$('.modal_open').on('click',function(e) {
		$.get($(this).data("url"),
	        function(data){
	        	$('#myModal').html(data);
	        	$('#myModal').modal('show');
	        })	
	    
	}); 	

	$(document).on('submit','#ajaxForm',function(e){
	   e.preventDefault()      
	   $.post("/phones/update",$( "#ajaxForm" ).serialize(),
	        function(data){           
	           if(data.type == "success"){
	           		$('#myModal').modal('hide');
	           		$("#"+data.phone.number).html(data.phone.destinationNumber);
	           }
	           else if(data.type == "error"){
	           		$.each (data.errors, function (error) {
	           			$("#"+error).after("<span class='help-inline'>"+data.errors[error].message+"</span>");
                       	$("#"+error).parent().parent().addClass("error")  					    
					});
	           }
	        }, 'json') 
	});
	$(function () { $("[data-toggle='tooltip']").tooltip(); });

	$('.list').change(function(){		
        form = $(this).closest("form")
        form.submit()
    });
    
    $('.datepicker').datepicker();
});