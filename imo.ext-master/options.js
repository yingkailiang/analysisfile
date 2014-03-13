// Saves options to localStorage.
var once;
var perm;

//-------------------initialization of variables------------------ in local storage
function varCheck(){
	if(localStorage["once"] == undefined){
		localStorage["once"]=null;
	}
	
	if(localStorage["perm"] == undefined){
		localStorage["perm"]=null;
	}	
}

function save_options() {

  var o_style = $('#o_style');
  var o_video = $('#o_video');
  var o_offline = $('#o_offline');
  var o_bug1 = $('#o_bug1');
  
  console.log(o_style.is(':checked'));
  console.log(o_video.is(':checked'));
  console.log(o_offline.is(':checked'));
  console.log(o_bug1.is(':checked'));
  
  saveVar('o_style',o_style.is(':checked'));
  saveVar('o_video',o_video.is(':checked'));
  saveVar('o_offline',o_offline.is(':checked'));
  saveVar('o_bug1',o_bug1.is(':checked'));
  
  localStorage['once']=JSON.stringify(once);
  localStorage['perm']=JSON.stringify(perm);

  var status = document.getElementById("status");
  status.innerHTML = "Options Saved. Reload imo to take effect.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 2050);
}

function saveVar(id,value){
	localStorage[id]=JSON.stringify(value);
};

function getVar(id){
	if(localStorage[id] != null){
		return JSON.parse(localStorage[id]);
	}else{return null};
};

// Restores select box state to saved value from localStorage.
function restore_options() {
	var o_style = $('#o_style');
	var o_video = $('#o_video');
	var o_offline = $('#o_offline');
	var o_bug1 = $('#o_bug1');
	
	if(getVar('o_style')) o_style.attr('checked',true);
	if(getVar('o_video')) o_video.attr('checked',true);
	if(getVar('o_offline')) o_offline.attr('checked',true);
	if(getVar('o_bug1')) o_bug1.attr('checked',true);

	loadLists();
}

function loadLists(){
	once = JSON.parse(localStorage["once"]);
	perm = JSON.parse(localStorage["perm"]);
	
	var once_div = $('#once_list');
	var perm_div = $('#perm_list');
	var once_rembtn = $('#rem_once');
	var perm_rembtn =  $('#rem_perm');
	
	if (once != null){
		for (var i = 0, item; item = once[i]; i++) {
			var toAdd = $('<option id="'+item+'">'+item+'</option>');
			once_div.append(toAdd);
		}
	}
	
	if (perm != null){
		for (var i = 0, item; item = perm[i]; i++) {
			var toAdd = $('<option id="'+item+'">'+item+'</option>');
			perm_div.append(toAdd);
		}
	}
	
	//TODO aby sa po kliknuti na ten button to odstranilo (z listu i z premennej) a potom aby sa to sejvlo, ked sa klikne sejv button
	once_rembtn.click(function(){
		once.splice(once.indexOf(once_div.val()),1);
		once_div.find("#"+once_div.val()).remove();
	});
	
	perm_rembtn.click(function(){
		perm.splice(perm.indexOf(perm_div.val()),1);
		perm_div.find("#"+perm_div.val()).remove();
	});	
}

window.onload = function(){
varCheck();
$("body").ready(restore_options);
$("#submit").click(save_options);
}