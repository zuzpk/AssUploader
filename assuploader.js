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
	var assify = this;
	var ass = $.extend({
			formats: ['jpg','bmp','gif','png'],
			maxsize: 2,
			border: '1px #07F solid',
			radius: '2px',
			padding: '10px', 
			uploadurl: '',
			uploadpath: './files/',
			asstarget: ''
	}, options);
	
	//Create the Default form
	var _form = '<div id="assuploaderdropbox" ' 		+'style="position:absolute;top:1px;right:1px;bottom:1px;left:1px;background:rgba(255,255,255,0.9);'
	+'text-align:center;font-family:sans-serif, arial, tahoma;font-size:14px;font-weight:bold;color:#999999;display:none;'
	+'padding-top:13px;z-index:2;">Drop Files Here!</div>'
	+'<div id="assuploaderfileinfo" '
	+'style="position:absolute;top:1px;right:1px;bottom:1px;left:1px;background:rgba(255,255,255,1);text-align:left;font-family:sans-serif,' +'arial, tahoma;font-size:14px;font-weight:bold;color:#999999;display:none;z-index:1;padding:7px 10px;"><div id="asstitle"></div>'
	+'<div id="assinfo" style="font-weight:normal;font-size:12px;"></div></div>'
	+'<input type="file" id="assuploaderfile">'
	+'<div id="asserror" style="font-weight:bold;color:#FD3535;font-family:sans-serif,arial,tahoma;font-size:14px;display:none;margin-top:5px;"></div>'
	+ '<div id="assprogressbar" style="position:absolute;overflow:hidden;bottom:0px;left:0px;right:0px;height:4px;border-top: '+ass.border+';display:none;z-index:5;"><div id="assbar" style="background:#09F;height:5px;width:0%;"></div></div>';
	this.html(_form);	
	this.css({
		border: ass.border,
		padding: ass.padding,
		position: 'relative'
	});
	
	//Handle the Drag and drop First
	//var dropbox = this; 
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
     	//For now only single upload
     	
     	
     	//We need to send dropped files to Server
     	//handleFileUpload(files,this);
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
			$("#assuploaderfileinfo div#asstitle").html(file.name);
        	if(parseInt(sizeKB) > 1024){  var sizeMB = sizeKB/1024;  sizeStr = sizeMB.toFixed(2)+" MB";  }
        	else{  sizeStr = sizeKB.toFixed(2)+" KB"; }
 			var filesinfo = 'Size: '+sizeStr;
 			$("#assuploaderfileinfo div#assinfo").html(filesinfo);
 			$("#assuploaderfileinfo").fadeIn(200); 	
 			
 			//Now Upload the file
 			handleFileUpload(file, assify);
 		}
	}
	
	function handleFileUpload(files,obj){
		var fd = new FormData();
        fd.append('file', files);
        fd.append('uploadpath', ass.uploadpath);
        _assprogress.show();   
        sendFileToServer(fd, status);
	}

	function sendFileToServer(formData,status){
    var extraData ={}; //Extra Data.
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
                        }
                        //Set progress
                        var progressBarWidth = percent * _assprogress.width() / 100;  
                        _assprogress.find('div').animate({ width: progressBarWidth }, 200); //.html(progress + "% ");
                        //status.setProgress(percent);
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
        	//console.log(data);
        	var json = $.parseJSON(data);
        	if(data.result=="failed"){
        		_input.removeAttr("disabled");
        		$("#asserror").html(json.message).fadeIn(300);
				$("#assuploaderfileinfo, #assuploaderdropbox").fadeOut(200); 	
				assify.css({ border: "1px solid #FFC8C8", background: "#FFE9E9"});
        		_assprogress.hide();
        	}else{
        		$("#"+ass.asstarget).attr("value", json.filename);
        		_assprogress.find('div').css("background", "#73EB78");
        		_assprogress.find('div').animate({ width: '100%'}, 200); 
        	}
        },
        error: function(){
        	_assprogress.find('div').css("background", "#EB7373");
        	_assprogress.find('div').animate({ width: '100%'}, 200); //.html(progress + "% "); 
        }
    }); 

	}
 
	return this;
}

}(jQuery));
