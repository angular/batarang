// these tests run in node even though
// that's kind of a silly thing to do ¯\_(ツ)_/¯

var throttle = require('./throttle');

// TOOD: solve this like a real engineer
// cuz jasmine doesn't patch Date.now
var temporalPatchification = (function () {
  var dateConst = Date.now();
  var originalDateNow = Date.now;
  var originalJasmineTick = jasmine.Clock.tick;
  function dateNowPatchify () {
    Date.now = function () {
      return dateConst;
    };
    jasmine.Clock.tick = function (ticks) {
      dateConst += ticks;
      return originalJasmineTick(ticks);
    };
  }

  function dateNowDepatchify () {
    Date.now = originalDateNow;
    jasmine.Clock.tick = originalJasmineTick;
  }

  return function patchify (fn) {
    return function () {
      var returns;
      dateNowPatchify();
      returns = fn();
      dateNowDepatchify();
      return returns;
    };
  };
}());

describe('throttle', function() {

  var delegate;

  beforeEach(function () {
    jasmine.Clock.useMock();
    delegate = jasmine.createSpy('delegate');
  });

  describe('when the timeout is zero', function () {
    var wrapped;

    beforeEach(function () {
      wrapped = throttle(delegate, 0);
    });

    it('should return the delegate when timeout is zero', function() {
      expect(wrapped).toBe(delegate);
    });

    it('should immediately call the delegate when timeout is zero', function() {
      wrapped();
      expect(delegate).toHaveBeenCalled();
    });
  });

  describe('when the timeout is non-zero', function () {
    var wrapped;

    beforeEach(function () {
      wrapped = throttle(delegate, 100);
    });

    it('should call the delegate immediately', function() {
      wrapped();
      expect(delegate).toHaveBeenCalled();
    });

    it('should call the delegate once with the same args', function() {
      wrapped(1);
      wrapped(1);
      expect(delegate.callCount).toBe(1);
    });

    it('should call the delegate again after the timeout', temporalPatchification(function() {
      wrapped(1);
      expect(delegate.callCount).toBe(1);

      jasmine.Clock.tick(101);
      wrapped(1);
      expect(delegate.callCount).toBe(2);
    }));

    it('should call the delegate immediately with different args', function() {
      wrapped(1);
      expect(delegate).toHaveBeenCalledWith(1);
      wrapped(2);
      expect(delegate).toHaveBeenCalledWith(2);
    });
  });


});
