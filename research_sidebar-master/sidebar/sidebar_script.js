//Window.postMessage listener
window.addEventListener("message", function(event){
	if(event.data.URL)
		website_URL = event.data.URL;
});

//TEMPORARY - number of notes in sidebar
var num_notes = 0;

//URL of webpage;
var website_URL;

window.onload=function(){
	initialize();
	num_notes++;
	add_note(num_notes, "Apple", "An apple is a fruit.", "http://www.apple.com/");
}

function initialize(){
	var add_note_button = document.getElementById("add_note_button");
	add_note_button.onclick=function(){
		num_notes++;
		add_note(num_notes);
	}
	parent.postMessage({action: "send_URL"}, "*");
}

function add_note(index, header, body, note_URL) {
	
	var note_section = document.getElementById("note_section");
	
	var note = document.createElement("DIV");
	note.id = "note"+index;
	note.className = "note";
	
	//Creates structure of note
	note.innerHTML = "<textarea class='note_header' rows='1' cols='21' maxlength='24' placeholder='Header'></textarea><button type='button' class='close_button'>X</button><button type='button' class='info_button'>?</button><div class='note_break'></div><div class='note_info'></div><textarea class='note_body' placeholder='. . .'></textarea><div class='note_ghost'><div><br><br>";
	
	var close_button = note.getElementsByClassName("close_button")[0];
	
	//Delete note when close_button is clicked
	close_button.onclick=function(){
		delete_note(note.id);
	}
	
	var info_button = note.getElementsByClassName("info_button")[0];
	
	//Toggle info section when info_button is clicked
	info_button.onclick=function(){
		show_info(note.id);
	}
	
	var note_header = note.getElementsByClassName("note_header")[0];
	if(header)
		note_header.innerHTML = header;
	
	var note_info = note.getElementsByClassName("note_info")[0];
	
	var URL;
	if(note_URL){
		URL = note_URL;
	}else{
		URL = website_URL;
	}
	var hostname = URL.substr(URL.indexOf('//')+2, URL.indexOf('/', URL.indexOf('//')+2)-(URL.indexOf('//')+2));
	
	note_info.innerHTML = "URL: <a href='#'>"+hostname+"</a>";

	//Sets link to send message to load URL on main page
	note_info.getElementsByTagName("a")[0].onclick = function(){
		parent.postMessage({action: "load_URL", URL: URL}, "*");
	}
	
	var note_body = note.getElementsByClassName("note_body")[0];
	var note_ghost = note.getElementsByClassName("note_ghost")[0];
	
	if(body){
		note_body.value = body;
		note_ghost.innerHTML = body;
		note_body.style.height = note_ghost.offsetHeight;
	}
	
	note_ghost.style.display="none";
	
	//Update note_ghost and height of note_body when user types in note_body
	note_body.addEventListener("input",function(){
		note_ghost.innerHTML = note_body.value;
		note_ghost.style.display="";
		note_body.style.height = note_ghost.offsetHeight;
		note_ghost.style.display="none";
	});

	note_section.appendChild(note);
}

function set_contents(index, dataArr) {

}

function get_contents(index) {

}

function save_notes() {

}

//BUTTON FUNCTIONS
function show_info(note_id) {
	var info = document.getElementById(note_id).getElementsByClassName("note_info")[0];
	if(info.style.display == "none" || info.style.display == "") {
		info.style.display = "block";
	} else {
		info.style.display = "none";
	}
}

function delete_note(note_id) {
	console.log(note_id);
	var note = document.getElementById(note_id);
	note.parentNode.removeChild(note);
}