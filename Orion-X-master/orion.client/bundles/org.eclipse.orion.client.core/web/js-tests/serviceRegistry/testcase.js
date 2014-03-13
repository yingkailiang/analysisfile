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
/*global define console setTimeout*/


define(["orion/assert", "orion/serviceregistry", "orion/EventTarget"], function(assert, mServiceRegistry, EventTarget) {
	var tests = {};
	tests.testRegisterAndGetService = function() {
		var count = 0;

		var registry = new mServiceRegistry.ServiceRegistry();
		var registration = registry.registerService("testRegister", {
			test : function() {
				return count + 1;
			}
		}, {
			test : 1
		});
		var reference = registration.getServiceReference();
		assert.equal("testRegister", reference.getProperty("service.names")[0]);
		assert.equal(1, reference.getProperty("test"));

		assert.equal(0, count);
		var service1 = registry.getService("testRegister");
		service1.test().then(function(newcount) {
			count = newcount;
		});

		assert.equal(1, count);

		var service2 = registry.getService(reference);
		service2.test().then(function(newcount) {
			count = newcount;
		});
		assert.equal(2, count);

		// contrived
		assert.equal(service1, service2);
		registration.unregister();
		assert.throws(function() {
			service2.test().then(function(newcount) {
				count = newcount;
			});
		});
		count++;
		assert.equal(3, count);
	};
	
	tests.testRegisterUnregisterMultipleServices = function() {
		var count = 0;
		var serviceRegistry = new mServiceRegistry.ServiceRegistry();
		
		assert.equal(serviceRegistry.getServiceReferences().length, 0);	
		var registration1 = serviceRegistry.registerService("testRegister", {
			test : function() {
				return count + 1;
			}
		}, {
			test : 1
		});
		assert.equal(serviceRegistry.getServiceReferences().length, 1);	
		
		var registration2 = serviceRegistry.registerService("testRegister", {
			test : function() {
				return count + 1;
			}
		}, {
			test : 2
		});
		assert.equal(serviceRegistry.getServiceReferences().length, 2);
		
		var registration3 = serviceRegistry.registerService("testRegister_different", {
			test : function() {
				return count + 1;
			}
		}, {
			test : 3
		});
		
		assert.equal(serviceRegistry.getServiceReferences("testRegister").length, 2);
		assert.equal(serviceRegistry.getServiceReferences("testRegister_different").length, 1);
		assert.equal(serviceRegistry.getServiceReferences().length, 3);
		
		registration1.unregister();
		assert.equal(serviceRegistry.getServiceReferences("testRegister").length, 1);
		assert.equal(serviceRegistry.getServiceReferences("testRegister_different").length, 1);
		assert.equal(serviceRegistry.getServiceReferences().length, 2);
		
		registration2.unregister();
		assert.equal(serviceRegistry.getServiceReferences("testRegister").length, 0);
		assert.equal(serviceRegistry.getServiceReferences("testRegister_different").length, 1);
		assert.equal(serviceRegistry.getServiceReferences().length, 1);
		
		registration3.unregister();
		assert.equal(serviceRegistry.getServiceReferences("testRegister").length, 0);
		assert.equal(serviceRegistry.getServiceReferences("testRegister_different").length, 0);
		assert.equal(serviceRegistry.getServiceReferences().length, 0);
		
	};

	tests.testEvents = function() {
		var count = 0;
		var serviceAddedCount = 0;
		var serviceRemovedCount = 0;
		var eventResult;

		var registry = new mServiceRegistry.ServiceRegistry();
		var sahandler = function() {
			serviceAddedCount++;
		};
		var srhandler = function() {
			serviceRemovedCount++;
		};
		registry.addEventListener("serviceAdded", sahandler);
		registry.addEventListener("serviceRemoved", srhandler);

		assert.equal(0, serviceAddedCount);
		assert.equal(0, serviceRemovedCount);
		var impl = {
			test : function() {
				return count + 1;
			}
		};
		var eventTarget = new EventTarget();
		impl.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
		impl.addEventListener = eventTarget.addEventListener.bind(eventTarget);
		impl.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);		
		
		var registration = registry.registerService(["testEvents"], impl);
		assert.equal(1, serviceAddedCount);
		assert.equal(0, serviceRemovedCount);

		var service = registry.getService(registration.getServiceReference());
		var eventHandler = function(result) {
			eventResult = result;
		};
		service.addEventListener("event", eventHandler);
		assert.equal(null, eventResult);
		impl.dispatchEvent("nonevent", "bad");
		assert.equal(null, eventResult);
		impl.dispatchEvent("event", "good");
		assert.equal("good", eventResult);
		service.removeEventListener("event", eventHandler);
		impl.dispatchEvent("event", "bad");
		assert.equal("good", eventResult);

		registration.unregister();
		assert.equal(1, serviceAddedCount);
		assert.equal(1, serviceRemovedCount);
	};

	return tests;
});
