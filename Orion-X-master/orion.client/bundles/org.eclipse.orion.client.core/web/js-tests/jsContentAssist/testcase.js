/*******************************************************************************
 * @license
 * Copyright (c) 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define orion */

define(["dojo", "orion/assert", "orion/editor/jsContentAssist"], function(dojo, assert, mContentAssist) {
	/**
	 * Helper function to invoke content assist on a given test case. The test case is a string that contains
	 * a special marker '@@@' indicating the cursor position. For example: "var x; x.@@@".
	 */
	function getKeywords(text) {
		var cursor = text.indexOf("@@@");
		if (cursor < 0) {
			assert.fail("Malformed js content assist test case: " + text);
			return;
		}
		var buffer = text.replace("@@@", "");
		//compute the prefix
		var index = cursor;
		var c;
		//prefix calculation logic copied from contentAssist.js
		while (index > 0 && ((97 <= (c=buffer.charCodeAt(index-1)) && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57))) { //LETTER OR UNDERSCORE OR NUMBER
			--index;
		}
		var prefix = buffer.substring(index, cursor);
		var context = { prefix: prefix };
		var assist = new mContentAssist.JavaScriptContentAssistProvider();
		return assist.computeProposals(buffer, cursor, context);
	}
	
	function print(proposals) {
		return proposals.map(function(proposal) {
			return proposal.proposal.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
		});
	}

	/**
	 * Asserts that a given proposal is present in a list of actual proposals. The test just ensures that an actual
	 * proposal starts with the expected value.
	 * @param expectedProposal {String} The expected proposal string
	 * @param actualProposals {Array} Array of string or Proposal objects
	 */
	function assertProposal(expectedProposal, actualProposals) {
		for (var i = 0; i < actualProposals.length; i++) {
			if (typeof(actualProposals[i].proposal) === "string" && actualProposals[i].proposal.indexOf(expectedProposal) === 0) {
				return;
			}
		}
		//we didn't find it, so fail
		assert.fail("Expected to find proposal \'" + expectedProposal + "\' in: " + print(actualProposals));
	}

	/**
	 * Asserts that a proposal is present in a list of actual proposals. The test ensures that some actual proposal contains
	 * all the required words and none of the prohibited words.
	 */
	function assertProposalMatching(/*String[]*/ required, /*String[]*/ prohibited, actualProposals) {
		function matches(text, word) {
			return text.indexOf(word) !== -1;
		}
		for (var i = 0; i < actualProposals.length; i++) {
			var proposal = actualProposals[i];
			if (typeof proposal.proposal !== "string") {
				continue;
			}
			var matchesProposal = matches.bind(null, proposal.proposal);
			if (required.every(matchesProposal) && !prohibited.some(matchesProposal)) {
				return;
			}
		}
		assert.fail("Expected to find proposal matching all of '" + required.join("','") + "' and none of '" + prohibited.join("','") + "' in: " + print(actualProposals));
	}

	/**
	 * Asserts that a given proposal is NOT present in a list of actual proposals.
	 */
	function assertNoProposal(expectedProposal, actualProposals) {
		for (var i = 0; i < actualProposals.length; i++) {
			if (typeof(actualProposals[i]) === "string" && actualProposals[i].indexOf(expectedProposal) === 0) {
				assert.fail("Did not expect to find proposal \'" + expectedProposal + "\' in: " + print(actualProposals));
			}
			if (typeof(actualProposals[i].proposal) === "string" && actualProposals[i].proposal.indexOf(expectedProposal) === 0) {
				assert.fail("Did not expect to find proposal \'" + expectedProposal + "\' in: " + print(actualProposals));
			}
		}
		//we didn't find it, so pass
	}
	
	/**
	 * Asserts that a proposal list contains all global functions available to all objects.
	 */
	function assertAllObjectProposals(actualProposals) {
		assertProposal("hasOwnProperty", actualProposals);
		assertProposal("isPrototypeOf", actualProposals);
		assertProposal("propertyIsEnumerable", actualProposals);
		assertProposal("toString", actualProposals);
		assertProposal("toLocaleString", actualProposals);
		assertProposal("valueOf", actualProposals);
	}

	/**
	 * Asserts that a proposal list contains all global functions available to all objects.
	 */
	function assertAllStringProposals(actualProposals) {
		assertProposal("charAt", actualProposals);
		assertProposal("charCodeAt", actualProposals);
		assertProposal("concat", actualProposals);
		assertProposal("indexOf", actualProposals);
		assertProposal("lastIndexOf", actualProposals);
		assertProposal("length", actualProposals);
		assertProposal("localeCompare", actualProposals);
		assertProposal("match", actualProposals);
		assertProposal("replace", actualProposals);
		assertProposal("search", actualProposals);
		assertProposal("slice", actualProposals);
		assertProposal("split", actualProposals);
		assertProposal("substring", actualProposals);
		assertProposal("toLowerCase", actualProposals);
		assertProposal("toLocaleLowerCase", actualProposals);
		assertProposal("toUpperCase", actualProposals);
		assertProposal("toLocaleUpperCase", actualProposals);
		assertProposal("trim", actualProposals);
	}
	
	var tests = {};
	/**
	 * Test accessing members on a variable that we can't infer the type of.
	 */
	tests.testUnknownVariableFunctions = function() {
		var result = getKeywords("var x; x.@@@");
		assertAllObjectProposals(result);
	};

	/**
	 * Test accessing members on a variable that we can't infer the type of, where there is a prefix
	 */
	tests.testUnknownVariableFunctionsWithPrefix = function() {
		var result = getKeywords("var x; x.to@@@");
		assertProposal("toString".substr(2), result);
		assertProposal("toLocaleString".substr(2), result);
		assertNoProposal("valueOf", result);
		assertNoProposal("hasOwnProperty", result);
		assertNoProposal("isPrototypeOf", result);
		assertNoProposal("propertyIsEnumerable", result);
	};

	/**
	 * Test that keyword suggestions are not made when looking for a member function or property.
	 */
	tests.testKeywordCompletionInVariableMember = function() {
		var result = getKeywords("var x; x.to@@@");
		assertNoProposal("case", result);
		assertNoProposal("switch", result);
		assertNoProposal("var", result);
		assertNoProposal("function", result);
	};

	/**
	 * Test accessing members on a variable that we can't infer the type of.
	 */
	tests.testUnknownArgumentFunctions = function() {
		var result = getKeywords("function x(a) {\n a.@@@");
		assertAllObjectProposals(result);
	};

	/**
	 * Test completion of control structure templates in the body of a function.
	 */
	tests.testTemplateInFunctionBody= function() {
		var result = getKeywords("function x(a) {\n @@@");
		assertNoProposal("toString", result);
		assertProposal("for", result);
		assertProposal("while", result);
		assertProposalMatching(["while", "(condition)"], ["do"], result); // while (condition) with no 'do'
		assertProposal("switch", result);
		assertProposalMatching(["switch", "case"], [], result); // switch..case
		assertProposal("try", result);
		assertProposal("if", result);
		assertProposalMatching(["if", "(condition)"], [], result); // if (condition)
		assertProposal("do", result);
		assertProposalMatching(["do", "while"], [], result); // do..while
	};

	/**
	 * Test completion of control structure templates in the body of a function.
	 */
	tests.testKeywordsInFunctionBodyWithPrefix= function() {
		var result = getKeywords("function x(a) {\n t@@@");
		assertNoProposal("toString".substr(1), result);
		assertProposal("this".substr(1), result);
		assertProposal("throw".substr(1), result);
		assertProposal("try".substr(1), result);
		assertProposal("typeof".substr(1), result);
		assertProposalMatching(["try {".substr(1), "catch ("], ["finally"], result); // try..catch with no finally
		assertProposalMatching(["try {".substr(1), "catch (", "finally"], [], result); // try..catch..finally
	};

	/**
	 * Test completion of control structure templates in the body of a function.
	 */
	tests.testTemplateInFunctionBodyWithPrefix= function() {
		var result = getKeywords("function x(a) {\n f@@@");
		assertNoProposal("toString", result);
		assertProposal("for".substr(1), result);
		assertProposalMatching(["for".substr(1), "in"], [], result);
		assertProposalMatching(["for".substr(1), "array"], [], result);
		assertNoProposal("while", result);
		assertNoProposal("switch", result);
		assertNoProposal("try", result);
		assertNoProposal("if", result);
		assertNoProposal("do", result);
	};
	/**
	 * Test that the String length property doesn't look like a function
	 */
	tests.testStringLengthProperty= function() {
		var result = getKeywords("\"Hello\".len@@@");
		assert.equal(result.length, 1);
		assert.equal(result[0].proposal, "length".substr(3));
	};

	/**
	 * Test that the String trim property looks like a function
	 */
	tests.testStringTrimMethod= function() {
		var result = getKeywords("\"Hello\".tr@@@");
		assert.equal(result.length, 1);
		assert.equal(result[0].proposal, "trim()".substr(2));
		assert.equal(result[0].description, "trim() - String");
	};

	/**
	 * Test that the Object toString property looks like a function
	 */
	tests.testObjectToStringMethod= function() {
		var result = getKeywords("\"Hello\".toS@@@");
		assert.equal(result.length, 1);
		assert.equal(result[0].proposal, "toString()".substr(3));
		assert.equal(result[0].description, "toString() - Object");
	};

	/**
	 * Test completion on a string literal.
	 */
	tests.testDoubleQuoteStringLiteral= function() {
		var result = getKeywords("\"Hello\".@@@");
		//string proposals
		assertAllStringProposals(result);
		
		//object proposals should still apply
		assertAllObjectProposals(result);
	};

	/**
	 * Test completion on a string literal.
	 */
	tests.testSingleQuoteStringLiteral= function() {
		var result = getKeywords("'Hello'.@@@");
		//string proposals
		assertAllStringProposals(result);
		
		//object proposals should still apply
		assertAllObjectProposals(result);
	};

	/**
	 * Test completion on a string literal with a prefix
	 */
	tests.testDoubleQuoteStringLiteralWithPrefix= function() {
		var result = getKeywords("\"Hello\".to@@@");
		assertProposal("toLowerCase".substr(2), result);
		assertProposal("toLocaleLowerCase".substr(2), result);
		assertProposal("toUpperCase".substr(2), result);
		assertProposal("toLocaleUpperCase".substr(2), result);
		assertProposal("toString".substr(2), result);
		assertProposal("toLocaleString".substr(2), result);
		assertNoProposal("valueOf", result);
		assertNoProposal("propertyIsEnumerable", result);
		assertNoProposal("trim", result);
	};
	
	/**
	 * Tests completion of function arguments.
	 */
	tests.testSimpleFunctionArgs = function() {
		var result = getKeywords("var x = function(abracadabra,blort) { \n ab@@@");
		assertProposal("abracadabra".substr(2), result);
		assertNoProposal("blort", result);
	};

	/**
	 * Tests completion of function arguments.
	 */
	tests.testFunctionArgsWithWhitespace = function() {
		var result = getKeywords("var x = function(  abracadabra ,  blort ) { \n blo@@@");
		assert.equal(result.length, 1);
		var value = result[0].proposal || result[0];
		assert.equal(value,"rt");
	};

	/**
	 * Tests completion of function arguments.
	 */
	tests.testFunctionArgsWithLineBreaks = function() {
		var result = getKeywords("var x = function(abracadabra,\n blort\n ) { \n blo@@@");
		assert.equal(result.length, 1);
		var value = result[0].proposal || result[0];
		assert.equal(value,"rt");
	};
	
	/**
	 * Tests variable declaration in current closure.
	 */
	tests.testVariableInCurrentClosure = function() {
		var result = getKeywords("var x = function(abracadabra,blort){\nvar abacus;\n ab@@@");
		assertProposal("abracadabra".substr(2), result);
		assertProposal("acus", result);
	};

	/**
	 * Try to trick the closure detection with a string containing the word function.
	 */
	tests.testVariableInFunctionWithStringContainingFunction = function() {
		var result = getKeywords("var x = function(abracadabra,blort){\nvar abacus = \"function() {\";\n ab@@@");
		assertProposal("abracadabra".substr(2), result);
		assertProposal("acus", result);
	};

	/**
	 * Try to trick the closure detection with a string containing the word function.
	 */
	tests.testRegexContainingFunction = function() {
		var result = getKeywords("var abacus;\n function x(block) {\n var ant = /^function[\\s(]/;\n } \n a@@@");
		assertProposal("abacus".substr(1), result);
		assertNoProposal("ant", result);
	};

	/**
	 * Try to trick the closure detection with a comment containing the word function.
	 */
	tests.testVariableInFunctionWithCommentContainingFunction = function() {
		var result = getKeywords("var x = function(abracadabra,blort){\nvar abacus; // function() { var absolute;\n ab@@@");
		assertProposal("abracadabra".substr(2), result);
		assertProposal("abacus".substr(2), result);
		assertNoProposal("absolute", result);
	};

	/**
	 * Try to trick the closure detection with a regular expression containing the word function.
	 */
	tests.testVariableInFunctionWithRegexContainingFunction = function() {
		var result = getKeywords("var x = function(abracadabra,blort){\nvar abacus = /function(){/;\n ab@@@");
		assertProposal("abracadabra".substr(2), result);
		assertProposal("acus", result);
	};


	/**
	 * Tests that we don't find an argument in a previous closure that we are not inside.
	 */
	tests.testVariableInOtherClosure = function() {
		var result = getKeywords("function(abracadabra,blort){\nvar abacus;\n}\n ab@@@");
		assertNoProposal("abracadabra", result);
		assertNoProposal("abacus", result);
	};

	/**
	 * Tests that we find arguments and variables in a parent function.
	 */
	tests.testVariableInParentClosure = function() {
		var result = getKeywords("function(abracadabra,blort){\nvar abacus;\n" +
			"function (antelope) { var aardvark; a@@@" +
			"}\n}");
		assertProposal("abracadabra".substr(1), result);
		assertProposal("abacus".substr(1), result);
		assertProposal("antelope".substr(1), result);
		assertProposal("aardvark".substr(1), result);
		assertNoProposal("blort", result);
	};

	/**
	 * Tests that we find a variable defined above a nested function.
	 */
	tests.testVariableBeforeOtherClosure = function() {
		var result = getKeywords("var antelope = x;\nfunction(abracadabra,blort){\nvar abacus;\n}\n a@@@");
		assertProposal("antelope".substr(1), result);
		assertNoProposal("abracadabra", result);
		assertNoProposal("abacus", result);
	};

	/**
	 * Tests variable declaration in a script with no closure.
	 */
	tests.testVariableNoClosure= function() {
		var result = getKeywords("var abacus;\n ab@@@");
		assertProposal("abacus".substr(2), result);
	};

	/**
	 * Tests variable declaration in a script with no closure.
	 */
	tests.testVariableAssignedToFunction= function() {
		//should not find contents of function, but should find variable assigned to it
		var result = getKeywords("var abacus = function(arctic, animal) { var aardvark;\n};\n a@@@");
		assertProposal("abacus".substr(1), result);
		assertNoProposal("arctic", result);
		assertNoProposal("animal", result);
		assertNoProposal("aardvark", result);
	};

	return tests;
});
