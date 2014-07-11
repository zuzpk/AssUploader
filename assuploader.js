/*
 * jQuery AssFileUploader : File Upload Plugin 1.0
 * https://github.com/codeass/AssUploader
 *
 * Copyright 2014, Kamran Wajdani
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function( $ ) {
	
$.fn.assuploader = function(options){
	//Default Settings
	var assify = this, assified = 0, prevass = 0, speedass = false, speed = 0, total = 0, remainingBytes = 0, timeRemaining = 0;
	var ass = $.extend({
			formats: ['jpg','bmp','gif','png'],
			maxsize: 2,
			debug: false,
			border: '1px #07F solid',
			radius: '2px',
			padding: '10px', 
			uploadurl: '',
			uploadpath: './files/',
			asstarget: '',
			showspeed: false,
			complete: function(){}
	}, options);
	
	//Create the Default form
	var _form = '<div id="assuploaderdropbox" ' 		+'style="position:absolute;top:1px;right:1px;bottom:1px;left:1px;background:rgba(255,255,255,0.9);'
	+'text-align:center;font-family:sans-serif, arial, tahoma;font-size:14px;font-weight:bold;color:#999999;display:none;'
	+'padding-top:13px;z-index:2;">Drop Files Here!</div>'
	+'<div id="assuploaderfileinfo" '
	+'style="position:absolute;top:1px;right:1px;bottom:1px;left:1px;background:rgba(255,255,255,1);text-align:left;font-family:sans-serif,' +'arial, tahoma;font-size:14px;font-weight:bold;color:#999999;display:none;z-index:1;padding:7px 10px;"><span id="asstitle"></span>'
	+' <span id="assinfo" style="font-weight:normal;font-size:12px;"></span></div>'
	+'<input type="file" id="assuploaderfile">'
	+'<div id="asserror" style="font-weight:bold;color:#FD3535;font-family:sans-serif,arial,tahoma;font-size:14px;display:none;margin-top:5px;"></div><div id="assuploadspeed" style="display:none;color:#777;z-index:2;position:absolute;right:10px;bottom:10px;"></div>'
	+ '<div id="assprogressbar" style="position:absolute;overflow:hidden;bottom:0px;left:0px;right:0px;height:4px;border-top: '+ass.border+';display:none;z-index:5;"><div id="assbar" style="background:#09F;height:5px;width:0%;"></div></div>';
	this.html(_form);	
	this.css({
		border: ass.border,
		padding: ass.padding,
		position: 'relative'
	});
	
	//Handle the Drag and drop First
	this.on('dragenter', function(e){
    	e.stopPropagation();		e.preventDefault();
    	$("#assuploaderdropbox").fadeIn(200);
	});
	this.on('dragover', function(e){
     	e.stopPropagation();     e.preventDefault();
	});
	this.on('mouseleave', function(e){
    	e.stopPropagation();		e.preventDefault();
    	$("#assuploaderdropbox").fadeOut(200);
	});
	this.on('drop', function (e){
 		$("#assuploaderdropbox").fadeOut(200);
		e.preventDefault();
     	assInfo(e.originalEvent.dataTransfer.files[0]);
	});
	$(document).on('dragenter', function (e){
		e.stopPropagation();     e.preventDefault();
	});
	$(document).on('dragover', function (e){
		e.stopPropagation();     e.preventDefault();
	});
	$(document).on('drop', function (e){
		e.stopPropagation();     e.preventDefault();
	});
	
	var _input = $("#assuploaderfile");
	_input.on("change", function(){
		if(_input.attr('value')!=""){
			assInfo(_input[0].files[0]);
		}
	});
	
	var _assprogress = $("#assprogressbar");
	function assInfo(file){
		$("#asserror").fadeOut(200);
		var ext = file.name.split('.').pop().toLowerCase();
		var sizeKB = file.size/1024;
		if($.inArray(ext, ass.formats) == -1){
			var fors = ass.formats.toString().replace("[", "").replace("]", "").replace("'", "");
			$("#asserror").html('Only '+fors+' are allowed...').fadeIn(300);
			$("#assuploaderfileinfo, #assuploaderdropbox").fadeOut(200); 	
			assify.css({ border: "1px solid #FFC8C8", background: "#FFE9E9"});
		}else if((sizeKB / 1024)>ass.maxsize){
			$("#asserror").html('You can upload a file upto '+ass.maxsize+'MB in size...').fadeIn(300);
			$("#assuploaderfileinfo, #assuploaderdropbox").fadeOut(200); 	
			assify.css({ border: "1px solid #FFC8C8", background: "#FFE9E9"});
		}else{
			_input.attr("disabled", "true");
 			assify.css({ border: ass.border, background: "#FFFFFF"});
			$("#assuploaderfileinfo span#asstitle").html(file.name);
        	if(parseInt(sizeKB) > 1024){  var sizeMB = sizeKB/1024;  sizeStr = sizeMB.toFixed(2)+" MB";  }
        	else{  sizeStr = sizeKB.toFixed(2)+" KB"; }
 			var filesinfo = '('+sizeStr+')';
 			$("#assuploaderfileinfo span#assinfo").html(filesinfo);
 			$("#assuploaderfileinfo").fadeIn(200); 	
 			
 			//Upload the file
 			handleFileUpload(file, assify);
 		}
	}
	
	function UploadSpeed(){
		//speed
		speed = assified - prevass;
		prevass = assified;
		var speedStr;
		if(parseInt(speed) > 1024){  
			speed = speed / 1024;
			if(speed>=1024){
				speedStr = speed+' mb / sec';
			}else{
				speedStr = speed + ' kb / sec';
			}
		} 
		$("#assuploadspeed").html(speedStr);
	}
	
	function handleFileUpload(files,obj){
		var fd = new FormData();
        fd.append('file', files);
        fd.append('uploadpath', ass.uploadpath);
        _assprogress.show();
        $("#assuploadspeed").show();   
        if(ass.showspeed){ speedass = setInterval(UploadSpeed, 1000); }
        sendFileToServer(fd, status);
	}

	function sendFileToServer(formData,status){
    var extraData ={};
    var jqXHR=$.ajax({
            xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                    xhrobj.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                            assified = event.loaded;
                        }
                        var progressBarWidth = percent * _assprogress.width() / 100;  
                        _assprogress.find('div').animate({ width: progressBarWidth }, 500);
                    }, false);
                }
            return xhrobj;
        },
    	url: ass.uploadurl,
    	type: "POST",
    	contentType:false,
    	processData: false,
        cache: false,
        data: formData,
        success: function(data){
        	$("#assuploadspeed").hide();
        	if(ass.debug){ console.log(data); }
        	var json = $.parseJSON(data);
        	if(data.result=="failed"){
        		_input.removeAttr("disabled");
        		$("#asserror").html(json.message).fadeIn(300);
				$("#assuploaderfileinfo, #assuploaderdropbox").fadeOut(200); 	
				assify.css({ border: "1px solid #FFC8C8", background: "#FFE9E9"});
        		_assprogress.hide();
        	}else{
        		$("#"+ass.asstarget).val(json.filename);
        		_assprogress.find('div').css("background", "#73EB78");
        		_assprogress.find('div').animate({ width: '100%'}, 500);
        		clearInterval(speedass); 
        		ass.complete();
        	}
        },
        error: function(){
        	_assprogress.find('div').css("background", "#EB7373");
        	_assprogress.find('div').animate({ width: '100%'}, 500);
        }
    }); 

	}
 
	return this;
}

}(jQuery));
