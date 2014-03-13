/***********************************************************************
 * 
 *     This file is part of gRecipes.
 *
 *     gRecipes is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     gRecipes is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 * 
 *     You should have received a copy of the GNU General Public License
 *     along with gRecipes.  If not, see <http://www.gnu.org/licenses/>.
 * 
 **********************************************************************/
 
 
(function(window, grecipe, $, undefined) {
  
function onImportComplete_(recipe, resp) {
  if (grecipe.settings.openonsave) {
    grecipe.openTab(resp.entry.link[0].href);
  }
  
  var template = Handlebars.compile( $("#template_openmsg").html() );
  $('#message').html(template({
    title: resp.entry.title.$t,
    url: resp.entry.link[0].href,
  }));
};

$(function() {  
  if (grecipe.hasAuth()) {
    chrome.tabs.getSelected(null, function(tab) {
      $('#message').show();
      grecipe.importRecipe(tab.id).then(onImportComplete_);
    });
  } else {
    $('#permission_button').click(grecipe.authorize);
    $('#permission_msg').show();
  }
});

})(this, chrome.extension.getBackgroundPage().grecipe, jQuery);
