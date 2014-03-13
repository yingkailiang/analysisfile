var DLQ = {};
DLQ.gitURL = "https://github.com/juzerali/Don-t-lose-your-query";
DLQ.issueURL = 'https://github.com/juzerali/Don-t-lose-your-query/issues';
DLQ.reviewURL = 'https://chrome.google.com/webstore/detail/ffimgldnoigmlcofmfkfcjechbdkipph/reviews?hl=en-GB';
var extension={};
 extension.getURL = chrome.extension?chrome.extension.getURL:require("self").data.url ;

(function( $ ) {
		$.widget( "ui.combobox", {
			_create: function() {
				var self = this,
					select = this.element.hide(),
					selected = select.children( ":selected" ),
					value = selected.val() ? selected.text() : "";
				var input = this.input = $( "<input>" )
					.insertAfter( select )
					.val( value )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: function( request, response ) {
							var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
							response( select.children( "option" ).map(function() {
								var text = $( this ).text();
								if ( this.value && ( !request.term || matcher.test(text) ) )
									return {
										label: text.replace(
											new RegExp(
												"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
											), "<strong>$1</strong>" ),
										value: text,
										option: this
									};
							}) );
						},
						select: function( event, ui ) {
							ui.item.option.selected = true;
							self._trigger( "selected", event, {
								item: ui.item.option
							});
						},
						change: function( event, ui ) {
							if ( !ui.item ) {
								var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
									valid = false;
								select.children( "option" ).each(function() {
									if ( $( this ).text().match( matcher ) ) {
										this.selected = valid = true;
										return false;
									}
								});
								if ( !valid ) {
									// remove invalid value, as it didn't match anything
									$( this ).val( "" );
									select.val( "" );
									input.data( "autocomplete" ).term = "";
									return false;
								}
							}
						}
					})
					.addClass( "ui-widget ui-widget-content ui-corner-left" );

				input.data( "autocomplete" )._renderItem = function( ul, item ) {
					return $( "<li></li>" )
						.data( "item.autocomplete", item )
						.append( "<a>" + item.label + "</a>" )
						.appendTo( ul );
				};

				this.button = $( "<button type='button'>&nbsp;</button>" )
					.attr( "tabIndex", -1 )
					.attr( "title", "Show All Items" )
					.insertAfter( input )
					.button({
						icons: {
							primary: "ui-icon-triangle-1-s"
						},
						text: false
					})
					.removeClass( "ui-corner-all" )
					.addClass( "ui-corner-right ui-button-icon" )
					.click(function() {
						// close if already visible
						if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
							input.autocomplete( "close" );
							return;
						}

						// work around a bug (likely same cause as #5265)
						$( this ).blur();

						// pass empty string as value to search for, displaying all results
						input.autocomplete( "search", "" );
						input.focus();
					});
			},

			destroy: function() {
				this.input.remove();
				this.button.remove();
				this.element.show();
				$.Widget.prototype.destroy.call( this );
			}
		});
	})( jQuery );


DLQ.History = [];
DLQ.getHistoryArray = function (length){
	var history = JSON.parse(localStorage['DLQHistory']);
	if(!length) length = 2000;
	history.length = history.length>length?length:history.length;
	return history;
}
DLQ.Mash = [];
var queryArray=[];
(function(){
	if(!localStorage["DLQclear"]){
		console.log("Trying to move");
		var map = prepareQueryArray();
		$.each(map, function(key,value){
			DLQ.Mash.push(value);
		});
		$.each(DLQ.Mash, function(i, el){
			if($.inArray(el, DLQ.History) === -1) DLQ.History.push(el);
		});
		localStorage.clear();
		localStorage["DLQclear"] = "true";
		localStorage["DLQHistory"] = JSON.stringify(DLQ.History);
	}
})();

DLQ.History = DLQ.getHistoryArray();


$(document).ready(function(){
	var $form = $("form")
	,	$textarea = $("textarea")
	,	$selectdb = $("select[name='db']");
	
	$form.submit(function(e){
		saveQuery();
		return true;
	});

	$selectdb.change(function(e){
		saveQuery();
		return true;
	})
	.combobox({delay: 0, autoFocus: true})
	.val()=="*"?$('input.ui-autocomplete-input').focus():$textarea.focus();;

	$textarea.attr({tabindex : 4, placeholder: "Press CTRL+Enter to execute Query"})
		.autocomplete({minLength : 3, autoFocus : false, source : DLQ.getHistoryArray()})
		.focus(function(e){
			var len = this.value.length*2;
			this.setSelectionRange(len,len);
			scroll(0,0);
		})	
		.keydown(function (e) {
			if (e.ctrlKey && e.keyCode == 13) {
				$form.submit();
			}
		});

	$("input.ui-autocomplete-input").attr({tabindex : '3'})
	.on("focus click", function(e){
		e.preventDefault();
		this.select();
	});
	
	var $tableres = $("table.res")
	,	$center = $('center')
	,	$sqldr = $('.sqldr')
	;
	if(!!$tableres.length){
		$tableres.removeClass('res').addClass('table table-striped table-bordered')
			.css('position', 'absolute')
			.wrap($('<div></div>', {id: 'tablewrap'}));
		$('#tablewrap').wrap($("<div></div>",{ id : 'tabbed'}));
		$('tr').removeClass('e').removeClass('o');
	}else if($center.length){
		$center.after($('<table/>',{'class':'res'}));
		$tableres.wrap($('<div></div>', {id: 'tablewrap'}));
		$('#tablewrap').wrap($("<div></div>",{ id : 'tabbed'}));
	}else{
		$sqldr.wrap($('<div></div>', {id: 'tablewrap'}));
		$("#tablewrap").wrap($("<div></div>",{ id : 'tabbed'}));
	}

	$("#tablewrap").addClass('tab-pane active')
	.wrap(
		$("<div></div>", {'id':'tab-content', 'class': 'tab-content'})
	);

	$("#tab-content").append(
			$("<div>", {id : "recent", 'class': 'tab-pane'})
            .append(
				$("<table/>",{
				    "class" : "queryHolder table table-striped table-bordered"
				} 
		)
	));
   
	$("#tabbed").addClass('tabbable')
	.prepend(
		 $("<ul>", {'class': 'nav nav-tabs'})
		 .append(
			$("<li>" ,{'class':'active'}).append($("<a>").attr({href : "#tablewrap", 'data-toggle': 'tab'}).text("Result"))
            .after($("<li>").append($("<a>").attr({href : "#recent", 'data-toggle': 'tab'}).text("Recent")))
                    .after($("<li>").append($("<a>").attr({href : "#meta", 'data-toggle': 'tab'}).text("Meta")))
             //)
        )
    );

	$('#tab-content').append($("<div>", {id : 'meta', 'class': 'tab-pane'})
                        .append($('<div>', {'class': ''})
								.append(
									$('<a/>', {'class':'btn btn-danger', 'href': DLQ.issueURL, 'target': '_blank'})
									.prepend($("<i>", {'class': 'icon icon-flag'})
									.after(" Report Bug")), "  ",
									$("<a/>",{'class': 'btn btn-success', href: DLQ.reviewURL, 'target': '_blank'})
									.prepend($("<i>", {'class': 'icon icon-pencil'})
									.after(" Write a Review"))
								)
                         )
                     );
	

	$("input:submit").attr({tabindex : 5}).addClass('btn btn-primary');
	$("input[name='Clear']").attr({tabindex : 6}).addClass('btn btn-warning');
	
	insertArrayIntoDOM();

	$('body').keypress(function(e){
		if(e.which == 47 && e.target.tagName.toLowerCase()!='textarea' /*&& e.target.role?e.target.role.toLowerCase()!='textbox':true*/){
			$textarea.focus(); 
			return false;
		}
		return true;
	});

	$('.delete').live('click',function(e){
		e.preventDefault();
		var tr = $(this).parent().parent('tr');
		tr.fadeOut('slow');
		DLQ.History = DLQ.getHistoryArray();
		DLQ.History.splice(tr.data('key'),1);
		localStorage["DLQHistory"] = JSON.stringify(DLQ.History);
		e.stopPropogation();
	}).css('cursor','pointer');



	$('.queryText').live('click',function(e){
		e.preventDefault();
		var text=$(this).text();
		$textarea.val(text).focus();
		if(e.ctrlKey) $form.submit();
		scroll(0,0);
	}).css('cursor','pointer');

	if(($err = $(".err")).text().length){
		$err.addClass('alert alert-error');
	}
});


function prepareQueryArray(){
	var that = this;
	function sortNumber(a,b)
		{
			return b - a;
		}

	var sortedArray=[];
	for(var i=0, ii=localStorage.length; i< ii; i++){
		sortedArray.push(localStorage.key(i));
	}
	sortedArray.sort(sortNumber);

	var sortedMap={};

	$.each(sortedArray, function(index,value){
		sortedMap[value] = localStorage[value];
		queryArray.push(sortedMap[value]);
	});
	//removeOld(sortedMap);
	return sortedMap;
	
}

function removeOld(){
	var i=0;
	
	saveQuery();
}

function saveQuery(){
	var query = $('textarea').val();
	if(!query || !query.length>0 || query=='undefined') {return;}
	DLQ.History = eval('('+localStorage['DLQHistory']+')');
	if(DLQ.History.length > 2000) DLQ.History.length = 2000;
	$.each(DLQ.History, function(key,value){
		if(!!value && value.toLowerCase() == query.toLowerCase()){
			DLQ.History.splice(key,1);
		}
	});
	DLQ.History.unshift(query);
	try{
		localStorage["DLQHistory"] = JSON.stringify(DLQ.History);
	}catch(e){
		console.Error(e);
		if(!deleted) DLQ.History.splice(DLQ.History.length-1-25, 25);
		else alert("Cannot add queries anymore. Report a bug at "+DLQ.gitURL);
		deleted = true;
		arguments.callee();
	}
}

function insertArrayIntoDOM(){
	var i =0;
	var eoBool = false;
	var eo = 'o';
	DLQ.History = DLQ.getHistoryArray();
	$(".queryHolder").append($("<tr>", {"class" : ""})
                        .append(
								$("<th>").text("Panel"),
								$("<th>").text("Recent Queries (Total "+DLQ.History.length+") ")
									.append($("<span/>", {'class': 'label label-info'}).text("'Ctrl + Left-Click' to execute"))
							)
                    );
		$.each(DLQ.History, function(key,value){
			eoBool = !eoBool;
			eo = eoBool?'e':'o';
			if(i==50) return;
			if(!!value && value!='undefined'){
				$(".queryHolder").append( $("<tr></tr>", {
                                                        //"class" : eo,
                                                        "data-key" : key
				                })
                                .append($('<td/>').append($("<a>",{
                                                                    "class" : "delete btn btn-danger",
																	rel : 'tooltip',
																	title: 'Delete',
																	href : '#'
															})
															.prepend(
																$("<i>", {'class': 'icon-trash'})
															)), 
                                        
                                        $("<td>",{"class" : "queryText"})
                                        .text(value).prepend(		
														)
                                )
                      )
                ;
				i++;
			}
		});
}