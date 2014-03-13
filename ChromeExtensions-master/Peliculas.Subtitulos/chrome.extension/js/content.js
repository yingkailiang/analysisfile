Go = function(url_popup) 
{ 
	chrome.tabs.create({url: url_popup, "selected":false});
}

Go2 = function(url_popup,txt) 
{ 
	if(txt.length <= 0) { alert('Se tiene que definir texto para la busqueda!'); return false; }
	chrome.tabs.create({url: url_popup}); 
}

showComboSubtitulosES = function(Tags)
{
	// Representa el Select con Autocomplete
	$( "#tagsSubtitulosES" ).autocomplete({ 
		source: Tags, 
		minLength: 2, 
		select: function(event, ui) 
		{ 
			$('#tagsSubtitulosES').val(ui.item.label); 
			Go(ui.item.value); 
			return false;
		} 
	});
}

showComboEZTV = function(Tags)
{
	// Representa el Select con Autocomplete
	$( "#tagsEZTV" ).autocomplete({ 
		source: Tags, 
		minLength: 2, 
		select: function(event, ui) 
		{ 
			$('#tagsEZTV').val(ui.item.label); 
			Go(ui.item.value); 
			return false;
		} 
	});
}

ListarSubtitulosES = function()
{
	if(typeof(Storage)!=="undefined") 
	{ 
		var Tags_subtitulosES = new Array();
		var hoy  = new Date();
		var expirationDays = 7;
		var expiration = expirationDays * 60 * 24;
		var exp;
		if(localStorage.Expiracion_subtitulosES) { exp = new Date(parseInt(localStorage.Expiracion_subtitulosES)); }
		else                        			 { exp = new Date(); }
		exp.setMinutes(hoy.getMinutes()+expiration);
		if(hoy.getTime() > exp.getTime() || !localStorage.Expiracion_subtitulosES || !localStorage.Tags_subtitulosES) 
		{ 
			delete localStorage.Tags_subtitulosES;
			delete localStorage.Expiracion_subtitulosES;
			jQuery.ajax({
				url: "http://www.subtitulos.es/series",
				type: 'GET',
				async:   false,
				cache: false,
				error: function(e)
				{
					console.log("Recuperacion de datos erronea:", this);
				},
				success: function(res) 
				{
					var html  = res.responseText;
					var max   = jQuery(html).find('.version a').length;
					var domEl = jQuery(html).find('.version a');
					domEl.each(function() 
					{
						var href  = 'http://www.subtitulos.es' + $(this).attr('href');
						var label = $(this).text();
						if (href != undefined && href.length > 0 && label != undefined && label.length > 0) 
						{
							var valueToPush =  { };
							valueToPush.label = label;
							valueToPush.value = href;
							Tags_subtitulosES.push(valueToPush);
						}
					});
					localStorage.Expiracion_subtitulosES = exp.getTime();
					localStorage.Tags_subtitulosES = JSON.stringify(Tags_subtitulosES);  
					showComboSubtitulosES(Tags_subtitulosES);
				}
			});
		}
		else { showComboSubtitulosES(JSON.parse(localStorage.Tags_subtitulosES)); } 
	}
	else { alert('Su navegador no soporte HTML5.');  return false; }
}

ShowDate = function(ms) { 
  var now = new Date(parseInt(ms)); 
  var fmt = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDay() + ' ' + now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 
  return(fmt);
} 

ListarShowsEZTV = function()
{
	if(typeof(Storage)!=="undefined") 
	{ 
		var Tags_EZTV = new Array();
		var hoy  = new Date();
		var expirationDays = 7;
		var expiration = expirationDays * 60 * 24;
		var exp;
		if(localStorage.Expiracion_EZTV) { exp = new Date(parseInt(localStorage.Expiracion_EZTV)); }
		else                        	 { exp = new Date(); }
		
		var cached = ShowDate(exp.getTime());
		
		exp.setMinutes(hoy.getMinutes()+expiration);
		
		var nxtupdate = ShowDate(exp.getTime());
		
		jQuery('#idUpdated').html("<b>Cached:</b> "+cached+" -- <b>Netx Update:</b> "+nxtupdate);
		if(hoy.getTime() > exp.getTime() || !localStorage.Expiracion_EZTV || !localStorage.Tags_EZTV) 
		{ 
			delete localStorage.Tags_EZTV;
			delete localStorage.Expiracion_EZTV;
			jQuery.ajax({
				url: "http://eztv.it/showlist/",
				type: 'GET',
				async:   false,
				cache: false,
				error: function(e)	{ console.log("Recuperacion de datos erronea:", this); },
				success: function(res) 
				{
					var html  = res.responseText;
					var domEl = jQuery(html).find('.thread_link');
					var max   = domEl.length;
					domEl.each(function() 
					{
						var href  = 'http://eztv.it' + $(this).attr('href');
						var label = $(this).text();
						if (href != undefined && href.length > 0 && label != undefined && label.length > 0) 
						{
							var valueToPush =  { };
							valueToPush.label = label;
							valueToPush.value = href;
							Tags_EZTV.push(valueToPush);
						}
					});
					localStorage.Expiracion_EZTV = exp.getTime();
					localStorage.Tags_EZTV = JSON.stringify(Tags_EZTV);  
					showComboEZTV(Tags_EZTV);
				}
			});
		}
		else { showComboEZTV(JSON.parse(localStorage.Tags_EZTV)); } 
	}
	else { alert('Su navegador no soporte HTML5.');  return false; }
}

$(document).ready(function() 
{
	ListarSubtitulosES();
	ListarShowsEZTV();
	
	jQuery('#tagsEZTV').bind('keypress', function(e) {
		// event.preventDefault();
		jQuery("#tagsSubtitulosES").autocomplete( "search" , jQuery('#tagsEZTV').val() );
        // if(e.keyCode==13) { }
		
	});
	jQuery('#tagsSubtitulosES').bind('keypress', function(e) {
		// event.preventDefault();
		jQuery("#tagsEZTV").autocomplete( "search" , jQuery('#tagsSubtitulosES').val() );
        // if(e.keyCode==13) { }
		
	});
	
	
});
