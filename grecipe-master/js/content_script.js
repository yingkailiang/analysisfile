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

(function(window, chrome, undefined) {

var debug_ = false,
    grrs_;

function log_() {
  if (debug_) {
    log_.history = log_.history || [];
    log_.history.push(arguments);
    console.log.apply(console, arguments);
  }
};
  
function onMessage_(msg) {
  log_("gRecipe Msg:", msg);
  switch (msg.type) {
    case "loadgrrs":
      loadGrrs_(msg.grrs);
      break;
    case "getrecipe":
      getRecipe_(msg.grrId);
      break;
    case "debug":
      if (!msg.debug) log_("Debug turned off.");
      debug_ = !!msg.debug;
      log_("Debug turned on.");
      break;
  }
};

function loadGrrs_(grrs) {
  grrs_ = grrs.map(unwrap_).map(grrify_).filter(checkGrr_);

  if (grrs_.length) {
    port.postMessage({
      type: "hasrecipe",
      grrs: grrs_,
    });
  }
};

function unwrap_(grr) {
  try {
    var unwraped = (new Function("return ("+grr.script+");"))();
    grr = $.extend(unwraped, grr);
    delete grr.script;
  } catch(e) {
    log_("%s (While loading grr %s)", e, grr.name, grr);
    console.trace();
  }
  return grr;
};

function grrify_(obj) {
  obj.__proto__ = Grr.prototype;
  obj.__super = Grr;
  obj.constructor();
  return obj;
};

function checkGrr_(grr) {
    try {
      if (grr.hasRecipe()) {
        log_("Has recipe:", grr.name, grr);
        return true;
      } else {
        log_("Rejected grr:", grr.name, grr);
        return false;
      }
    } catch (e) {
      log_("Error checking grr %s:", grr.name, e, grr);
      console.trace();
      return false;
    }
};

function getRecipe_(grrId) {
  if (!grrs_.length) return;
  
  var grr;
  if (grrId == undefined) {
    grr = grrs_[0];
  } else {
    for(var i=0; i<grrs_.length; i++) {
      if (grrId == grrs_[i].id) {
        grr = grrs_[i];
        break;
      }
    }
  }
  if (grr == undefined) return;
  
  try {
    port.postMessage({
      type: "recipe",
      recipe: grr.makeRecipe(),
    });
  } catch (e) {
    log_("%s (While making recipe from %s)", e, grr.name, grr, e.stack);
    console.trace();
  }
};

function Grr() {};
Grr.prototype.getName =
Grr.prototype.getRecipeType =
Grr.prototype.getPhoto =
Grr.prototype.getPublished =
Grr.prototype.getSummary =
Grr.prototype.getReview =
Grr.prototype.getPrepTime =
Grr.prototype.getCookTime =
Grr.prototype.getTotalTime =
Grr.prototype.getNutrition =
Grr.prototype.getInstructions =
Grr.prototype.getYield =
Grr.prototype.getIngredients =
Grr.prototype.getAuthor =
Grr.prototype.getClosing = 
function() {return undefined;};

Grr.prototype.hasRecipe = function() {return false;};

Grr.prototype.makeRecipe = function() {
  return {
    name: this.getName(),
    recipeType: this.getRecipeType(),
    photo: this.getPhoto(),
    published: this.getPublished(),
    summary: this.getSummary(),
    review: this.getReview(),
    prepTime: this.getPrepTime(),
    cookTime: this.getCookTime(),
    totalTime: this.getTotalTime(),
    nutrition: this.getNutrition(),
    instructions: this.getInstructions(),
    yield: this.getYield(),
    ingredients: this.getIngredients(),
    author: this.getAuthor(),
    closing: this.getClosing(),
    host: location.host,
    url: location.href,
  };
};

var port = chrome.extension.connect({name: "grecipe"});
port.onMessage.addListener(onMessage_);

var blank_;
String.prototype.empty = function() {
  blank_ = blank_ || /^\s*$/;
  return blank_.test(this.toString());
};

var white_;
String.prototype.reduce = function() {
  white_ = white_ || /\s+/g;
  return this.toString().replace(white_, ' ').trim();
};

})(this, this.chrome);
