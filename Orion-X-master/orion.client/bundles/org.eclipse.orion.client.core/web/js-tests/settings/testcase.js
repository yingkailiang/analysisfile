/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define*/
define(['orion/assert', 'orion/Deferred', 'orion/testHelpers', 'orion/serviceregistry', 'orion/metatype', 'orion/settings/settingsRegistry'],
		function(assert, Deferred, testHelpers, mServiceRegistry, mMetaType, SettingsRegistry) {
	var SETTING_SERVICE = 'orion.core.setting';
	var METATYPE_SERVICE = 'orion.cm.metatype';

	var serviceRegistry, metaTypeRegistry, settingsRegistry;
	var setUp = function(storage) {
		var d = new Deferred();
		serviceRegistry = new mServiceRegistry.ServiceRegistry();
		metaTypeRegistry = new mMetaType.MetaTypeRegistry(serviceRegistry);
		settingsRegistry = new SettingsRegistry(serviceRegistry, metaTypeRegistry);
		d.resolve();
		return d;
	},
	tearDown = function() {
		serviceRegistry = null;
		metaTypeRegistry = null;
	},
	makeTest = testHelpers.makeTest.bind(null, setUp, tearDown);

	var tests = {};
	tests['test setting refs existing ObjectClass'] = makeTest(function() {
		serviceRegistry.registerService(METATYPE_SERVICE, {},
			{	classes: [
					{	id: 'myclass',
						properties: [
							{	id: 'prop1' },
							{	id: 'prop2' }
						]
					}
				]
			});
		var serviceRegistration = serviceRegistry.registerService(SETTING_SERVICE, {},
			{	settings: [
					{	pid: 'mysetting',
						classId: 'myclass'
					}
				]
			});
		var settings = settingsRegistry.getSettings();
		assert.equal(settings.length, 1);
		assert.equal(settings[0].getPid(), 'mysetting');
		assert.equal(settings[0].getObjectClassId(), 'myclass');
		assert.equal(settings[0].getName(), null);
		var objectClass = metaTypeRegistry.getObjectClassForPid('mysetting');

		assert.equal(objectClass.getId(), 'myclass', 'ObjectClass is designated for setting\'s PID');
		assert.equal(objectClass.getPropertyTypes().length, 2);
		assert.equal(objectClass.getPropertyTypes()[0].getId(), 'prop1');
		assert.equal(objectClass.getPropertyTypes()[1].getId(), 'prop2');

		// Ensure setting.getPropertyTypes() has the same property types as the OCD.
		assert.equal(settings[0].getPropertyTypes().length, 2);
		assert.equal(settings[0].getPropertyTypes()[0].getId(), 'prop1');
		assert.equal(settings[0].getPropertyTypes()[1].getId(), 'prop2');

		serviceRegistration.unregister();
		assert.equal(settingsRegistry.getSettings().length, 0);
		assert.ok(!metaTypeRegistry.getObjectClassForPid('mysetting'), 'ObjectClass no longer designated for PID');
	});
	tests['test setting with implicit MetaType'] = makeTest(function() {
		var serviceRegistration = serviceRegistry.registerService(SETTING_SERVICE, {},
			{	settings: [
					{	pid: 'mysetting',
						name: 'My great setting',
						properties: [
							{	id: 'foo' },
							{	id: 'bar' }
						]
					}
				]
			});

		var settings = settingsRegistry.getSettings();
		assert.equal(settings.length, 1);
		assert.equal(settings[0].getPid(), 'mysetting');
		assert.equal(settings[0].getName(), 'My great setting');
		var objectClassId = settings[0].getObjectClassId();
		var objectClass = metaTypeRegistry.getObjectClassForPid('mysetting');
		assert.ok(objectClass, 'Setting\'s PID is designated');

		assert.equal(objectClass.getId(), objectClassId);
		assert.equal(objectClass.getPropertyTypes().length, 2);
		assert.equal(objectClass.getPropertyTypes()[0].getId(), 'foo');
		assert.equal(objectClass.getPropertyTypes()[1].getId(), 'bar');

		assert.equal(settings[0].getPropertyTypes().length, 2);
		assert.equal(settings[0].getPropertyTypes()[0].getId(), 'foo');
		assert.equal(settings[0].getPropertyTypes()[1].getId(), 'bar');

		serviceRegistration.unregister();
		assert.equal(settingsRegistry.getSettings().length, 0);
		assert.ok(!metaTypeRegistry.getObjectClassForPid('mysetting'), 'Setting\'s PID no longer designated');
		assert.ok(!metaTypeRegistry.getObjectClass(objectClassId), 'ObjectClass was removed');
	});
	return tests;
});