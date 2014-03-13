/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define console*/

define(['orion/Deferred'], function(Deferred) {
	/**
	 * Creates an Event Target
	 *
	 * @name orion.EventTarget
	 * @class Base for creating an Orion event target
	 */

	function EventTarget() {
		this._namedlisteners = {};
	}

	EventTarget.prototype = /** @lends orion.EventTarget.prototype */
	{
		/**
		 * Dispatches a named event along with an arbitrary set of arguments. Any arguments after <code>eventName</code>
		 * will be passed to the event listener(s).
		 * @param {String} eventName The event name
		 * @returns {Deferred} A deferred that resolves when all event listeners have been notified, and all async-aware
		 * listeners (if any) have resolved.
		 */
		dispatchEvent: function(eventName) {
			var listeners = this._namedlisteners[eventName];
			if (!listeners) {
				var d = new Deferred();
				d.resolve();
				return d;
			}

			var deferreds = [];
			for (var i = 0; i < listeners.length; i++) {
				try {
					var args = Array.prototype.slice.call(arguments, 1);
					var listenerDeferred = listeners[i].apply(null, args);
					if (listenerDeferred && typeof listenerDeferred.then === 'function') {
						deferreds.push(listenerDeferred);
					}
				} catch (e) {
					if (typeof console !== 'undefined') {
						console.log(e); // for now, probably should dispatch an ("error", e)
					}
				}
			}
			return Deferred.all(deferreds, function(e) {
				if (typeof console !== 'undefined') {
					console.log(e);
				}
			});
		},

		/**
		 * Adds an event listener for a named event
		 * @param {String} eventName The event name
		 * @param {Function} listener The function called when an event occurs
		 */
		addEventListener: function(eventName, listener) {
			this._namedlisteners[eventName] = this._namedlisteners[eventName] || [];
			this._namedlisteners[eventName].push(listener);
		},

		/**
		 * Removes an event listener for a named event
		 * @param {String} eventName The event name
		 * @param {Function} listener The function called when an event occurs
		 */
		removeEventListener: function(eventName, listener) {
			var listeners = this._namedlisteners[eventName];
			if (listeners) {
				for (var i = 0; i < listeners.length; i++) {
					if (listeners[i] === listener) {
						if (listeners.length === 1) {
							delete this._namedlisteners[eventName];
						} else {
							listeners.splice(i, 1);
						}
						break;
					}
				}
			}
		}
	};
	EventTarget.prototype.constructor = EventTarget;
	
	EventTarget.attach = function(obj) {
		var eventTarget = new EventTarget();
		obj.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
		obj.addEventListener = eventTarget.addEventListener.bind(eventTarget);
		obj.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
	};
	
	return EventTarget;
});