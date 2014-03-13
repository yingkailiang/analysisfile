/**
 * @author chaitanya
 */
var sync_count = 0;
var syncTimeout = 1000 * 2; // 1 second.
var notes;
var current_note;

function init() {
	notes = localStorage["notes"];
	
	//currently comma seperated notes
	notes = notes.split(",");
	current_note = notes[0];
	notes = notes.splice(1, notes.length);
	
	var notesDIV = document.getElementById("notes_area");
	notesDIV.value = localStorage[current_note];
}

function save_notes() {
	sync_count += 1;
	var notesDIV = document.getElementById("notes_area");
	var notes = notesDIV.value;
	localStorage[current_note] = notes;

	var syncStatusDIV = document.getElementById("savedbtn");
	syncStatusDIV.innerHTML = "save : " + sync_count;
}

function sync_note_online() {
}

function hideSyncStatus() {
	var syncStatusDIV = document.getElementById("saved_status");
	// syncStatusDIV.innerHTML = "not synced!";
	syncStatusDIV.style.display = none;
}

function container_notes() {
	var settings = document.getElementById("settings");
    settings.style.display = "none";

    var container = document.getElementById("container");
    container.style.display = "block";	
}

function settings_notes() {
	var settings = document.getElementById("settings");
    settings.style.display = "block";

    var container = document.getElementById("container");
    container.style.display = "none";
    
    showNotes();
}

window.addEventListener("load", function(e) {
	var settingsbtn = document.getElementById("settingsbtn");
	settingsbtn.addEventListener("click", settings_notes, false);

	var backbtn = document.getElementById("backbtn");
	backbtn.addEventListener("click", container_notes, false);
}, false);

function createnote() {
	var newnote = document.getElementById("notename");
	newnote = newnote.value;
	
	//append the new note to the global notes list.
	notes.push(newnote);
	localStorage["notes"] = notes.join(",");
	localStorage[newnote] = "";
}

function showNotes() {
	var notescontainer = document.getElementById("notescontainer");
	
	for (i=0; i<notes.length;i++) {
		var noteDiv = document.createElement("div");
		noteDiv.className = "note";
		
		var noteCheckbox = document.createElement("input");
		noteCheckbox.type = "checkbox";
		noteCheckbox.name = notes[i];
		noteCheckbox.id = notes[i];
		noteCheckbox.className = "note";
		
		var noteLabel = document.createElement("label");
//		noteLabel.for = notes[i];
		noteLabel.innerHTML = "  " + notes[i];
		
		noteDiv.appendChild(noteCheckbox);
		noteDiv.appendChild(noteLabel);
		
		notescontainer.appendChild(noteDiv);
	}
}
