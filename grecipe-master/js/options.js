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

function on_revoke_button_click(event) {
  grecipe.unauthorize();
  event.target.disabled = true;
};

function on_opt_openonsave_click(event) {
  grecipe.settings.openonsave = event.target.checked;
};

function on_opt_sendanalytics_click(event) {
  grecipe.settings.sendanalytics = event.target.checked;
};

function on_reset_defaults_click(event) {
  if(confirm("Reset gRecipe Defaults?")) {
    grecipe.setDefaults();
    initUI();
  }
};

function initUI() {
  $('#revoke_button').attr("disabled", !grecipe.hasAuth());
  $('#opt_openonsave').attr("checked", grecipe.settings.openonsave);
  $('#opt_sendanalytics').attr("checked", grecipe.settings.sendanalytics);
};

$(function() {
  initUI();
  $("#revoke_button").click(on_revoke_button_click);
  $("#opt_openonsave").click(on_opt_openonsave_click);
  $("#opt_sendanalytics").click(on_opt_sendanalytics_click);
  $("#reset_defaults").click(on_reset_defaults_click);
  
});

})(window, chrome.extension.getBackgroundPage().grecipe, jQuery);
