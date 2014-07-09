<?php ob_start();

/*
 * jQuery AssFileUploader : File Upload Plugin 1.0
 * https://github.com/codeass/AssUploader
 *
 * Copyright 2014, Kamran Wajdani
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
*/


class assuploader{
	
public $uploadpath = './';
public $uploadfilename = '';
 
//Check if directory
public function checkdir(){
	return is_dir($this->uploadpath);
}	

//Check if directory is not write able than make it writeable
public function chmoddir(){
	if(!is_writable($this->uploadpath)){
		chmod($this->uploadpath, 0777);
	}
}

/* getting file extension*/
public function fileextension($filename){
	$filename = explode(".", $filename);
	return end($filename);
}

/* getting file name*/
public function filename($filename){
	return str_replace(".","",basename($filename, $this->fileextension($filename)));
}

//Check if file with same name exist than update file name
public function getfilename(){
	if(file_exists($this->uploadpath.$this->uploadfilename)){
		$fn = $this->uploadfilename;
		$fext = $this->fileextension($fn);
		$fname = $this->filename($fn);
		$i = 1;		
		while(file_exists($this->uploadpath.$this->uploadfilename)){
			$this->uploadfilename = $fname.' ('.$i.').'.$fext;
			$i++;
		}
	}
	return $this->uploadfilename;	
}

public function uploadfile($FILES){
	if($this->checkdir()){
		$this->chmoddir();
		$this->getfilename();
		if(move_uploaded_file($FILES['file']['tmp_name'], $this->uploadpath.$this->uploadfilename)){
			echo json_encode(array('result' => 'ok', 'message' => 'File uploaded successfully.', 'filename' => $this->uploadfilename));	
		}else{
			echo json_encode(array('result' => 'failed', 'message' => 'We are unable to upload your file. Check your server configurations...'));	
		}
	}else{
		echo json_encode(array('result' => 'failed', 'message' => 'Upload path is incorrect. Provide a valid upload directory path.'));	
	}
}	

}

//Check if Valid XHR Request
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'){

$ass = new assuploader();
$ass->uploadpath = $_POST['uploadpath'];
$ass->uploadfilename = $_FILES['file']['name'];
$ass->uploadfile($_FILES);

// IS POST METHOD
}else{
	echo json_encode(array('result' => 'failed', 'message' => 'You are not authorized for this action...'));	
}

ob_flush();
?>
