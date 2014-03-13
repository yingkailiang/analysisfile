var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  assert = sinon.assert,
  jsm = require('../utils/jsm'),
  nsIChannel = require('../mocks/components').nsIChannel,
  nsIURI = require('../mocks/components').nsIURI,
  Services = require('../mocks/Services.js').Services;

Require = jsm.load('../../../code/firefox/modules/Require.jsm').Require;

describe('Require', function() {
  var requireFunc;
  beforeEach(function() {
    requireFunc = Require.createRequireForWindow({}, new nsIURI('resource://ancho/123'));
  });
  it('should search in the global and local node_modules directories', function() {
    var newChannelFromURI = sinon.spy(Services.io, 'newChannelFromURI');
    var channelOpen = sinon.stub(nsIChannel.prototype, 'open');
    channelOpen.throws();

    requireFunc('module', new nsIURI('resource://ancho/123/ABCD'));

    sinon.assert.calledWithMatch(newChannelFromURI, { spec: 'resource://ancho/123/node_modules/module.js' });
    sinon.assert.calledWithMatch(newChannelFromURI, { spec: 'resource://ancho/123/ABCD/node_modules/module.js' });
    sinon.assert.neverCalledWithMatch(newChannelFromURI, { spec: 'resource://ancho/123/ABCD/module.js' });
  });
});