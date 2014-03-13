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
// This has become http://recipes.bbclifestyle.com/

function getTitle() {
    return $('h1', $('#column-1')).first().text().trim();
}

function getSummary() {
	return 'Via <a href="'+document.URL+'">bbcfood.com</a><br>';
}

function getIngredients() {
	ingredients = $('#stages', $('#ingredients')).clone();
	$('.stage-title', ingredients).each( function() {
		if ( $(this).text().blank() ) {
			$(this).remove();
		} else {
			$(this).replaceWith($('<h3>' + $(this).text() + '</h3>'));
		}
	});
    return ingredients.html();
}

function getInstructions() {
	instructions = $('.instructions').clone();
	$('li', instructions).each( function() {
		$(this).replaceWith($(this).html());
	});
	$('p', instructions).after('<br />');
    return instructions.html();
}

function pageHasRecipe () {
    return ( $('body').hasClass('recipes-show') );
}
