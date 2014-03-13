var chai = require('chai'),
  expect = chai.expect,
  Binder = require('../../../code/firefox/js/binder');

function TestObject() {
}

TestObject.prototype = {
  method: function() {
    return 42;
  }
};

describe('Binder', function() {
  var testObject;
  beforeEach(function() {
    testObject = new TestObject();
  });
  it('should bind to method', function() {
    expect((Binder.bind(testObject, 'method'))()).to.eql(42);
  });
  it('should return the same function when unbinding', function() {
    expect(Binder.bind(testObject, 'method')).to.equal(Binder.unbind(testObject, 'method'));
  });
  it('should remove the binding when unbound', function() {
    Binder.bind(testObject, 'method');
    expect(Binder.unbind(testObject, 'method')).not.to.be.null;
    expect(Binder.unbind(testObject, 'method')).to.be.null;
  });
  it('should bind to an anonymous function', function() {
    var func = Binder.bindAnonymous(testObject, function() {
      expect(Binder.unbindAnonymous()).to.eql(func);
      expect(this).to.eql(testObject);
      return 42;
    });
    expect(func()).to.eql(42);
  });
});